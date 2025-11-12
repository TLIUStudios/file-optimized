import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  // Log immediately to confirm function is being called
  console.log('🚀 createCheckoutSession function invoked');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  try {
    // Initialize Base44 client
    console.log('Initializing Base44 client...');
    const base44 = createClientFromRequest(req);
    
    // Get user
    console.log('Fetching user...');
    const user = await base44.auth.me();

    if (!user) {
      console.error('❌ No user found');
      return Response.json({ error: 'Unauthorized - please log in' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email, 'ID:', user.id);

    // Get Stripe keys
    console.log('Reading environment variables...');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');

    console.log('STRIPE_SECRET_KEY exists:', !!stripeSecretKey);
    console.log('STRIPE_SECRET_KEY length:', stripeSecretKey?.length || 0);
    console.log('STRIPE_PRICE_ID:', stripePriceId);

    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not set');
      return Response.json({ 
        error: 'Stripe secret key not configured. Please contact support.' 
      }, { status: 500 });
    }

    if (!stripePriceId) {
      console.error('❌ STRIPE_PRICE_ID not set');
      return Response.json({ 
        error: 'Stripe price ID not configured. Please contact support.' 
      }, { status: 500 });
    }

    // Initialize Stripe
    console.log('Initializing Stripe with API version 2023-10-16...');
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get origin for redirect URLs
    const origin = req.headers.get('origin') || 
                   req.headers.get('referer')?.split('#')[0]?.replace(/\/$/, '') || 
                   'https://imagecrush.base44.com';
    
    console.log('Using origin for redirects:', origin);

    // Prepare checkout session parameters
    const sessionParams = {
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{
        price: stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${origin}/#/Profile?success=true`,
      cancel_url: `${origin}/#/Profile?canceled=true`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
      },
    };

    console.log('Creating Stripe checkout session with params:', {
      customer_email: sessionParams.customer_email,
      client_reference_id: sessionParams.client_reference_id,
      price: stripePriceId,
      mode: sessionParams.mode,
      success_url: sessionParams.success_url,
      cancel_url: sessionParams.cancel_url,
    });

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('✅ Checkout session created successfully!');
    console.log('Session ID:', session.id);
    console.log('Session URL:', session.url);

    // Return response
    const response = { 
      sessionId: session.id,
      url: session.url 
    };

    console.log('Returning response:', response);

    return Response.json(response);

  } catch (error) {
    console.error('❌ ERROR in createCheckoutSession:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.error('Stack trace:', error.stack);
    
    // Return detailed error for debugging
    return Response.json({ 
      error: error.message || 'Failed to create checkout session',
      errorType: error.type || 'unknown_error',
      errorCode: error.code || 'no_code',
      details: 'Check function logs in dashboard for full details'
    }, { status: 500 });
  }
});