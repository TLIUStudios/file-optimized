import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');

    if (!stripeSecretKey || !stripePriceId) {
      return Response.json({ 
        error: 'Stripe not configured. Please set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in environment variables.' 
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the origin for success/cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Create Checkout Session
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
      success_url: `${origin}/#/profile?success=true`,
      cancel_url: `${origin}/#/profile?canceled=true`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
      },
    });

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return Response.json({ 
      error: error.message || 'Failed to create checkout session' 
    }, { status: 500 });
  }
});