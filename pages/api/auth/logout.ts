import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionCookie, deleteSession, getSessionCookieName } from '@/lib/auth';

export const config = {
  api: {
    bodyParser: false,
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
    // Get and delete session
    const sessionToken = getSessionCookie(req);
    if (sessionToken) {
      deleteSession(sessionToken);
    }

    // Clear cookie
    const cookieName = getSessionCookieName();
    res.setHeader(
      'Set-Cookie',
      `${cookieName}=; HttpOnly; Path=/dashboard; Max-Age=0; SameSite=Strict`
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
