'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import PrimaryButton from '../../components/PrimaryButton';
import SessionCard from '../../components/SessionCard';
import { useSessionStore } from '../../stores/useSessionStore';
import { useAuthStore } from '../../stores/useAuthStore';

export default function DashboardPage() {
  const { sessions, fetchSessions, loading } = useSessionStore();
  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  return (
    <main className="min-h-screen bg-sand px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-navy">Your Sessions</h1>
            <p className="text-slate-600">Ready to create a new meditation?</p>
          </div>
          <div className="flex gap-3">
            <Link href="/settings" className="px-4 py-2 rounded-md border border-slate-300">
              Settings
            </Link>
            <button onClick={() => void signOut()} className="px-4 py-2 rounded-md border border-slate-300">
              Log out
            </button>
            <Link href="/sessions/new">
              <PrimaryButton>New Session</PrimaryButton>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {loading && <div className="text-slate-600">Loading sessions...</div>}
          {!loading && sessions.length === 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <p className="text-slate-600">No sessions yet. Create your first one.</p>
            </div>
          )}
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </main>
  );
}
