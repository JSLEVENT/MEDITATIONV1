'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '../../../components/PrimaryButton';
import { apiFetch } from '../../../lib/api';
import { trackEvent } from '../../../lib/analytics';

export default function NewSessionPage() {
  const router = useRouter();
  const [rawText, setRawText] = useState('');
  const [duration, setDuration] = useState(15);
  const [sound, setSound] = useState('528hz');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as typeof window & { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof window.SpeechRecognition })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRawText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<{ session_id: string }>('/sessions/create', {
        method: 'POST',
        body: JSON.stringify({ raw_text: rawText, duration_minutes: duration, sound })
      });

      trackEvent('session_created', { duration, sound });
      router.push(`/sessions/${data.session_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-sand px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">New Session</h1>
        <p className="text-slate-600 mt-2">Describe what you are dealing with.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea
            className="w-full min-h-[140px]"
            placeholder="What is on your mind today?"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            required
          />

          <div>
            <label className="block text-sm text-slate-600">Duration</label>
            <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
              {[10, 15, 20, 25, 30].map((value) => (
                <option key={value} value={value}>
                  {value} minutes
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600">Background sound</label>
            <select value={sound} onChange={(event) => setSound(event.target.value)}>
              {['528hz', '432hz', 'rain', 'ocean', 'forest'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-red-600">
              {error}
              {error.includes('Free tier') && (
                <div className="mt-2 text-sm">
                  Upgrade to unlimited sessions on the{' '}
                  <a href="/pricing" className="underline">
                    pricing page
                  </a>
                  .
                </div>
              )}
            </div>
          )}

          <PrimaryButton className="w-full" disabled={loading}>
            {loading ? 'Generating...' : 'Generate my session'}
          </PrimaryButton>
          <button
            type="button"
            className="w-full border border-slate-300 rounded-md px-4 py-2"
            onClick={handleVoiceInput}
            disabled={listening}
          >
            {listening ? 'Listening...' : 'Use voice input'}
          </button>
          <p className="text-xs text-slate-500">
            Serenity AI is a wellness tool and not a substitute for professional mental health
            treatment.
          </p>
        </form>
      </div>
    </main>
  );
}
