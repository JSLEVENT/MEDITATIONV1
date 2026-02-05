import { Router } from 'express';
import { trackAnalyticsEvent } from '../services/analyticsService';

const router = Router();

router.post('/', async (req, res) => {
  const { email, source } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  await trackAnalyticsEvent(null, 'waitlist_signup', {
    email,
    source: source || 'landing'
  });

  return res.status(201).json({ status: 'ok' });
});

export default router;
