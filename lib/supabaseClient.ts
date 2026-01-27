import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Client-side Supabase instance for use in React components and client-side code.
 * Uses lazy initialization to avoid build-time errors when environment variables are not available.
 * The client is only created when actually accessed at runtime, not during module initialization.
 */
let _supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  // Lazy initialization - only create client when actually used (at runtime, not build time)
  if (!_supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate environment variables at runtime
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase environment variables. Please check your .env.local file. " +
        "Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return _supabaseClient;
}

// Create a proxy that lazily initializes the client on first access
// This allows the module to be imported during build without throwing errors
export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    // Bind methods to maintain correct 'this' context
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
