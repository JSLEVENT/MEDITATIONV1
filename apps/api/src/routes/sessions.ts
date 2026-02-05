import { Router } from 'express';
import { db } from '../lib/db';
import {
  sessions,
  session_scripts,
  session_inputs,
  session_feedback,
  users
} from '@serenity/db';
import { authMiddleware } from '../middleware/authMiddleware';
import { sessionCreateRateLimit } from '../middleware/rateLimitMiddleware';
import { generationOrchestrator } from '../services/generationOrchestrator';
import { getSignedAudioUrl } from '../services/storageService';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

const router = Router();

router.post('/create', authMiddleware, sessionCreateRateLimit(10, 60 * 60), async (req, res) => {
  const authUser = req.authUser;

  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { raw_text, duration_minutes, sound } = req.body || {};

  if (!raw_text || typeof raw_text !== 'string') {
    return res.status(400).json({ error: 'raw_text is required' });
  }

  const sanitizedText = raw_text.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 2000);
  if (!sanitizedText) {
    return res.status(400).json({ error: 'raw_text is required' });
  }

  const durationInput = Number(duration_minutes) || 15;
  const durationMinutes = Math.min(Math.max(durationInput, 10), 30);

  const [user] = await db.select().from(users).where(eq(users.id, authUser.id));
  const tier = user?.subscription_tier || 'free';

  if (tier === 'free') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessions)
      .where(and(eq(sessions.user_id, authUser.id), gte(sessions.created_at, weekAgo)));

    if (Number(count) >= 2) {
      return res.status(403).json({ error: 'Free tier weekly limit reached' });
    }
  }

  const [session] = await db
    .insert(sessions)
    .values({
      user_id: authUser.id,
      status: 'generating',
      duration_seconds: durationMinutes * 60,
      title: 'Generating your session'
    })
    .returning();

  if (!session) {
    return res.status(500).json({ error: 'Failed to create session' });
  }

  void generationOrchestrator({
    sessionId: session.id,
    rawText: sanitizedText,
    durationMinutes,
    soundPreference: sound
  }).catch((error) => console.error('Generation failed', error));

  return res.status(202).json({ session_id: session.id });
});

router.get('/:id', authMiddleware, async (req, res) => {
  const authUser = req.authUser;
  const sessionId = req.params.id;

  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.user_id, authUser.id)));

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const [script] = await db
    .select()
    .from(session_scripts)
    .where(eq(session_scripts.session_id, sessionId));

  const [input] = await db
    .select()
    .from(session_inputs)
    .where(eq(session_inputs.session_id, sessionId));

  return res.json({ session, script, input });
});

router.get('/:id/stream', authMiddleware, async (req, res) => {
  const authUser = req.authUser;
  const sessionId = req.params.id;

  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.user_id, authUser.id)));

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (!session.audio_url) {
    return res.status(404).json({ error: 'Audio not available yet' });
  }

  if (session.audio_url.startsWith('http')) {
    return res.json({ url: session.audio_url });
  }

  const signed = await getSignedAudioUrl(session.audio_url, 3600);
  return res.json({ url: signed });
});

router.get('/', authMiddleware, async (req, res) => {
  const authUser = req.authUser;

  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;

  const data = await db
    .select()
    .from(sessions)
    .where(eq(sessions.user_id, authUser.id))
    .orderBy(desc(sessions.created_at))
    .limit(limit)
    .offset(offset);

  return res.json({ sessions: data, limit, offset });
});

router.post('/:id/feedback', authMiddleware, async (req, res) => {
  const authUser = req.authUser;
  const sessionId = req.params.id;
  const { rating, helpful, too_long, too_short, notes } = req.body || {};

  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.user_id, authUser.id)));

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  await db.insert(session_feedback).values({
    session_id: sessionId,
    user_id: authUser.id,
    rating: Number(rating),
    helpful: helpful ?? null,
    too_long: too_long ?? null,
    too_short: too_short ?? null,
    notes: notes ?? null
  });

  return res.status(201).json({ status: 'ok' });
});

export default router;
