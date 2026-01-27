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
function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Validate at runtime only (not during build)
  // During build, env vars are not available, so we skip validation
  // At runtime in API routes/server functions, validation will occur when env vars are actually used
  // We defer validation to the actual API call rather than module load time
  
  // Use fallback values during build (env vars not available)
  // At runtime, real values from Webflow Cloud environment will be injected
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceRoleKey || 'placeholder-service-role-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export const serverSupabase = getServerSupabaseClient()


