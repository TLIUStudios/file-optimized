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

    // Get the user's Google Drive access token - must use user's email
    let accessToken;
    try {
      accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive', user.email);
      console.log('Token retrieved for:', user.email);
      
      if (!accessToken || typeof accessToken !== 'string' || accessToken.length < 20) {
        throw new Error('Invalid or missing token');
      }
    } catch (error) {
      console.error('Token retrieval failed:', error.message);
      return Response.json({ 
        error: 'Google Drive not connected. Please connect in Profile settings.',
        requiresAuth: true,
        debug: error.message
      }, { status: 401 });
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
      console.error('Google Drive API error:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        body: errorData,
        url: uploadResponse.url
      });
      return Response.json({ 
        error: 'Google Drive upload failed',
        details: errorData,
        status: uploadResponse.status
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