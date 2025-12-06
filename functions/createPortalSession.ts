import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.stripe_customer_id) {
      return Response.json({ 
        error: 'No Stripe customer found. Please subscribe first.' 
      }, { status: 400 });
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      return Response.json({ 
        error: 'Stripe not configured' 
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the origin for return URL
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${origin}/#/Profile`,
    });

    return Response.json({ url: session.url });

  } catch (error) {
    console.error('Error creating portal session:', error);
    return Response.json({ 
      error: error.message || 'Failed to create portal session' 
    }, { status: 500 });
  }
});