import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabaseClient = null;

/**
 * Returns an authenticated Supabase client.
 * Dynamically checks environment variables to ensure compatibility with
 * Vercel Serverless Functions, container runtimes, and local environments.
 */
export function getSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Reload dotenv if environment variables are not yet present
  if (!process.env.SUPABASE_URL) {
    dotenv.config();
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.\n' +
      'Please configure them in your .env or Vercel Project Settings.'
    );
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });

  return supabaseClient;
}

export function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
  return Boolean(url && key);
}
