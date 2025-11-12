import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  console.log('🚀 createCheckoutSession function invoked');

  try {
    // Initialize Base44 client
    const base44 = createClientFromRequest(req);
    
    // Get user
    const user = await base44.auth.me();

    if (!user) {
      console.error('❌ No user found');
      return Response.json({ error: 'Unauthorized - please log in' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    // Get Stripe keys
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');

    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not set');
      return Response.json({ 
        error: 'Stripe not configured. Please contact support.' 
      }, { status: 500 });
    }

    if (!stripePriceId) {
      console.error('❌ STRIPE_PRICE_ID not set');
      return Response.json({ 
        error: 'Stripe pricing not configured. Please contact support.' 
      }, { status: 500 });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // FIXED: Get proper origin for live app
    // Extract the base URL from referer or origin
    let origin = 'https://imagecrush.base44.com'; // Default fallback
    
    const referer = req.headers.get('referer');
    const originHeader = req.headers.get('origin');
    
    if (referer) {
      // Extract base URL from referer (remove hash and trailing slash)
      const url = new URL(referer);
      origin = `${url.protocol}//${url.host}`;
    } else if (originHeader) {
      origin = originHeader;
    }
    
    console.log('📍 Using origin for redirects:', origin);

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
      // Allow promotion codes
      allow_promotion_codes: true,
    };

    console.log('Creating checkout session...');
    console.log('Success URL:', sessionParams.success_url);
    console.log('Cancel URL:', sessionParams.cancel_url);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('✅ Session created:', session.id);

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Error type:', error.type);
    console.error('Stack:', error.stack);
    
    return Response.json({ 
      error: error.message || 'Failed to create checkout session',
      errorType: error.type || 'unknown_error'
    }, { status: 500 });
  }
});