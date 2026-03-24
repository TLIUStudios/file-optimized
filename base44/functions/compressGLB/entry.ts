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
    const data = new Uint8Array(arrayBuffer);

    // Parse GLB structure
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const magic = view.getUint32(0, true);
    
    if (magic !== 0x46546C67) {
      return Response.json({ error: 'Invalid GLB file' }, { status: 400 });
    }

    const version = view.getUint32(4, true);
    const totalLength = view.getUint32(8, true);
    
    if (version !== 2) {
      return Response.json({ error: 'Unsupported GLB version' }, { status: 400 });
    }

    let offset = 12;
    let jsonChunk = null;
    let binChunk = null;
    let jsonChunkLength = 0;
    let binChunkLength = 0;

    // Parse chunks
    while (offset < totalLength) {
      if (offset + 8 > totalLength) break;
      const chunkLength = view.getUint32(offset, true);
      const chunkType = view.getUint32(offset + 4, true);
      const chunkStart = offset + 8;

      if (chunkType === 0x4E4F534A) {
        jsonChunk = data.slice(chunkStart, chunkStart + chunkLength);
        jsonChunkLength = chunkLength;
      } else if (chunkType === 0x004E4942) {
        binChunk = data.slice(chunkStart, chunkStart + chunkLength);
        binChunkLength = chunkLength;
      }

      offset += 8 + chunkLength;
    }

    if (!jsonChunk || !binChunk) {
      return Response.json({ error: 'Invalid GLB structure' }, { status: 400 });
    }

    // Decode and minify JSON
    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(jsonChunk).trim();
    const json = JSON.parse(jsonStr);

    // Remove metadata to reduce size
    delete json.asset?.generator;
    delete json.extras;
    
    // Remove unnecessary extensions
    if (json.extensionsUsed) {
      json.extensionsUsed = json.extensionsUsed.filter(e => 
        !['KHR_materials_unlit', 'KHR_lights_punctual'].includes(e)
      );
      if (json.extensionsUsed.length === 0) delete json.extensionsUsed;
    }

    if (json.extensions) {
      const keys = Object.keys(json.extensions);
      keys.forEach(key => {
        if (['KHR_materials_unlit', 'KHR_lights_punctual'].includes(key)) {
          delete json.extensions[key];
        }
      });
      if (Object.keys(json.extensions).length === 0) delete json.extensions;
    }

    // Minify JSON with minimal whitespace
    const optimizedJsonStr = JSON.stringify(json);
    const encoder = new TextEncoder();
    const optimizedJsonData = encoder.encode(optimizedJsonStr);

    // Pad JSON chunk to 4-byte alignment
    const jsonPadding = (4 - (optimizedJsonData.length % 4)) % 4;
    const paddedJsonLength = optimizedJsonData.length + jsonPadding;

    // Build new GLB
    const newFileLength = 12 + 8 + paddedJsonLength + 8 + binChunkLength;
    const newGLB = new Uint8Array(newFileLength);
    const newView = new DataView(newGLB.buffer);

    // Header
    newView.setUint32(0, 0x46546C67, true); // magic
    newView.setUint32(4, 2, true); // version
    newView.setUint32(8, newFileLength, true); // total length

    // JSON chunk
    let pos = 12;
    newView.setUint32(pos, paddedJsonLength, true);
    pos += 4;
    newView.setUint32(pos, 0x4E4F534A, true);
    pos += 4;
    newGLB.set(optimizedJsonData, pos);
    pos += optimizedJsonData.length + jsonPadding;

    // Binary chunk
    newView.setUint32(pos, binChunkLength, true);
    pos += 4;
    newView.setUint32(pos, 0x004E4942, true);
    pos += 4;
    newGLB.set(binChunk, pos);

    return new Response(newGLB, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Length': newGLB.length.toString(),
      },
    });
  } catch (error) {
    console.error('Compression error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});