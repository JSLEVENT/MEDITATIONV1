import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { stripe } from '../lib/stripe';
import { db } from '../lib/db';
import { users } from '@serenity/db';
import { eq } from 'drizzle-orm';

const router = Router();

const getPriceId = (plan: string) => {
  if (plan === 'annual') {
    return process.env.STRIPE_ANNUAL_PRICE_ID;
  }
  return process.env.STRIPE_MONTHLY_PRICE_ID;
};

router.post('/checkout', authMiddleware, async (req, res) => {
  const authUser = req.authUser;

  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const { plan } = req.body || {};
  const priceId = getPriceId(plan || 'monthly');

  if (!priceId) {
    return res.status(400).json({ error: 'Missing Stripe price ID' });
  }

  const successUrl = process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/dashboard';
  const cancelUrl = process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/pricing';

  const [user] = await db.select().from(users).where(eq(users.id, authUser.id));

  let customerId = user?.stripe_customer_id || null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: authUser.email || undefined,
      metadata: {
        user_id: authUser.id
      }
    });
    customerId = customer.id;
    await db.update(users).set({ stripe_customer_id: customerId }).where(eq(users.id, authUser.id));
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: authUser.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl
  });

  return res.json({ url: session.url });
});

router.post('/portal', authMiddleware, async (req, res) => {
  const authUser = req.authUser;

  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const [user] = await db.select().from(users).where(eq(users.id, authUser.id));

  if (!user?.stripe_customer_id) {
    return res.status(400).json({ error: 'No Stripe customer found' });
  }

  const returnUrl = process.env.STRIPE_PORTAL_RETURN_URL || 'http://localhost:3000/settings';
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: returnUrl
  });

  return res.json({ url: portalSession.url });
});

export default router;
