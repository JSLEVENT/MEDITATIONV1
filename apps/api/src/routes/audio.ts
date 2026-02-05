import { Router } from 'express';
import { db } from '../lib/db';
import { audio_stems } from '@serenity/db';

const router = Router();

router.get('/stems', async (_req, res) => {
  const stems = await db.select().from(audio_stems);
  res.json({ stems });
});

export default router;
