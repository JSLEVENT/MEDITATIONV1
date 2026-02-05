import { Router } from 'express';
import { stripe } from '../lib/stripe';
import { db } from '../lib/db';
import { subscriptions, users } from '@serenity/db';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

const planFromPriceId = (priceId?: string | null) => {
  if (!priceId) return 'free';
  if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID) return 'annual';
  if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) return 'monthly';
  return 'free';
};

const mapStripeStatus = (status: Stripe.Subscription.Status) => {
  if (status === 'active') return 'active';
  if (status === 'trialing') return 'trialing';
  if (status === 'past_due' || status === 'unpaid') return 'past_due';
  return 'cancelled';
};

router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret || !sig) {
    return res.status(400).send('Stripe webhook not configured');
  }

  let event: Stripe.Event;

  const payload = req.rawBody || req.body;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id || session.metadata?.user_id;
    const customerId = session.customer?.toString();
    const subscriptionId = session.subscription?.toString();

    if (userId) {
      if (customerId) {
        await db.update(users).set({ stripe_customer_id: customerId }).where(eq(users.id, userId));
      }

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = planFromPriceId(priceId);

        const mappedStatus = mapStripeStatus(subscription.status);
        await db
          .insert(subscriptions)
          .values({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: mappedStatus,
            current_period_end: new Date(subscription.current_period_end * 1000)
          })
          .onConflictDoUpdate({
            target: subscriptions.stripe_subscription_id,
            set: {
              plan,
              status: mappedStatus,
              current_period_end: new Date(subscription.current_period_end * 1000)
            }
          });

        const tier = mappedStatus === 'active' ? plan : 'free';
        await db.update(users).set({ subscription_tier: tier }).where(eq(users.id, userId));
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer?.toString();
    const priceId = subscription.items.data[0]?.price?.id;
    const plan = planFromPriceId(priceId);
    const mappedStatus = mapStripeStatus(subscription.status);

    const [user] = await db.select().from(users).where(eq(users.stripe_customer_id, customerId));

    if (user) {
      await db
        .insert(subscriptions)
        .values({
          user_id: user.id,
          stripe_subscription_id: subscription.id,
          plan,
          status: mappedStatus,
          current_period_end: new Date(subscription.current_period_end * 1000)
        })
        .onConflictDoUpdate({
          target: subscriptions.stripe_subscription_id,
          set: {
            plan,
            status: mappedStatus,
            current_period_end: new Date(subscription.current_period_end * 1000)
          }
        });

      const tier = mappedStatus === 'active' ? plan : 'free';
      await db.update(users).set({ subscription_tier: tier }).where(eq(users.id, user.id));
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription?.toString();

    if (subscriptionId) {
      await db
        .update(subscriptions)
        .set({ status: 'past_due' })
        .where(eq(subscriptions.stripe_subscription_id, subscriptionId));
    }
  }

  res.json({ received: true });
});

export default router;
