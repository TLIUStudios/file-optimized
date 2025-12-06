import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  console.log('🚀 createCheckoutSession function invoked');

  try {
    // Parse request body to get billing frequency
    const body = await req.json().catch(() => ({}));
    const billingFrequency = body.billingFrequency || 'monthly';
    
    console.log('📅 Billing frequency:', billingFrequency);
    
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

    // Get Stripe keys - validate they exist
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeMonthlyPriceId = Deno.env.get('STRIPE_PRICE_ID');
    const stripeAnnualPriceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID');
    
    // Validate billing frequency
    if (!['monthly', 'annual'].includes(billingFrequency)) {
      console.error('❌ Invalid billing frequency:', billingFrequency);
      return Response.json({ 
        error: 'Invalid billing frequency. Please try again.' 
      }, { status: 400 });
    }
    
    // Select the correct price ID based on billing frequency
    const stripePriceId = billingFrequency === 'annual' ? stripeAnnualPriceId : stripeMonthlyPriceId;

    console.log('🔑 Stripe configured:', !!stripeSecretKey);
    console.log('💰 Price configured:', !!stripePriceId);

    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not set');
      return Response.json({ 
        error: 'Stripe not configured. Please contact support.' 
      }, { status: 500 });
    }

    if (!stripePriceId) {
      console.error('❌ STRIPE_PRICE_ID not set for billing frequency:', billingFrequency);
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
      success_url: `${origin}/#/CheckoutSuccess`,
      cancel_url: `${origin}/#/CheckoutCanceled`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
      },
      allow_promotion_codes: true,
    };

    console.log('Creating checkout session for user:', user.id);

    // Create Checkout Session
    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
      console.log('✅ Session created:', session.id);
    } catch (stripeError) {
      console.error('❌ STRIPE API ERROR:', stripeError);
      console.error('❌ Stripe Error Type:', stripeError.type);
      console.error('❌ Stripe Error Code:', stripeError.code);
      console.error('❌ Stripe Error Message:', stripeError.message);
      console.error('❌ Stripe Error Raw:', stripeError.raw);
      throw stripeError;
    }

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ FULL ERROR:', error);
    
    // Return generic error to frontend (don't expose internal details)
    return Response.json({ 
      error: 'Failed to create checkout session. Please try again or contact support.'
    }, { status: 500 });
  }
});