import { createSupabaseClient } from './supabaseClient';

export const signUp = async (email: string, password: string, name?: string) => {
  const supabase = createSupabaseClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined
    }
  });
};

export const signIn = async (email: string, password: string) => {
  const supabase = createSupabaseClient();
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  const supabase = createSupabaseClient();
  return supabase.auth.signOut();
};

export const getSession = async () => {
  const supabase = createSupabaseClient();
  return supabase.auth.getSession();
};
