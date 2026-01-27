import { createClient } from '@supabase/supabase-js'

// Prevent this from being imported in browser/client code
if (typeof window !== 'undefined') {
  throw new Error(
    'serverSupabase cannot be imported in client-side code. ' +
    'Use supabaseClient instead for browser/client operations.'
  )
}

/**
 * Get server-side Supabase client with lazy initialization and runtime validation.
 * Server-side Supabase instance for use in API routes and getServerSideProps.
 * Uses the service role key and bypasses Row Level Security (RLS).
 * 
 * ⚠️ SECURITY WARNING: This client has full database access.
 * - NEVER import this in client-side code
 * - ONLY use in server-side contexts (API routes, getServerSideProps, etc.)
 * - Always validate user permissions before performing operations
 */
let _serverSupabaseClient: ReturnType<typeof createClient> | null = null;

function getServerSupabaseClient() {
  // #region agent log
  console.error('[DEBUG] getServerSupabaseClient called, hasClient:', !!_serverSupabaseClient);
  // #endregion
  
  // Lazy initialization - only create client when actually used (at runtime, not build time)
  if (!_serverSupabaseClient) {
    // #region agent log
    console.error('[DEBUG] Creating new Supabase client');
    // #endregion
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // #region agent log
    console.error('[DEBUG] Env vars check - hasUrl:', !!supabaseUrl, 'hasKey:', !!supabaseServiceRoleKey);
    // #endregion

    // Validate environment variables at runtime with clear error messages
    if (!supabaseUrl) {
      const errorMsg = 'NEXT_PUBLIC_SUPABASE_URL environment variable is not set. Please configure it in Webflow Cloud environment variables.'
      // #region agent log
      console.error('[DEBUG] Missing SUPABASE_URL');
      // #endregion
      console.error('[serverSupabase]', errorMsg)
      throw new Error(errorMsg)
    }
    if (!supabaseServiceRoleKey) {
      const errorMsg = 'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Please configure it in Webflow Cloud environment variables.'
      // #region agent log
      console.error('[DEBUG] Missing SERVICE_ROLE_KEY');
      // #endregion
      console.error('[serverSupabase]', errorMsg)
      throw new Error(errorMsg)
    }
    
    // #region agent log
    console.error('[DEBUG] Creating Supabase client instance, url length:', supabaseUrl.length);
    // #endregion
    
    _serverSupabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // #region agent log
    console.error('[DEBUG] Supabase client created successfully');
    // #endregion
  }
  
  return _serverSupabaseClient
}

// Export the client directly - lazy initialization happens in getServerSupabaseClient()
// Simple approach: just return the client when accessed
export const serverSupabase = getServerSupabaseClient()
