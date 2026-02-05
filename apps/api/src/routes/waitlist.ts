import { Router } from 'express';
import { db } from '../lib/db';
import { analytics_events } from '@serenity/db';

const router = Router();

router.post('/', async (req, res) => {
  const { email, source } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  await db.insert(analytics_events).values({
    event_type: 'waitlist_signup',
    properties: {
      email,
      source: source || 'landing'
    }
  });

  return res.status(201).json({ status: 'ok' });
});

export default router;
