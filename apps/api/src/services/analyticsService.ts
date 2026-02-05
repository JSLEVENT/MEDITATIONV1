import { db } from '../lib/db';
import { analytics_events } from '@serenity/db';

export const trackAnalyticsEvent = async (
  userId: string | null,
  eventType: string,
  properties?: Record<string, unknown>
) => {
  try {
    await db.insert(analytics_events).values({
      user_id: userId ?? null,
      event_type: eventType,
      properties: properties ?? null
    });
  } catch (error) {
    // Best-effort analytics only.
  }
};
