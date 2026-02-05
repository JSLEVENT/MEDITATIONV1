import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = (supabaseUrl?: string, supabaseAnonKey?: string) => {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient(url, key);
};
