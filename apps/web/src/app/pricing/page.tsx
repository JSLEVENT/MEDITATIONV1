'use client';

import PrimaryButton from '../../components/PrimaryButton';
import { apiFetch } from '../../lib/api';
import { useState } from 'react';

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (plan: 'monthly' | 'annual') => {
    setLoadingPlan(plan);
    try {
      const data = await apiFetch<{ url: string }>('/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan })
      });
      window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-sand px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-navy">Choose your plan</h1>
        <p className="text-slate-600 mt-2">
          Unlimited personalized sessions, all frequencies, and full history.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-navy">Monthly</h2>
            <p className="text-slate-600 mt-2">$12.99 / month</p>
            <ul className="mt-4 text-slate-600 space-y-2">
              <li>Unlimited sessions</li>
              <li>Personalized scripts</li>
              <li>Session history</li>
            </ul>
            <PrimaryButton
              className="mt-6 w-full"
              onClick={() => handleCheckout('monthly')}
              disabled={loadingPlan === 'monthly'}
            >
              {loadingPlan === 'monthly' ? 'Redirecting...' : 'Start monthly'}
            </PrimaryButton>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-navy">Annual</h2>
            <p className="text-slate-600 mt-2">$89.99 / year</p>
            <ul className="mt-4 text-slate-600 space-y-2">
              <li>Save 40%</li>
              <li>Unlimited sessions</li>
              <li>Priority support</li>
            </ul>
            <PrimaryButton
              className="mt-6 w-full"
              onClick={() => handleCheckout('annual')}
              disabled={loadingPlan === 'annual'}
            >
              {loadingPlan === 'annual' ? 'Redirecting...' : 'Start annual'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </main>
  );
}
