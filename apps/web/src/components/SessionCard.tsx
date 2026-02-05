'use client';

import Link from 'next/link';
import type { SessionRecord } from '@serenity/shared';

export default function SessionCard({ session }: { session: SessionRecord }) {
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="block border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm"
    >
      <div className="text-sm text-slate-500">{new Date(session.created_at).toDateString()}</div>
      <div className="text-lg font-semibold text-navy">
        {session.title || 'Untitled Session'}
      </div>
      <div className="text-sm text-slate-600">Status: {session.status}</div>
    </Link>
  );
}
