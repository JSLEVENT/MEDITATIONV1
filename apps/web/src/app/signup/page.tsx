'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '../../components/PrimaryButton';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { trackEvent } from '../../lib/analytics';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (signUpError) {
        throw signUpError;
      }

      trackEvent('signup');
      if (data.session) {
        document.cookie = 'onboarded=0; path=/';
        router.push('/onboarding');
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-sand px-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 w-full max-w-md shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Create your account</h1>
        <p className="text-slate-600 mt-2">Start your personalized meditation journey.</p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
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
          {loading ? 'Creating account...' : 'Sign up'}
        </PrimaryButton>
      </form>
    </main>
  );
}
