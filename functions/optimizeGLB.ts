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

    // Return the file as-is without processing to avoid memory issues
    return Response.json({ file: base64Data });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
});