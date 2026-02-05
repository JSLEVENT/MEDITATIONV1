'use client';

import { useEffect, useState } from 'react';
import PrimaryButton from '../../components/PrimaryButton';
import { apiFetch } from '../../lib/api';
import { setTheme } from '../../lib/theme';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(15);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await apiFetch<{ user: { name: string | null }; profile: { preferred_duration: number } }>(
        '/users/me'
      );
      setName(data.user?.name || '');
      setDuration(data.profile?.preferred_duration || 15);
    };

    void loadProfile();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name, preferred_duration: duration })
    });
    setSaving(false);
  };

  const handleManage = async () => {
    const data = await apiFetch<{ url: string }>('/subscriptions/portal', { method: 'POST' });
    window.location.href = data.url;
  };

  return (
    <main className="min-h-screen bg-sand px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Settings</h1>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-600">Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-slate-600">Preferred duration</label>
            <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
              {[10, 15, 20, 25, 30].map((value) => (
                <option key={value} value={value}>
                  {value} minutes
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between border border-slate-200 rounded-md px-3 py-2">
            <span className="text-sm text-slate-600">Dark mode</span>
            <button
              className="px-3 py-1 rounded-md border border-slate-300"
              onClick={() => {
                const next = !darkMode;
                setDarkMode(next);
                setTheme(next ? 'dark' : 'light');
              }}
            >
              {darkMode ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </PrimaryButton>
          <button className="px-4 py-2 rounded-md border border-slate-300" onClick={handleManage}>
            Manage subscription
          </button>
        </div>
      </div>
    </main>
  );
}
