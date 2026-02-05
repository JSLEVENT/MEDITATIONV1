import { Router } from 'express';
import { trackAnalyticsEvent } from '../services/analyticsService';

const router = Router();

router.post('/event', async (req, res) => {
  const { user_id, event_type, properties } = req.body || {};

  if (!event_type) {
    return res.status(400).json({ error: 'event_type is required' });
  }

  await trackAnalyticsEvent(user_id || null, event_type, properties || {});
  return res.status(201).json({ status: 'ok' });
});

export default router;
