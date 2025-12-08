import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse the request body first
    const { fileName, fileData, mimeType } = await req.json();

    if (!fileName || !fileData || !mimeType) {
      return Response.json({ 
        error: 'Missing required fields: fileName, fileData, mimeType' 
      }, { status: 400 });
    }
    
    // Check authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is Pro
    if (user.plan !== 'pro') {
      return Response.json({ error: 'Pro plan required' }, { status: 403 });
    }

    // Get the user's Google Drive access token via service role
    let accessToken;
    try {
      accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');
      console.log('Token retrieved for:', user.email, 'length:', accessToken?.length);
    } catch (error) {
      console.error('Token error:', error);
      return Response.json({ 
        error: 'Google Drive not connected. Please reconnect in your profile.',
        requiresAuth: true 
      }, { status: 401 });
    }
    
    if (!accessToken) {
      return Response.json({ 
        error: 'Google Drive token empty. Please reconnect in your profile.',
        requiresAuth: true 
      }, { status: 401 });
    }

    if (!fileName || !fileData || !mimeType) {
      return Response.json({ 
        error: 'Missing required fields: fileName, fileData, mimeType' 
      }, { status: 400 });
    }

    // Convert base64 to blob
    const base64Data = fileData.split(',')[1] || fileData;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Google Drive
    const metadata = {
      name: fileName,
      mimeType: mimeType
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([binaryData], { type: mimeType }));

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error('Google Drive upload error:', errorData);
      return Response.json({ 
        error: 'Failed to upload to Google Drive',
        details: errorData 
      }, { status: uploadResponse.status });
    }

    const result = await uploadResponse.json();

    return Response.json({ 
      success: true,
      file: {
        id: result.id,
        name: result.name,
        webViewLink: `https://drive.google.com/file/d/${result.id}/view`
      }
    });

  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});