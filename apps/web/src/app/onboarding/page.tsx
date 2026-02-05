'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '../../components/PrimaryButton';
import { apiFetch } from '../../lib/api';
import { trackEvent } from '../../lib/analytics';

const goalOptions = ['Sleep', 'Anxiety', 'Focus', 'Stress', 'Self-Esteem', 'General Wellness'];
const soundOptions = ['528hz', '432hz', 'rain', 'ocean', 'forest'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [duration, setDuration] = useState(15);
  const [sound, setSound] = useState('528hz');
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]
    );
  };

  const handleFinish = async () => {
    setLoading(true);

    await apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        onboarding_answers: {
          goals,
          duration,
          sound
        },
        preferred_duration: duration,
        preferred_frequency: sound,
        goals
      })
    });

    trackEvent('onboarding_complete');
    document.cookie = 'onboarded=1; path=/';
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-sand px-6">
      <div className="bg-white rounded-xl p-8 w-full max-w-xl shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Let’s personalize your experience</h1>

        {step === 0 && (
          <div className="mt-6">
            <h2 className="font-medium text-navy">What are your primary goals?</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={
                    goals.includes(goal)
                      ? 'bg-teal text-white px-3 py-2 rounded-full'
                      : 'border border-slate-300 px-3 py-2 rounded-full'
                  }
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6">
            <h2 className="font-medium text-navy">Preferred session length</h2>
            <div className="mt-4">
              <input
                type="range"
                min={10}
                max={30}
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
                className="w-full"
              />
              <p className="mt-2 text-slate-600">{duration} minutes</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6">
            <h2 className="font-medium text-navy">Background sound preference</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {soundOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSound(option)}
                  className={
                    sound === option
                      ? 'bg-teal text-white px-3 py-2 rounded-md'
                      : 'border border-slate-300 px-3 py-2 rounded-md'
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
            className="px-3 py-2 rounded-md border border-slate-300"
            disabled={step === 0}
          >
            Back
          </button>
          {step < 2 ? (
            <PrimaryButton onClick={() => setStep((prev) => prev + 1)}>Next</PrimaryButton>
          ) : (
            <PrimaryButton onClick={handleFinish} disabled={loading}>
              {loading ? 'Saving...' : 'Finish'}
            </PrimaryButton>
          )}
        </div>
      </div>
    </main>
  );
}
