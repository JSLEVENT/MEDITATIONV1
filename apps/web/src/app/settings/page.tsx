'use client';

import { useEffect, useMemo, useState } from 'react';
import PrimaryButton from '../../components/PrimaryButton';
import { apiFetch } from '../../lib/api';
import { setTheme } from '../../lib/theme';

type AdminVoiceOption = {
  id: string;
  name: string;
  group: string;
  language: string;
  family: 'Aura 2' | 'Aura 1';
};

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(15);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ttsModel, setTtsModel] = useState('');
  const [ttsOptions, setTtsOptions] = useState<AdminVoiceOption[]>([]);
  const [savingTts, setSavingTts] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await apiFetch<{
        user: { name: string | null };
        profile: { preferred_duration: number };
        is_admin?: boolean;
      }>('/users/me');
      setName(data.user?.name || '');
      setDuration(data.profile?.preferred_duration || 15);
      setIsAdmin(Boolean(data.is_admin));

      if (data.is_admin) {
        const adminData = await apiFetch<{ current: string; options: AdminVoiceOption[] }>(
          '/admin/tts-model'
        );
        setTtsModel(adminData.current);
        setTtsOptions(adminData.options);
      }
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

  const groupedOptions = useMemo(() => {
    const groups: Record<string, AdminVoiceOption[]> = {};
    for (const option of ttsOptions) {
      if (!groups[option.group]) {
        groups[option.group] = [];
      }
      groups[option.group].push(option);
    }
    return groups;
  }, [ttsOptions]);

  const groupOrder = useMemo(
    () => Array.from(new Set(ttsOptions.map((option) => option.group))),
    [ttsOptions]
  );

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

        {isAdmin && (
          <div className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="text-lg font-semibold text-navy">Admin settings</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-600">Default TTS voice</label>
                <select
                  value={ttsModel}
                  onChange={(event) => setTtsModel(event.target.value)}
                  className="mt-1 w-full"
                >
                  {groupOrder.map((group) => (
                    <optgroup key={group} label={group}>
                      {(groupedOptions[group] || []).map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <PrimaryButton
                onClick={async () => {
                  setSavingTts(true);
                  await apiFetch('/admin/tts-model', {
                    method: 'PUT',
                    body: JSON.stringify({ model: ttsModel })
                  });
                  setSavingTts(false);
                }}
                disabled={savingTts || !ttsModel}
              >
                {savingTts ? 'Saving voice...' : 'Save voice'}
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
