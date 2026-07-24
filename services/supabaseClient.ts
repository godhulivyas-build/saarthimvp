import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || '';
const anonKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Null until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set.
 * Every service that reads/writes real shared data (e.g. buyerDirectory)
 * must check isSupabaseConfigured and fall back gracefully when this is null.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url, anonKey) : null;
