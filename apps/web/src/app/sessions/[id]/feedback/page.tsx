'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PrimaryButton from '../../../../components/PrimaryButton';
import { apiFetch } from '../../../../lib/api';
import { trackEvent } from '../../../../lib/analytics';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [rating, setRating] = useState(5);
  const [helpful, setHelpful] = useState(true);
  const [tooLong, setTooLong] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    await apiFetch(`/sessions/${sessionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({
        rating,
        helpful,
        too_long: tooLong,
        too_short: tooShort,
        notes
      })
    });

    trackEvent('session_feedback_submitted', { rating });
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-sand px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">How was your session?</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-600">Rating</label>
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={helpful} onChange={(event) => setHelpful(event.target.checked)} />
              Helpful
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={tooLong} onChange={(event) => setTooLong(event.target.checked)} />
              Too long
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={tooShort} onChange={(event) => setTooShort(event.target.checked)} />
              Too short
            </label>
          </div>

          <textarea
            placeholder="Optional notes"
            className="w-full min-h-[120px]"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />

          <PrimaryButton className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit feedback'}
          </PrimaryButton>
        </form>
      </div>
    </main>
  );
}
