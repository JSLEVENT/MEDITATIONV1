import { Request, Response, NextFunction } from 'express';
import { Redis } from '@upstash/redis';
import { db } from '../lib/db';
import { users } from '@serenity/db';
import { eq } from 'drizzle-orm';

const redisUrl = process.env.UPSTASH_REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_TOKEN;

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const incrementWithExpiry = async (key: string, windowSeconds: number) => {
  if (!redis) return 0;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return current;
};

export const generalRateLimit = (limit: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redis) {
      return next();
    }

    const ip = req.headers['x-forwarded-for']?.toString() || req.ip || 'unknown';
    const key = `rate:general:${ip}`;
    const current = await incrementWithExpiry(key, windowSeconds);

    if (current > limit) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    return next();
  };
};

export const sessionCreateRateLimit = (limit: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redis) {
      return next();
    }

    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const tier = user?.subscription_tier || 'free';

    if (tier !== 'free') {
      return next();
    }

    const key = `rate:sessions:${userId}`;
    const current = await incrementWithExpiry(key, windowSeconds);

    if (current > limit) {
      return res.status(429).json({ error: 'Free tier limit reached for this period' });
    }

    return next();
  };
};
