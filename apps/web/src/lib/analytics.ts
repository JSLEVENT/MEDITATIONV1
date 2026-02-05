'use client';

import posthog from 'posthog-js';

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export const initAnalytics = () => {
  if (!key) return;
  posthog.init(key, {
    api_host: host || 'https://us.i.posthog.com',
    capture_pageview: true
  });
};

export const trackEvent = (event: string, properties?: Record<string, unknown>) => {
  if (!key) return;
  posthog.capture(event, properties);
};
