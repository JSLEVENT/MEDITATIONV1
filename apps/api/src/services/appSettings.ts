import { db } from '../lib/db';
import { app_settings } from '@serenity/db';
import { eq } from 'drizzle-orm';

export const getAppSetting = async <T>(key: string): Promise<T | null> => {
  const [row] = await db.select().from(app_settings).where(eq(app_settings.key, key));
  if (!row) return null;
  return row.value as T;
};

export const setAppSetting = async <T>(key: string, value: T) => {
  await db
    .insert(app_settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: app_settings.key,
      set: { value, updated_at: new Date() }
    });
};
