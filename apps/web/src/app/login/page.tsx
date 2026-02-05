'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '../../components/PrimaryButton';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { apiFetch } from '../../lib/api';
import { trackEvent } from '../../lib/analytics';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      const data = await apiFetch<{ profile: { onboarding_answers: unknown } | null }>('/users/me');
      const hasOnboarded = Boolean(data.profile?.onboarding_answers);
      trackEvent('login');
      document.cookie = `onboarded=${hasOnboarded ? '1' : '0'}; path=/`;
      router.push(hasOnboarded ? '/dashboard' : '/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-sand px-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 w-full max-w-md shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Log in</h1>
        <p className="text-slate-600 mt-2">Welcome back to Serenity AI.</p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <div className="text-red-600 mt-4">{error}</div>}

        <PrimaryButton className="mt-6 w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Log in'}
        </PrimaryButton>
      </form>
    </main>
  );
}
