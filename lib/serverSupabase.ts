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
  // Lazy initialization - only create client when actually used (at runtime, not build time)
  if (!_serverSupabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Validate environment variables at runtime with clear error messages
    if (!supabaseUrl) {
      const errorMsg = 'NEXT_PUBLIC_SUPABASE_URL environment variable is not set. Please configure it in Webflow Cloud environment variables.'
      console.error('[serverSupabase]', errorMsg)
      throw new Error(errorMsg)
    }
    if (!supabaseServiceRoleKey) {
      const errorMsg = 'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Please configure it in Webflow Cloud environment variables.'
      console.error('[serverSupabase]', errorMsg)
      throw new Error(errorMsg)
    }
    
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
  }
  
  return _serverSupabaseClient
}

// Export as a Proxy to enable lazy loading while maintaining the same API
// This allows the client to be created only when actually used, not at module load time
// Using explicit type assertion to work around TypeScript Proxy type inference limitations
export const serverSupabase: ReturnType<typeof createClient> = new Proxy({} as any, {
  get(_target, prop) {
    try {
      const client = getServerSupabaseClient()
      const value = (client as any)[prop]
      // Bind methods to maintain 'this' context
      if (typeof value === 'function') {
        return value.bind(client)
      }
      return value
    } catch (error) {
      // Re-throw with context
      console.error('[serverSupabase] Error accessing property:', prop, error)
      throw error
    }
  }
}) as ReturnType<typeof createClient>
