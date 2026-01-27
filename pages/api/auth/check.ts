import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionCookie, verifySession } from '@/lib/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionToken = getSessionCookie(req);
    const authenticated = verifySession(sessionToken);

    return res.status(200).json({ authenticated });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
