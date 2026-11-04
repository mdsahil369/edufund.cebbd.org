import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let publicClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Cookie-less Supabase client for public, read-only data.
 *
 * Public pages are rendered on demand, but this client still avoids the
 * request-scoped cookie machinery: it uses the publishable key and the `anon`
 * role, which can only read the `public_students` view.
 */
export function createPublicClient() {
  if (publicClient) return publicClient;

  const { url, publishableKey } = getSupabaseEnv();
  publicClient = createSupabaseClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return publicClient;
}
