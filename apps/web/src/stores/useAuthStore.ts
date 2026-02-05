'use client';

import { create } from 'zustand';
import { getSupabaseClient } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialize: async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });
  },
  signOut: async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    set({ session: null, user: null });
  }
}));
