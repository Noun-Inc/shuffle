import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 * Never import this in client components — it bypasses all RLS.
 * Only use inside Next.js API route handlers (src/app/api/).
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase server credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
