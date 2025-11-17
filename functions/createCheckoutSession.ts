import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  console.log('🚀 createCheckoutSession function invoked');

  try {
    // Initialize Base44 client
    const base44 = createClientFromRequest(req);
    
    // Check if user is authenticated first
    const isAuthenticated = await base44.auth.isAuthenticated();
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated');
      return Response.json({ 
        error: 'Please log in to upgrade to Pro',
        requiresAuth: true
      }, { status: 401 });
    }

    // Get user
    const user = await base44.auth.me();

    if (!user) {
      console.error('❌ No user found after auth check');
      return Response.json({ 
        error: 'Please log in to continue',
        requiresAuth: true
      }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    // Get Stripe keys
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');

    console.log('🔑 Stripe Secret Key exists:', !!stripeSecretKey);
    console.log('🔑 Stripe Secret Key length:', stripeSecretKey?.length || 0);
    console.log('🔑 Stripe Secret Key prefix:', stripeSecretKey?.substring(0, 10));
    console.log('💰 Stripe Price ID:', stripePriceId);

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

    // Get proper origin for live app
    let origin = 'https://fileoptimized.com'; // Default fallback
    
    const referer = req.headers.get('referer');
    const originHeader = req.headers.get('origin');
    
    if (referer) {
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
      allow_promotion_codes: true,
    };

    console.log('Creating checkout session with params:', JSON.stringify(sessionParams, null, 2));

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('✅ Session created:', session.id);

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ FULL ERROR:', error);
    console.error('❌ ERROR MESSAGE:', error.message);
    console.error('❌ ERROR TYPE:', error.type);
    console.error('❌ ERROR CODE:', error.code);
    console.error('❌ STACK:', error.stack);
    
    return Response.json({ 
      error: error.message || 'Failed to create checkout session',
      errorType: error.type || 'unknown_error',
      errorCode: error.code || 'unknown'
    }, { status: 500 });
  }
});