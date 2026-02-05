'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSteps from '../../../components/LoadingSteps';
import PrimaryButton from '../../../components/PrimaryButton';
import AudioPlayer from '../../../components/AudioPlayer';
import { useSessionStore } from '../../../stores/useSessionStore';
import { apiFetch } from '../../../lib/api';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { currentSession, fetchSession, loading } = useSessionStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      void fetchSession(sessionId);
    }
  }, [sessionId, fetchSession]);

  useEffect(() => {
    if (currentSession?.session.status === 'generating') {
      const interval = setInterval(() => {
        void fetchSession(sessionId);
      }, 3000);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [currentSession?.session.status, sessionId, fetchSession]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % 4);
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAudio = async () => {
      if (currentSession?.session.status !== 'ready') return;
      if (!currentSession.session.audio_url) return;

      try {
        const data = await apiFetch<{ url: string }>(`/sessions/${sessionId}/stream`);
        setAudioUrl(data.url);
      } catch (error) {
        setAudioUrl(currentSession.session.audio_url);
      }
    };

    void loadAudio();
  }, [currentSession?.session.status, currentSession?.session.audio_url, sessionId]);

  const session = currentSession?.session;
  const script = currentSession?.script;
  const input = currentSession?.input as { parsed_themes?: { safety_alert?: boolean; resources?: { title: string; phone?: string; text?: string; url?: string }[] } } | undefined;
  const safetyResources = input?.parsed_themes?.safety_alert ? input.parsed_themes.resources || [] : [];

  const phases = useMemo(() => {
    if (!script?.phases) return [];
    return script.phases as { name: string; duration_seconds: number; script_text: string }[];
  }, [script]);

  if (!session) {
    return (
      <main className="min-h-screen bg-sand px-6 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-sm">
          <p className="text-slate-600">Loading session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sand px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">{session.title || 'Your Session'}</h1>
        <p className="text-slate-600 mt-2">Status: {session.status}</p>

        {session.status === 'generating' && (
          <div className="mt-6 space-y-4">
            <LoadingSteps stepIndex={stepIndex} />
            {loading && <div className="text-slate-500">Still working...</div>}
          </div>
        )}

        {session.status === 'failed' && (
          <div className="mt-6">
            <p className="text-red-600">
              {safetyResources.length > 0
                ? 'It sounds like you might be in crisis. Please reach out for immediate support.'
                : 'We could not generate this session. Please try again or adjust your input.'}
            </p>
            {safetyResources.length > 0 && (
              <div className="mt-4 space-y-2 text-slate-600">
                {safetyResources.map((resource) => (
                  <div key={resource.title} className="border border-slate-200 rounded-md p-3">
                    <div className="font-semibold text-navy">{resource.title}</div>
                    {resource.phone && <div>Call: {resource.phone}</div>}
                    {resource.text && <div>{resource.text}</div>}
                    {resource.url && (
                      <a href={resource.url} className="underline text-teal">
                        {resource.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            <PrimaryButton className="mt-4" onClick={() => router.push('/sessions/new')}>
              Create a new session
            </PrimaryButton>
          </div>
        )}

        {session.status === 'ready' && (
          <div className="mt-6 space-y-6">
            <div className="bg-sand p-4 rounded-lg">
              <p className="text-slate-700">
                Your guided script is ready. Press play to begin your session.
              </p>
              {audioUrl ? (
                <div className="mt-4">
                  <AudioPlayer src={audioUrl} />
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-3">
                  Audio is still processing or unavailable. You can still read the script below.
                </p>
              )}
              <PrimaryButton className="mt-3" onClick={() => router.push(`/sessions/${session.id}/feedback`)}>
                Leave feedback
              </PrimaryButton>
            </div>

            <div className="space-y-4">
              {phases.map((phase) => (
                <div key={phase.name} className="border border-slate-200 rounded-lg p-4">
                  <h2 className="font-semibold text-navy">{phase.name}</h2>
                  <p className="text-sm text-slate-500">
                    {Math.round(phase.duration_seconds / 60)} minutes
                  </p>
                  <p className="mt-3 text-slate-700 whitespace-pre-wrap">{phase.script_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
