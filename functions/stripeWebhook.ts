import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey || !webhookSecret) {
      return Response.json({ 
        error: 'Stripe not configured' 
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Initialize Base44 client with service role after signature validation
    const base44 = createClientFromRequest(req);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.user_id || session.client_reference_id;

        if (!userId) {
          console.error('No user ID in session metadata');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const periodEnd = new Date(subscription.current_period_end * 1000);

        // Update user to Pro with service role
        await base44.asServiceRole.entities.User.update(userId, {
          plan: 'pro',
          plan_expires_at: periodEnd.toISOString(),
          stripe_customer_id: session.customer,
          subscription_id: session.subscription,
        });

        console.log(`✅ User ${userId} upgraded to Pro (expires: ${periodEnd.toISOString()})`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID
        const users = await base44.asServiceRole.entities.User.filter({ 
          stripe_customer_id: customerId 
        });

        if (users.length === 0) {
          console.error('No user found for customer:', customerId);
          break;
        }

        const user = users[0];
        const periodEnd = new Date(subscription.current_period_end * 1000);

        // Update subscription period
        await base44.asServiceRole.entities.User.update(user.id, {
          plan_expires_at: periodEnd.toISOString(),
        });

        console.log(`✅ Subscription updated for user ${user.id} (expires: ${periodEnd.toISOString()})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID
        const users = await base44.asServiceRole.entities.User.filter({ 
          stripe_customer_id: customerId 
        });

        if (users.length === 0) {
          console.error('No user found for customer:', customerId);
          break;
        }

        const user = users[0];

        // Downgrade to free
        await base44.asServiceRole.entities.User.update(user.id, {
          plan: 'free',
          plan_expires_at: null,
        });

        console.log(`✅ User ${user.id} downgraded to Free (subscription canceled)`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Find user by Stripe customer ID
        const users = await base44.asServiceRole.entities.User.filter({ 
          stripe_customer_id: customerId 
        });

        if (users.length === 0) {
          console.error('No user found for customer:', customerId);
          break;
        }

        const user = users[0];

        // Store billing history
        const billingRecord = {
          user_id: user.id,
          invoice_id: invoice.id,
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency,
          status: invoice.status,
          invoice_pdf: invoice.invoice_pdf,
          paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
        };

        // Create billing history record
        await base44.asServiceRole.entities.BillingHistory.create(billingRecord);

        console.log(`✅ Payment recorded for user ${user.id}: $${billingRecord.amount}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Find user by Stripe customer ID
        const users = await base44.asServiceRole.entities.User.filter({ 
          stripe_customer_id: customerId 
        });

        if (users.length > 0) {
          console.warn(`⚠️ Payment failed for user ${users[0].id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message || 'Webhook processing failed' 
    }, { status: 500 });
  }
});