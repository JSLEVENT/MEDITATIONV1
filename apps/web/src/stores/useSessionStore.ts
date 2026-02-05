'use client';

import { create } from 'zustand';
import { apiFetch } from '../lib/api';
import type { SessionRecord, SessionScriptRecord, SessionInputRecord } from '@serenity/shared';

type SessionDetail = {
  session: SessionRecord;
  script?: SessionScriptRecord;
  input?: SessionInputRecord;
};

type SessionState = {
  sessions: SessionRecord[];
  currentSession: SessionDetail | null;
  loading: boolean;
  fetchSessions: () => Promise<void>;
  fetchSession: (id: string) => Promise<void>;
  clearCurrent: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSession: null,
  loading: false,
  fetchSessions: async () => {
    set({ loading: true });
    try {
      const data = await apiFetch<{ sessions: SessionRecord[] }>('/sessions');
      set({ sessions: data.sessions, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
  fetchSession: async (id: string) => {
    set({ loading: true });
    try {
      const data = await apiFetch<{
        session: SessionRecord;
        script?: SessionScriptRecord;
        input?: SessionInputRecord;
      }>(`/sessions/${id}`);
      set({ currentSession: data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
  clearCurrent: () => set({ currentSession: null })
}));
