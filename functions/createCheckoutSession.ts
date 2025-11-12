import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      console.error('No user found');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.email);

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');

    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not set');
      return Response.json({ 
        error: 'Stripe secret key not configured' 
      }, { status: 500 });
    }

    if (!stripePriceId) {
      console.error('STRIPE_PRICE_ID not set');
      return Response.json({ 
        error: 'Stripe price ID not configured' 
      }, { status: 500 });
    }

    console.log('Stripe keys found, initializing Stripe with price:', stripePriceId);

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the origin for success/cancel URLs - support both hash and non-hash routing
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('#')[0] || 'https://imagecrush.base44.com';
    console.log('Using origin:', origin);

    // Create Checkout Session
    console.log('Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/#/Profile?success=true`,
      cancel_url: `${origin}/#/Profile?canceled=true`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
      },
    });

    console.log('Checkout session created:', session.id);
    console.log('Checkout URL:', session.url);

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message || 'Failed to create checkout session',
      details: error.type || 'unknown_error'
    }, { status: 500 });
  }
});