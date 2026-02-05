'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { initAnalytics } from '../lib/analytics';
import { initTheme } from '../lib/theme';

export default function Providers({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
    initAnalytics();
    initTheme();
  }, [initialize]);

  return <>{children}</>;
}
