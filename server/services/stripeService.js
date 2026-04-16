const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout session for subscriptions
 */
async function createCheckoutSession({ customerId, plan, userId, successUrl, cancelUrl }) {
  const priceId =
    plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

  const sessionParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl || `${process.env.CLIENT_URL}/dashboard?subscription=success`,
    cancel_url: cancelUrl || `${process.env.CLIENT_URL}/?subscription=cancelled`,
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
  };

  if (customerId) {
    sessionParams.customer = customerId;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session;
}

/**
 * Construct a Stripe webhook event from raw body + signature
 */
function constructWebhookEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = { stripe, createCheckoutSession, constructWebhookEvent };
