import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  console.log('🧪 TEST FUNCTION CALLED');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    console.log('User:', user?.email);
    
    return Response.json({ 
      success: true,
      message: 'Test successful!',
      user: user?.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});