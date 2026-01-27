import { randomBytes, timingSafeEqual } from 'crypto';
import type { NextApiRequest } from 'next';

// In-memory session store
// In production, consider using Redis or a database
interface Session {
  token: string;
  expiresAt: number;
}

const sessions = new Map<string, Session>();

// Session configuration
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_COOKIE_NAME = 'admin_session';

/**
 * Create a new session token
 */
export function createSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a new session and return the token
 */
export function createSession(): string {
  const token = createSessionToken();
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  
  sessions.set(token, { token, expiresAt });
  
  // Clean up expired sessions periodically
  cleanupExpiredSessions();
  
  return token;
}

/**
 * Verify if a session token is valid
 */
export function verifySession(token: string | null | undefined): boolean {
  if (!token) return false;
  
  const session = sessions.get(token);
  if (!session) return false;
  
  // Check if session has expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return false;
  }
  
  return true;
}

/**
 * Delete a session
 */
export function deleteSession(token: string): void {
  sessions.delete(token);
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}

/**
 * Get session cookie from request
 */
export function getSessionCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  
  const cookiePairs = cookies.split(';').map(c => c.trim());
  for (const pair of cookiePairs) {
    const [name, value] = pair.split('=');
    if (name === SESSION_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

/**
 * Constant-time password comparison to prevent timing attacks
 */
export function comparePasswords(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) {
    // Still do comparison to maintain constant time
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected + ' '));
    return false;
  }
  
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Get the session cookie name
 */
export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}
