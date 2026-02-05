import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { getAppSetting, setAppSetting } from '../services/appSettings';
import { DEEPGRAM_VOICES, DEEPGRAM_VOICE_IDS } from '@serenity/shared';

const router = Router();

const defaultTtsModel = process.env.DEEPGRAM_MODEL || 'aura-asteria-en';
const validVoiceIds = new Set(DEEPGRAM_VOICE_IDS);

router.get('/tts-model', authMiddleware, adminMiddleware, async (_req, res) => {
  const current = (await getAppSetting<string>('tts_model')) || defaultTtsModel;
  return res.json({ current, options: DEEPGRAM_VOICES });
});

router.put('/tts-model', authMiddleware, adminMiddleware, async (req, res) => {
  const { model } = req.body || {};

  if (!model || typeof model !== 'string') {
    return res.status(400).json({ error: 'Model is required' });
  }

  if (!validVoiceIds.has(model)) {
    return res.status(400).json({ error: 'Invalid model selection' });
  }

  await setAppSetting('tts_model', model);
  return res.json({ current: model });
});

export default router;
