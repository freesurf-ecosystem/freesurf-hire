import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, getSupabaseSecretKey } from '../../src/lib/supabaseEnv';

type ConsentResponse = {
  success?: boolean;
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
 * Derive the client IP server-side. Never trust a client-supplied value — the
 * whole point of this record is that it can't be forged.
 */
function getClientIp(req: NextApiRequest): string | null {
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) return cfIp.trim();

  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof first === 'string' && first.trim()) {
    return first.split(',')[0].trim();
  }

  return req.socket?.remoteAddress ?? null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConsentResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { context, contractorId, termsVersion, sessionId } = req.body ?? {};

  if (!context || !termsVersion) {
    return res.status(400).json({ error: 'context and termsVersion are required' });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const userAgent = req.headers['user-agent'];

    // Shared consent ledger across the ecosystem. `user_id` is the subject:
    // an anonymous session id for visitors who are not signed in.
    const { error } = await supabaseAdmin.from('consents').insert({
      user_id: sessionId ? String(sessionId) : `anon-${Date.now()}`,
      type: 'terms_of_use',
      version: String(termsVersion),
      context: String(context),
      ip: getClientIp(req),
      user_agent: typeof userAgent === 'string' ? userAgent : null,
      metadata: contractorId ? { contractor_id: String(contractorId) } : null,
    });

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Failed to record terms acceptance:', error);
    return res.status(500).json({ error: 'Could not record acceptance' });
  }
}
