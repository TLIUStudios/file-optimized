/**
 * Pure JS GLB optimizer — no WASM/Draco required.
 *
 * GLB format:
 *   [12-byte header] [JSON chunk] [optional BIN chunk]
 *
 * Optimizations applied:
 *  1. Strip all extras / extensions from JSON (cameras, emissiveFactor defaults, etc.)
 *  2. Remove unused nodes, meshes, accessors, bufferViews, materials, textures, images, samplers
 *  3. Compact / re-pack the binary buffer (remove gaps between bufferViews)
 *  4. Re-serialise JSON with minimal whitespace
 */

const GLB_MAGIC = 0x46546c67;  // "glTF"
const JSON_CHUNK = 0x4e4f534a;  // "JSON"
const BIN_CHUNK  = 0x004e4942;  // "BIN\0"

function readGLB(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error('Not a valid GLB file');

  let offset = 12; // skip header
  let jsonChunk = null;
  let binChunk  = null;

  while (offset < arrayBuffer.byteLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType   = view.getUint32(offset + 4, true);
    const chunkData   = arrayBuffer.slice(offset + 8, offset + 8 + chunkLength);
    offset += 8 + chunkLength;

    if (chunkType === JSON_CHUNK) jsonChunk = chunkData;
    else if (chunkType === BIN_CHUNK) binChunk = chunkData;
  }

  if (!jsonChunk) throw new Error('No JSON chunk found in GLB');

  const json = JSON.parse(new TextDecoder().decode(jsonChunk));
  return { json, binBuffer: binChunk };
}

function writeGLB(json, binBuffer) {
  const jsonStr   = JSON.stringify(json);
  // JSON chunk must be 4-byte aligned, padded with spaces
  const jsonBytes = new TextEncoder().encode(jsonStr);
  const jsonPad   = (4 - (jsonBytes.length % 4)) % 4;
  const jsonChunkLen = jsonBytes.length + jsonPad;

  const hasBin = binBuffer && binBuffer.byteLength > 0;
  const binBytes  = hasBin ? new Uint8Array(binBuffer) : null;
  const binPad    = hasBin ? (4 - (binBytes.length % 4)) % 4 : 0;
  const binChunkLen = hasBin ? binBytes.length + binPad : 0;

  const totalLen = 12                        // GLB header
    + 8 + jsonChunkLen                        // JSON chunk header + data
    + (hasBin ? 8 + binChunkLen : 0);         // BIN chunk header + data

  const out  = new ArrayBuffer(totalLen);
  const view = new DataView(out);
  const u8   = new Uint8Array(out);

  // GLB header
  view.setUint32(0, GLB_MAGIC, true);
  view.setUint32(4, 2, true);               // version 2
  view.setUint32(8, totalLen, true);

  // JSON chunk
  let pos = 12;
  view.setUint32(pos, jsonChunkLen, true);    pos += 4;
  view.setUint32(pos, JSON_CHUNK,   true);    pos += 4;
  u8.set(jsonBytes, pos);
  // pad with spaces (0x20)
  for (let i = 0; i < jsonPad; i++) u8[pos + jsonBytes.length + i] = 0x20;
  pos += jsonChunkLen;

  // BIN chunk
  if (hasBin) {
    view.setUint32(pos, binChunkLen, true);   pos += 4;
    view.setUint32(pos, BIN_CHUNK,   true);   pos += 4;
    u8.set(binBytes, pos);
    // pad with zeros
    for (let i = 0; i < binPad; i++) u8[pos + binBytes.length + i] = 0x00;
    pos += binChunkLen;
  }

  return out;
}

/**
 * Remove properties that are redundant / not needed for rendering.
 */
function stripExtras(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripExtras);
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'extras') continue; // always drop
    if (k === 'name') continue;   // names add bytes with zero runtime value
    result[k] = stripExtras(v);
  }
  return result;
}

/**
 * Collect all indices actually referenced by a scene graph.
 */
function collectUsed(json) {
  const used = {
    nodes:        new Set(),
    meshes:       new Set(),
    materials:    new Set(),
    accessors:    new Set(),
    bufferViews:  new Set(),
    textures:     new Set(),
    images:       new Set(),
    samplers:     new Set(),
    skins:        new Set(),
    animations:   new Set(),
  };

  // Walk scene → nodes
  const visitNode = (i) => {
    if (used.nodes.has(i)) return;
    used.nodes.add(i);
    const node = json.nodes?.[i];
    if (!node) return;
    if (node.mesh     != null) used.meshes.add(node.mesh);
    if (node.skin     != null) used.skins.add(node.skin);
    if (node.children) node.children.forEach(visitNode);
  };

  (json.scenes || []).forEach(scene => (scene.nodes || []).forEach(visitNode));

  // Meshes → accessors + materials
  used.meshes.forEach(mi => {
    const mesh = json.meshes?.[mi];
    (mesh?.primitives || []).forEach(prim => {
      if (prim.material != null) used.materials.add(prim.material);
      if (prim.indices  != null) used.accessors.add(prim.indices);
      Object.values(prim.attributes || {}).forEach(a => used.accessors.add(a));
      Object.values(prim.targets || []).forEach(t =>
        Object.values(t).forEach(a => used.accessors.add(a))
      );
    });
  });

  // Skins → accessors
  used.skins.forEach(si => {
    const skin = json.skins?.[si];
    if (skin?.inverseBindMatrices != null) used.accessors.add(skin.inverseBindMatrices);
  });

  // Animations — keep all (they reference nodes/accessors)
  (json.animations || []).forEach((_, ai) => {
    used.animations.add(ai);
    const anim = json.animations[ai];
    (anim.samplers || []).forEach(s => {
      if (s.input  != null) used.accessors.add(s.input);
      if (s.output != null) used.accessors.add(s.output);
    });
  });

  // Materials → textures
  used.materials.forEach(mi => {
    const mat = json.materials?.[mi];
    const addTex = (t) => { if (t?.index != null) used.textures.add(t.index); };
    addTex(mat?.pbrMetallicRoughness?.baseColorTexture);
    addTex(mat?.pbrMetallicRoughness?.metallicRoughnessTexture);
    addTex(mat?.normalTexture);
    addTex(mat?.occlusionTexture);
    addTex(mat?.emissiveTexture);
    // KHR_materials_* extensions
    const ext = mat?.extensions || {};
    Object.values(ext).forEach(e => {
      Object.values(e || {}).forEach(v => {
        if (v && typeof v === 'object' && v.index != null) used.textures.add(v.index);
      });
    });
  });

  // Textures → images + samplers
  used.textures.forEach(ti => {
    const tex = json.textures?.[ti];
    if (tex?.source  != null) used.images.add(tex.source);
    if (tex?.sampler != null) used.samplers.add(tex.sampler);
  });

  // Accessors → bufferViews
  used.accessors.forEach(ai => {
    const acc = json.accessors?.[ai];
    if (acc?.bufferView != null) used.bufferViews.add(acc.bufferView);
  });

  // Images → bufferViews
  used.images.forEach(ii => {
    const img = json.images?.[ii];
    if (img?.bufferView != null) used.bufferViews.add(img.bufferView);
  });

  return used;
}

/**
 * Re-index an array keeping only items whose original index is in `usedSet`.
 * Returns { newArray, remap: Map<oldIndex, newIndex> }.
 */
function reindex(arr, usedSet) {
  if (!arr) return { newArray: undefined, remap: new Map() };
  const remap = new Map();
  const newArray = [];
  arr.forEach((item, i) => {
    if (usedSet.has(i)) {
      remap.set(i, newArray.length);
      newArray.push(item);
    }
  });
  return { newArray, remap };
}

/**
 * Re-pack the binary buffer: only keep the bytes actually referenced
 * by the surviving bufferViews, and update their byteOffset accordingly.
 */
function repackBinary(json, binBuffer) {
  if (!binBuffer || !json.bufferViews?.length) return { json, binBuffer };

  const parts = [];
  let totalBytes = 0;

  const newBufferViews = json.bufferViews.map(bv => {
    // Only repack bufferViews that reference buffer 0 (the embedded bin)
    if (bv.buffer !== 0 || bv.byteOffset == null) return bv;

    const slice = binBuffer.slice(bv.byteOffset, bv.byteOffset + bv.byteLength);
    // Align to 4 bytes
    const align  = (4 - (totalBytes % 4)) % 4;
    totalBytes  += align;
    const newOffset = totalBytes;
    parts.push({ slice, align });
    totalBytes += bv.byteLength;
    return { ...bv, byteOffset: newOffset };
  });

  // Build new bin buffer
  const newBin = new ArrayBuffer(totalBytes);
  const u8     = new Uint8Array(newBin);
  let pos = 0;
  parts.forEach(({ slice, align }) => {
    pos += align;
    u8.set(new Uint8Array(slice), pos);
    pos += slice.byteLength;
  });

  const newJson = {
    ...json,
    bufferViews: newBufferViews,
    buffers: json.buffers ? [{ byteLength: totalBytes }] : undefined,
  };

  return { json: newJson, binBuffer: newBin };
}

export async function compressGLB(file) {
  const arrayBuffer = await file.arrayBuffer();
  let { json, binBuffer } = readGLB(arrayBuffer);

  // 1. Strip extras/names
  json = stripExtras(json);

  // 2. Collect what's actually used
  const used = collectUsed(json);

  // 3. Re-index each array and build remap tables
  const { newArray: newNodes,       remap: nodeMap      } = reindex(json.nodes,       used.nodes);
  const { newArray: newMeshes,      remap: meshMap       } = reindex(json.meshes,      used.meshes);
  const { newArray: newMaterials,   remap: matMap        } = reindex(json.materials,   used.materials);
  const { newArray: newAccessors,   remap: accMap        } = reindex(json.accessors,   used.accessors);
  const { newArray: newBufferViews, remap: bvMap         } = reindex(json.bufferViews, used.bufferViews);
  const { newArray: newTextures,    remap: texMap        } = reindex(json.textures,    used.textures);
  const { newArray: newImages,      remap: imgMap        } = reindex(json.images,      used.images);
  const { newArray: newSamplers,    remap: sampMap       } = reindex(json.samplers,    used.samplers);

  // Helper to remap a nullable index
  const rm = (map, v) => (v == null ? undefined : map.get(v));

  // 4. Patch references inside nodes
  (newNodes || []).forEach(node => {
    if (node.mesh     != null) node.mesh     = rm(meshMap,   node.mesh);
    if (node.children)         node.children = node.children.map(c => rm(nodeMap, c)).filter(c => c != null);
  });

  // Patch scenes
  (json.scenes || []).forEach(scene => {
    if (scene.nodes) scene.nodes = scene.nodes.map(n => rm(nodeMap, n)).filter(n => n != null);
  });

  // Patch meshes
  (newMeshes || []).forEach(mesh => {
    (mesh.primitives || []).forEach(prim => {
      if (prim.material != null) prim.material = rm(matMap, prim.material);
      if (prim.indices  != null) prim.indices  = rm(accMap, prim.indices);
      prim.attributes = Object.fromEntries(
        Object.entries(prim.attributes || {}).map(([k, v]) => [k, rm(accMap, v)])
      );
    });
  });

  // Patch accessors → bufferViews
  (newAccessors || []).forEach(acc => {
    if (acc.bufferView != null) acc.bufferView = rm(bvMap, acc.bufferView);
  });

  // Patch bufferViews
  (newBufferViews || []).forEach(bv => {
    // buffer index stays 0 (only one buffer)
  });

  // Patch textures → images + samplers
  (newTextures || []).forEach(tex => {
    if (tex.source  != null) tex.source  = rm(imgMap,  tex.source);
    if (tex.sampler != null) tex.sampler = rm(sampMap, tex.sampler);
  });

  // Patch images → bufferViews
  (newImages || []).forEach(img => {
    if (img.bufferView != null) img.bufferView = rm(bvMap, img.bufferView);
  });

  // Patch materials → textures
  const patchTexInfo = (t) => { if (t?.index != null) t.index = rm(texMap, t.index); };
  (newMaterials || []).forEach(mat => {
    patchTexInfo(mat?.pbrMetallicRoughness?.baseColorTexture);
    patchTexInfo(mat?.pbrMetallicRoughness?.metallicRoughnessTexture);
    patchTexInfo(mat?.normalTexture);
    patchTexInfo(mat?.occlusionTexture);
    patchTexInfo(mat?.emissiveTexture);
  });

  // 5. Rebuild JSON
  const newJson = {
    asset: json.asset,
    scene: json.scene,
    scenes: json.scenes,
    nodes: newNodes?.length    ? newNodes    : undefined,
    meshes: newMeshes?.length  ? newMeshes   : undefined,
    materials: newMaterials?.length ? newMaterials : undefined,
    accessors: newAccessors?.length ? newAccessors : undefined,
    bufferViews: newBufferViews?.length ? newBufferViews : undefined,
    textures: newTextures?.length ? newTextures : undefined,
    images: newImages?.length  ? newImages   : undefined,
    samplers: newSamplers?.length ? newSamplers : undefined,
    skins: json.skins,
    animations: json.animations,
    extensions: json.extensions,
    extensionsUsed: json.extensionsUsed,
    extensionsRequired: json.extensionsRequired,
  };

  // Remove undefined keys
  Object.keys(newJson).forEach(k => newJson[k] === undefined && delete newJson[k]);

  // 6. Repack binary buffer (remove unused gaps)
  const { json: packedJson, binBuffer: packedBin } = repackBinary(newJson, binBuffer);

  // 7. Serialise back to GLB
  const outBuffer = writeGLB(packedJson, packedBin);
  return new Blob([outBuffer], { type: 'model/gltf-binary' });
}