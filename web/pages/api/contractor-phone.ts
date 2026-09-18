import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, getSupabaseSecretKey } from '../../src/lib/supabaseEnv';

type PhoneResponse = {
  phone?: string | null;
  error?: string;
};

function getSupabaseAdminClient() {
  const secretKey = getSupabaseSecretKey();

  if (!SUPABASE_URL || !secretKey) {
    throw new Error('Server-side Supabase credentials are not configured');
  }

  return createClient(SUPABASE_URL, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Reveals a single contractor's phone number.
 *
 * The number is kept out of the public view on purpose, so it can't be
 * bulk-harvested from the search payload. This returns one number per call,
 * which means scraping has to enumerate contractor ids one request at a time
 * and leaves a request trail.
 *
 * TODO: add per-IP rate limiting (Cloudflare Rate Limiting binding or KV) and
 * log reveals per contractor if harvesting becomes a problem.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PhoneResponse>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contractorId = Array.isArray(req.query.contractorId)
    ? req.query.contractorId[0]
    : req.query.contractorId;

  if (!contractorId) {
    return res.status(400).json({ error: 'contractorId is required' });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();

    // Visibility + the show-phone flag are public; the number itself lives in
    // hire_contractor_private, which anonymous clients cannot read at all.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('hire_contractor_profiles')
      .select('show_phone,is_active,is_searchable,admin_paused')
      .eq('id', contractorId)
      .maybeSingle();

    if (profileError) throw profileError;

    const isPublic =
      profile &&
      profile.is_active &&
      profile.is_searchable &&
      !profile.admin_paused &&
      profile.show_phone;

    if (!isPublic) {
      return res.status(404).json({ error: 'No phone number available' });
    }

    const { data: privateRow, error: privateError } = await supabaseAdmin
      .from('hire_contractor_private')
      .select('phone')
      .eq('contractor_id', contractorId)
      .maybeSingle();

    if (privateError) throw privateError;

    if (!privateRow?.phone) {
      return res.status(404).json({ error: 'No phone number available' });
    }

    return res.status(200).json({ phone: privateRow.phone });
  } catch (error) {
    console.error('[API] Failed to reveal contractor phone:', error);
    return res.status(500).json({ error: 'Could not load phone number' });
  }
}
