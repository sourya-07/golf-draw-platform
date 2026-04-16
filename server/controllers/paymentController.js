const supabase = require('../services/supabaseAdmin');
const { createCheckoutSession, constructWebhookEvent } = require('../services/stripeService');
const { sendSubscriptionConfirmedEmail } = require('../services/emailService');

async function createCheckout(req, res) {
  const user = req.user;
  const { plan } = req.body;
  if (!plan || !['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ error: 'Plan must be "monthly" or "yearly"' });
  }

  try {
    const session = await createCheckoutSession({
      customerId: user.stripe_customer_id || null,
      plan,
      userId: user.id,
      successUrl: `${process.env.CLIENT_URL}/dashboard?subscription=success`,
      cancelUrl: `${process.env.CLIENT_URL}/?subscription=cancelled`,
    });
    return res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[createCheckout]', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = constructWebhookEvent(req.body, sig);
  } catch (err) {
    console.error('[Webhook] Signature verify failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId) {
          await supabase.from('users').update({
            subscription_status: 'active',
            subscription_plan: plan || 'monthly',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          }).eq('id', userId);

          // Send confirmation email
          const { data: userProfile } = await supabase
            .from('users').select('email, full_name').eq('id', userId).single();
          if (userProfile) sendSubscriptionConfirmedEmail(userProfile).catch(console.error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await supabase
          .from('users')
          .update({ subscription_status: 'cancelled' })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (subId) {
          await supabase
            .from('users')
            .update({ subscription_status: 'lapsed' })
            .eq('stripe_subscription_id', subId);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (subId) {
          await supabase
            .from('users')
            .update({ subscription_status: 'active' })
            .eq('stripe_subscription_id', subId);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function getPaymentStatus(req, res) {
  const user = req.user;
  return res.json({
    subscription_status: user.subscription_status,
    subscription_plan: user.subscription_plan,
    stripe_customer_id: user.stripe_customer_id,
    stripe_subscription_id: user.stripe_subscription_id,
  });
}

module.exports = { createCheckout, handleWebhook, getPaymentStatus };
