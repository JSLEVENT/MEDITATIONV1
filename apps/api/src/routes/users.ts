import { Router } from 'express';
import { db } from '../lib/db';
import { users, user_profiles } from '@serenity/db';
import { authMiddleware } from '../middleware/authMiddleware';
import { isAdminEmail } from '../lib/admin';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/me', authMiddleware, async (req, res) => {
  const authUser = req.authUser;

  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [existing] = await db.select().from(users).where(eq(users.id, authUser.id));

  if (!existing) {
    await db.insert(users).values({
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || null,
      subscription_tier: 'free'
    });
  }

  const [user] = await db.select().from(users).where(eq(users.id, authUser.id));
  const [profile] = await db
    .select()
    .from(user_profiles)
    .where(eq(user_profiles.user_id, authUser.id));

  const is_admin = isAdminEmail(authUser.email);
  return res.json({ user, profile, is_admin });
});

router.patch('/me', authMiddleware, async (req, res) => {
  const authUser = req.authUser;

  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, onboarding_answers, preferred_duration, preferred_voice, preferred_frequency, goals } =
    req.body || {};

  if (name) {
    await db.update(users).set({ name }).where(eq(users.id, authUser.id));
  }

  const [existingUser] = await db.select().from(users).where(eq(users.id, authUser.id));
  if (!existingUser) {
    await db.insert(users).values({
      id: authUser.id,
      email: authUser.email || '',
      name: name || authUser.user_metadata?.name || null,
      subscription_tier: 'free'
    });
  }

  const [profile] = await db
    .select()
    .from(user_profiles)
    .where(eq(user_profiles.user_id, authUser.id));

  if (profile) {
    await db
      .update(user_profiles)
      .set({
        onboarding_answers: onboarding_answers ?? profile.onboarding_answers,
        preferred_duration: preferred_duration ?? profile.preferred_duration,
        preferred_voice: preferred_voice ?? profile.preferred_voice,
        preferred_frequency: preferred_frequency ?? profile.preferred_frequency,
        goals: goals ?? profile.goals
      })
      .where(eq(user_profiles.user_id, authUser.id));
  } else {
    await db.insert(user_profiles).values({
      user_id: authUser.id,
      onboarding_answers: onboarding_answers ?? null,
      preferred_duration: preferred_duration ?? 15,
      preferred_voice: preferred_voice ?? 'therapeutic-calm',
      preferred_frequency: preferred_frequency ?? '528hz',
      goals: goals ?? null
    });
  }

  const [updatedProfile] = await db
    .select()
    .from(user_profiles)
    .where(eq(user_profiles.user_id, authUser.id));

  return res.json({ profile: updatedProfile });
});

export default router;
