import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// These are injected at build time (see .env.example and the deploy workflow).
// The anon key is designed to be public — it ships in the static bundle.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * The Supabase client, or `null` when env vars are absent. When `null`, the app
 * runs local-only (localStorage) — which keeps `npm run dev`/tests working
 * without secrets and provides a graceful fallback if config is missing.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

/** Table holding one row per sync code: `{ id, data, updated_at }`. */
export const PROGRESS_TABLE = "progress";
