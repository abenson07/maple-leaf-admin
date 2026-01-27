import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Session cookie name (must match lib/auth.ts)
const SESSION_COOKIE_NAME = 'admin_session';

/**
 * Basic token format validation
 * Full verification happens in API routes which have access to the session store
 * This is a quick check to prevent obviously invalid tokens
 */
function isValidTokenFormat(token: string | null | undefined): boolean {
  if (!token) return false;
  // Session tokens are 64 hex characters (32 bytes * 2)
  return /^[a-f0-9]{64}$/i.test(token);
}

/**
 * Get session cookie from request
 */
function getSessionCookie(request: NextRequest): string | null {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  return cookie?.value || null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page
  if (pathname === '/login' || pathname === '/dashboard/login') {
    // If already authenticated (has valid token format), redirect to dashboard
    const sessionToken = getSessionCookie(request);
    if (isValidTokenFormat(sessionToken)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Allow access to API routes (they handle their own auth with full session verification)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check authentication for all other routes
  // Note: This is a basic format check. Full verification happens in API routes.
  const sessionToken = getSessionCookie(request);
  if (!isValidTokenFormat(sessionToken)) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url);
    // Preserve the original URL as a query parameter for redirect after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
