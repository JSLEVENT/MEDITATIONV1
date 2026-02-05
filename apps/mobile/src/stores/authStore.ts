import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { apiFetch } from '../lib/api';
import type { Session, User } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  onboarded: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setOnboarded: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  onboarded: false,
  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, loading: false });
    if (data.session) {
      await get().refreshProfile();
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
      if (session) {
        void get().refreshProfile();
      } else {
        set({ onboarded: false });
      }
    });
  },
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await get().refreshProfile();
  },
  signUp: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: name ? { name } : undefined }
    });
    if (error) throw error;
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, onboarded: false });
  },
  refreshProfile: async () => {
    try {
      const data = await apiFetch<{ profile: { onboarding_answers?: unknown } | null }>('/users/me');
      set({ onboarded: Boolean(data.profile?.onboarding_answers) });
    } catch (error) {
      set({ onboarded: false });
    }
  },
  setOnboarded: (value) => set({ onboarded: value })
}));
