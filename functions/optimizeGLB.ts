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
    const optimized = optimizeGLB(new Uint8Array(arrayBuffer));

    return new Response(optimized, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Length': optimized.length,
      },
    });
  } catch (error) {
    console.error('GLB optimization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function optimizeGLB(data) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const magic = view.getUint32(0, true);

  if (magic !== 0x46546C67) return data;

  const version = view.getUint32(4, true);
  const totalLength = view.getUint32(8, true);

  if (version !== 2) return data;

  let offset = 12;
  let jsonChunk = null;
  let binChunk = null;

  while (offset < totalLength) {
    if (offset + 8 > totalLength) break;
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;

    if (chunkType === 0x4e4f534a) {
      jsonChunk = data.slice(chunkStart, chunkStart + chunkLength);
    } else if (chunkType === 0x004e4942) {
      binChunk = data.slice(chunkStart, chunkStart + chunkLength);
    }

    offset += 8 + chunkLength;
  }

  if (!jsonChunk || !binChunk) return data;

  const decoder = new TextDecoder();
  const jsonStr = decoder.decode(jsonChunk).trim();
  let json = JSON.parse(jsonStr);

  json.asset = json.asset || {};
  delete json.asset.generator;
  delete json.asset.copyright;
  delete json.extras;

  if (json.extensionsUsed) {
    json.extensionsUsed = json.extensionsUsed.filter(
      (e) => !['KHR_materials_unlit', 'KHR_lights_punctual'].includes(e)
    );
    if (json.extensionsUsed.length === 0) delete json.extensionsUsed;
  }

  if (json.extensions) {
    ['KHR_materials_unlit', 'KHR_lights_punctual'].forEach((ext) => {
      delete json.extensions[ext];
    });
    if (Object.keys(json.extensions).length === 0) delete json.extensions;
  }

  const optimizedJson = JSON.stringify(json);
  const encoder = new TextEncoder();
  const jsonData = encoder.encode(optimizedJson);
  const padding = (4 - (jsonData.length % 4)) % 4;

  const newLength = 12 + 8 + jsonData.length + padding + 8 + binChunk.length;
  const newGlb = new Uint8Array(newLength);
  const newView = new DataView(newGlb.buffer);

  newView.setUint32(0, 0x46546c67, true);
  newView.setUint32(4, 2, true);
  newView.setUint32(8, newLength, true);

  let pos = 12;
  newView.setUint32(pos, jsonData.length + padding, true);
  pos += 4;
  newView.setUint32(pos, 0x4e4f534a, true);
  pos += 4;
  newGlb.set(jsonData, pos);
  pos += jsonData.length + padding;

  newView.setUint32(pos, binChunk.length, true);
  pos += 4;
  newView.setUint32(pos, 0x004e4942, true);
  pos += 4;
  newGlb.set(binChunk, pos);

  return newGlb;
}