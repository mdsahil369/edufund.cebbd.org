import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Creates the browser-side Supabase client. createBrowserClient reuses a
 * single instance internally, so this helper can be called from anywhere in
 * client components.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();

  return createBrowserClient(url, publishableKey);
}
