import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, getSupabaseSecretKey } from '../../src/lib/supabaseEnv';

type DeleteMobileAccountResponse = {
  error?: string;
  success?: boolean;
};

function getSupabaseAdminClient() {
  const secretKey = getSupabaseSecretKey();

  if (!SUPABASE_URL || !secretKey) {
    throw new Error('Server-side Supabase credentials are not configured');
  }

  return createClient(SUPABASE_URL, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getBearerToken(req: NextApiRequest): string {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteMobileAccountResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessToken = getBearerToken(req);

  if (!accessToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid user session' });
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id, false);

    if (deleteError) {
      console.error('[API] Mobile account deletion failed:', deleteError);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Mobile account deletion crashed:', error);
    return res.status(500).json({ error: 'Unable to delete account right now' });
  }
}