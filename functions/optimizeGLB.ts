import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { file: base64Data } = body;

    if (!base64Data || typeof base64Data !== 'string') {
      return Response.json({ error: 'Invalid file data' }, { status: 400 });
    }

    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Validate GLB header
    if (bytes.length < 20) {
      return Response.json({ error: 'File too small to be valid GLB' }, { status: 400 });
    }

    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const magic = dv.getUint32(0, true);
    
    if (magic !== 0x46546c67) { // 'glTF'
      return Response.json({ error: 'Not a valid GLB file' }, { status: 400 });
    }

    // Simple optimization: just return the file as-is for now
    // The structure is preserved, preventing viewer errors
    let resultBase64 = '';
    for (let i = 0; i < bytes.length; i++) {
      resultBase64 += String.fromCharCode(bytes[i]);
    }
    resultBase64 = btoa(resultBase64);

    return Response.json({ file: resultBase64 });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
});