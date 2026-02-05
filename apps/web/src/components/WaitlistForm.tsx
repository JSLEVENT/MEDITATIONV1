'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch(`${API_URL}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="flex-1"
      />
      <button className="bg-teal text-white px-6 py-2 rounded-md" type="submit">
        {status === 'loading' ? 'Joining...' : 'Join waitlist'}
      </button>
      {status === 'success' && <p className="text-teal">You’re on the list.</p>}
      {status === 'error' && <p className="text-red-600">Try again soon.</p>}
    </form>
  );
}
