'use client';

export type ThemeMode = 'light' | 'dark';

export const initTheme = () => {
  if (typeof window === 'undefined') return;
  const stored = window.localStorage.getItem('theme');
  if (stored === 'dark') {
    document.documentElement.classList.add('dark');
  }
};

export const setTheme = (mode: ThemeMode) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('theme', mode);
  document.documentElement.classList.toggle('dark', mode === 'dark');
};
