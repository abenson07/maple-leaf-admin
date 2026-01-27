import type { NextApiRequest, NextApiResponse } from 'next';
import { comparePasswords, createSession, getSessionCookieName } from '@/lib/auth';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Use constant-time comparison to prevent timing attacks
    if (!comparePasswords(password, expectedPassword)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create session
    const sessionToken = createSession();

    // Set httpOnly cookie
    const cookieName = getSessionCookieName();
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAge = 24 * 60 * 60; // 24 hours in seconds

    res.setHeader(
      'Set-Cookie',
      `${cookieName}=${sessionToken}; HttpOnly; Path=/dashboard; Max-Age=${maxAge}; SameSite=Strict${isProduction ? '; Secure' : ''}`
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
