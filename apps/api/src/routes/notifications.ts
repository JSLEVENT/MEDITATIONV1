import { Router } from 'express';

const router = Router();

router.get('/streaks', (_req, res) => {
  res.json({ status: 'ok', message: 'Push notifications not configured yet.' });
});

export default router;
