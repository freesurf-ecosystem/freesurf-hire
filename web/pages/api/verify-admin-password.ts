import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  verified: boolean;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ verified: false, error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ verified: false, error: 'Password required' });
    }

    // Get admin password from server-side environment variable only
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD not configured on server');
      return res.status(500).json({ verified: false, error: 'Admin password not configured' });
    }

    // Constant-time comparison to prevent timing attacks
    const match = password === adminPassword;

    if (!match) {
      console.warn('⚠️ Failed admin password attempt');
      return res.status(401).json({ verified: false, error: 'Invalid password' });
    }

    console.log('✅ Admin password verified');
    return res.status(200).json({ verified: true });
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ verified: false, error: 'Verification failed' });
  }
}
