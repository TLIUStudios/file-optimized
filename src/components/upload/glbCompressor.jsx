/**
 * GLB Compressor - Pure JavaScript, no WASM required.
 *
 * Strategy:
 * 1. Parse GLB (header + JSON chunk + BIN chunk)
 * 2. Compress embedded textures (images stored as bufferViews) using Canvas API
 * 3. Re-pack the BIN buffer with compressed image data
 * 4. Strip extras/names from JSON to save space
 * 5. Re-serialize back to GLB
 */

const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_JSON = 0x4e4f534a; // "JSON"
const CHUNK_BIN  = 0x004e4942; // "BIN\0"

function parseGLB(buffer) {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error('Not a valid GLB file');

  let offset = 12;
  let jsonData = null;
  let binData  = null;

  while (offset < buffer.byteLength) {
    const chunkLen  = view.getUint32(offset,     true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkBuf  = buffer.slice(offset + 8, offset + 8 + chunkLen);
    offset += 8 + chunkLen;

    if (chunkType === CHUNK_JSON) jsonData = chunkBuf;
    else if (chunkType === CHUNK_BIN) binData = chunkBuf;
  }

  if (!jsonData) throw new Error('No JSON chunk in GLB');
  const json = JSON.parse(new TextDecoder().decode(jsonData));
  return { json, bin: binData };
}

function buildGLB(json, bin) {
  const jsonStr   = JSON.stringify(json);
  const jsonBytes = new TextEncoder().encode(jsonStr);
  const jsonPad   = (4 - (jsonBytes.length % 4)) % 4;
  const jsonTotal = jsonBytes.length + jsonPad;

  const hasBin  = bin && bin.byteLength > 0;
  const binU8   = hasBin ? new Uint8Array(bin) : null;
  const binPad  = hasBin ? (4 - (binU8.length % 4)) % 4 : 0;
  const binTotal = hasBin ? binU8.length + binPad : 0;

  const totalLen = 12 + 8 + jsonTotal + (hasBin ? 8 + binTotal : 0);
  const out = new ArrayBuffer(totalLen);
  const dv  = new DataView(out);
  const u8  = new Uint8Array(out);

  // Header
  dv.setUint32(0, GLB_MAGIC, true);
  dv.setUint32(4, 2, true);
  dv.setUint32(8, totalLen, true);

  // JSON chunk
  let pos = 12;
  dv.setUint32(pos, jsonTotal, true); pos += 4;
  dv.setUint32(pos, CHUNK_JSON, true); pos += 4;
  u8.set(jsonBytes, pos);
  u8.fill(0x20, pos + jsonBytes.length, pos + jsonTotal); // pad with spaces
  pos += jsonTotal;

  // BIN chunk
  if (hasBin) {
    dv.setUint32(pos, binTotal, true); pos += 4;
    dv.setUint32(pos, CHUNK_BIN,  true); pos += 4;
    u8.set(binU8, pos);
    u8.fill(0x00, pos + binU8.length, pos + binTotal);
  }

  return out;
}

/**
 * Compress a single image bufferView using Canvas.
 * Returns new Uint8Array of compressed JPEG/WebP data, or null if it fails.
 */
async function compressImageBufferView(binBuffer, bv, quality = 0.75) {
  try {
    const slice = new Uint8Array(binBuffer, bv.byteOffset, bv.byteLength);
    const blob  = new Blob([slice], { type: bv.mimeType || 'image/jpeg' });
    const url   = URL.createObjectURL(blob);

    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload  = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    URL.revokeObjectURL(url);

    const canvas = document.createElement('canvas');
    canvas.width  = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);

    // Prefer WebP, fall back to JPEG
    const mimeOut = 'image/webp';
    const dataUrl = canvas.toDataURL(mimeOut, quality);
    const base64  = dataUrl.split(',')[1];
    const binary  = atob(base64);
    const bytes   = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // Only use if actually smaller
    return bytes.length < slice.length ? { bytes, mimeType: mimeOut } : null;
  } catch {
    return null;
  }
}

/**
 * Strip extras and names to reduce JSON size.
 */
function stripExtras(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripExtras);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'extras') continue;
    out[k] = stripExtras(v);
  }
  return out;
}

export async function compressGLB(file) {
  const arrayBuffer = await file.arrayBuffer();
  const { json, bin } = parseGLB(arrayBuffer);

  // If no BIN buffer, just strip extras and return
  if (!bin || bin.byteLength === 0) {
    const stripped = stripExtras(json);
    return new Blob([buildGLB(stripped, null)], { type: 'model/gltf-binary' });
  }

  // Find image bufferViews
  const imageBufferViewIndices = new Set();
  (json.images || []).forEach(img => {
    if (img.bufferView != null) imageBufferViewIndices.add(img.bufferView);
  });

  if (imageBufferViewIndices.size === 0) {
    // No embedded images — just strip extras and repack
    const stripped = stripExtras(json);
    return new Blob([buildGLB(stripped, bin)], { type: 'model/gltf-binary' });
  }

  // Compress each image and rebuild BIN buffer
  const bvList = json.bufferViews || [];
  const compressed = {}; // bvIndex -> { bytes, mimeType }

  await Promise.all(
    [...imageBufferViewIndices].map(async (bvIdx) => {
      const bv = bvList[bvIdx];
      if (!bv) return;
      const result = await compressImageBufferView(bin, bv);
      if (result) compressed[bvIdx] = result;
    })
  );

  if (Object.keys(compressed).length === 0) {
    // No compression gains — just strip extras
    const stripped = stripExtras(json);
    return new Blob([buildGLB(stripped, bin)], { type: 'model/gltf-binary' });
  }

  // Rebuild BIN buffer: lay out all bufferViews sequentially
  // First pass: calculate new offsets
  const newOffsets = new Array(bvList.length);
  let cursor = 0;

  // We need to lay out ALL bufferViews (not just images) in order
  // Sort by original byteOffset to maintain data order
  const sortedBVIndices = bvList
    .map((bv, i) => ({ i, bv }))
    .filter(({ bv }) => bv.buffer === 0 || bv.buffer == null) // only buffer 0
    .sort((a, b) => (a.bv.byteOffset || 0) - (b.bv.byteOffset || 0));

  const segments = [];
  for (const { i, bv } of sortedBVIndices) {
    // Align to 4 bytes
    const align = (4 - (cursor % 4)) % 4;
    cursor += align;
    newOffsets[i] = cursor;

    if (compressed[i]) {
      segments.push({ data: compressed[i].bytes, bvIdx: i });
      cursor += compressed[i].bytes.length;
    } else {
      const originalSlice = new Uint8Array(bin, bv.byteOffset, bv.byteLength);
      segments.push({ data: originalSlice, bvIdx: i });
      cursor += bv.byteLength;
    }
  }

  const newBinSize = cursor;
  const newBin = new ArrayBuffer(newBinSize);
  const newBinU8 = new Uint8Array(newBin);

  for (const seg of segments) {
    const offset = newOffsets[seg.bvIdx];
    newBinU8.set(seg.data, offset);
  }

  // Patch JSON: update bufferViews
  const newJson = JSON.parse(JSON.stringify(json)); // deep clone
  (newJson.bufferViews || []).forEach((bv, i) => {
    if ((bv.buffer === 0 || bv.buffer == null) && newOffsets[i] !== undefined) {
      bv.byteOffset = newOffsets[i];
      if (compressed[i]) {
        bv.byteLength = compressed[i].bytes.length;
      }
    }
  });

  // Update image mimeTypes
  (newJson.images || []).forEach(img => {
    if (img.bufferView != null && compressed[img.bufferView]) {
      img.mimeType = compressed[img.bufferView].mimeType;
    }
  });

  // Update buffer total size
  if (newJson.buffers?.[0]) {
    newJson.buffers[0].byteLength = newBinSize;
  }

  // Strip extras
  const finalJson = stripExtras(newJson);

  return new Blob([buildGLB(finalJson, newBin)], { type: 'model/gltf-binary' });
}