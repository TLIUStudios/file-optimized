import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const originalBytes = new Uint8Array(arrayBuffer);
    
    // Validate GLB format
    const view = new DataView(originalBytes.buffer, originalBytes.byteOffset, originalBytes.byteLength);
    
    if (originalBytes.length < 12) {
      return Response.json({ error: 'File too small' }, { status: 400 });
    }

    const magic = view.getUint32(0, true);
    const version = view.getUint32(4, true);
    
    if (magic !== 0x46546C67 || version !== 2) {
      return Response.json({ error: 'Invalid GLB file' }, { status: 400 });
    }

    const optimizedBytes = optimizeGLB(originalBytes);

    return new Response(optimizedBytes, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Length': optimizedBytes.length,
      },
    });
  } catch (error) {
    console.error('GLB optimization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function optimizeGLB(data) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  
  if (data.length < 12) return data;
  
  const fileLength = view.getUint32(8, true);

  let jsonChunk = null;
  let jsonChunkLength = 0;
  let binChunk = null;
  let binChunkLength = 0;
  let offset = 12;

  // Parse chunks
  while (offset < fileLength && offset < data.length) {
    if (offset + 8 > fileLength || offset + 8 > data.length) break;

    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkEnd > data.length) break;

    if (chunkType === 0x4e4f534a) { // JSON
      jsonChunk = data.slice(chunkStart, chunkEnd);
      jsonChunkLength = chunkLength;
    } else if (chunkType === 0x004e4942) { // BIN
      binChunk = data.slice(chunkStart, chunkEnd);
      binChunkLength = chunkLength;
    }

    offset += 8 + chunkLength;
  }

  if (!jsonChunk || !binChunk) {
    return data; // Return original if parsing fails
  }

  // Parse JSON
  const decoder = new TextDecoder();
  const jsonText = decoder.decode(jsonChunk).trim();
  let json;
  
  try {
    json = JSON.parse(jsonText);
  } catch (e) {
    return data;
  }

  // Optimize JSON - remove unnecessary metadata
  if (json.asset) {
    json.asset = { version: json.asset.version };
  }

  delete json.extras;

  // Remove non-essential extensions
  if (json.extensionsUsed) {
    const keepExtensions = [
      'KHR_draco_mesh_compression',
      'KHR_texture_basisu',
      'EXT_texture_webp'
    ];
    json.extensionsUsed = json.extensionsUsed.filter(ext => keepExtensions.includes(ext));
    if (json.extensionsUsed.length === 0) delete json.extensionsUsed;
  }

  if (json.extensions) {
    const removeExtensions = [
      'KHR_materials_unlit',
      'KHR_lights_punctual',
      'KHR_materials_transmission',
      'KHR_materials_variants',
      'KHR_materials_ior',
      'KHR_materials_sheen',
      'KHR_materials_specular',
      'KHR_materials_emissive_strength',
      'KHR_materials_volume',
      'KHR_materials_clearcoat'
    ];
    removeExtensions.forEach(ext => delete json.extensions[ext]);
    if (Object.keys(json.extensions).length === 0) delete json.extensions;
  }

  // Clean up materials
  if (json.materials) {
    json.materials.forEach(mat => {
      delete mat.extras;
    });
  }

  // Minimize JSON string
  const optimizedJsonText = JSON.stringify(json);
  const encoder = new TextEncoder();
  const optimizedJsonData = encoder.encode(optimizedJsonText);

  // Align JSON to 4-byte boundary
  const jsonPadding = (4 - (optimizedJsonData.length % 4)) % 4;
  const alignedJsonLength = optimizedJsonData.length + jsonPadding;

  // Calculate new file size
  const newFileLength = 12 + (8 + alignedJsonLength) + (8 + binChunkLength);

  // Build new GLB
  const newGLB = new Uint8Array(newFileLength);
  const newView = new DataView(newGLB.buffer);

  // Write header
  newView.setUint32(0, 0x46546c67, true); // magic
  newView.setUint32(4, 2, true); // version
  newView.setUint32(8, newFileLength, true); // total length

  // Write JSON chunk
  let pos = 12;
  newView.setUint32(pos, alignedJsonLength, true); // chunk length
  pos += 4;
  newView.setUint32(pos, 0x4e4f534a, true); // chunk type (JSON)
  pos += 4;
  newGLB.set(optimizedJsonData, pos);
  pos += optimizedJsonData.length + jsonPadding;

  // Write BIN chunk
  newView.setUint32(pos, binChunkLength, true); // chunk length
  pos += 4;
  newView.setUint32(pos, 0x004e4942, true); // chunk type (BIN)
  pos += 4;
  newGLB.set(binChunk, pos);

  return newGLB;
}