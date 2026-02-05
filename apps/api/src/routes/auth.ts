import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { supabasePublic } from '../lib/supabasePublic';
import { db } from '../lib/db';
import { users } from '@serenity/db';
import { eq } from 'drizzle-orm';

const router = Router();

const ensureUserRecord = async (userId: string, email?: string, name?: string) => {
  const [existing] = await db.select().from(users).where(eq(users.id, userId));
  if (!existing) {
    await db.insert(users).values({
      id: userId,
      email: email || '',
      name: name || null,
      subscription_tier: 'free'
    });
  }
};

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true
  });

  if (error || !data.user) {
    return res.status(400).json({ error: error?.message || 'Signup failed' });
  }

  await ensureUserRecord(data.user.id, data.user.email || email, name);

  return res.status(201).json({ user: data.user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabasePublic.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session || !data.user) {
    return res.status(401).json({ error: error?.message || 'Login failed' });
  }

  await ensureUserRecord(data.user.id, data.user.email || email, data.user.user_metadata?.name);

  return res.json({ session: data.session, user: data.user });
});

router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body || {};

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  const { data, error } = await supabasePublic.auth.refreshSession({
    refresh_token
  });

  if (error || !data.session) {
    return res.status(401).json({ error: error?.message || 'Refresh failed' });
  }

  return res.json({ session: data.session });
});

export default router;
