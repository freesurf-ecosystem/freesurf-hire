import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { SUPABASE_URL, getSupabaseSecretKey } from '../../src/lib/supabaseEnv';
import { SUBSCRIPTION_CONSENT_VERSION, UpdateList } from '../../src/config/subscriptions';

type SubscribeResponse = {
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

/** Server-derived; never trust a client-supplied IP for a consent record. */
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

/**
 * Records marketing opt-ins and opt-outs.
 *
 * `lists` is additive (subscribe to these), `unsubscribe` is subtractive. The
 * split matters: a caller that only knows about one list (the Post dashboard)
 * must not implicitly unsubscribe the user from everything else.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubscribeResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, lists, unsubscribe, source } = req.body ?? {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  const toSubscribe: UpdateList[] = Array.isArray(lists) ? lists : [];
  const toUnsubscribe: UpdateList[] = Array.isArray(unsubscribe) ? unsubscribe : [];

  if (toSubscribe.length === 0 && toUnsubscribe.length === 0) {
    return res.status(400).json({ error: 'At least one list is required' });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const userAgent = req.headers['user-agent'];
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    if (toSubscribe.length > 0) {
      const rows = toSubscribe.map((list) => ({
        email: normalizedEmail,
        list,
        status: 'subscribed',
        source: source ? String(source) : null,
        consent_version: SUBSCRIPTION_CONSENT_VERSION,
        consented_at: now,
        consent_ip: getClientIp(req),
        user_agent: typeof userAgent === 'string' ? userAgent : null,
        unsubscribe_token: randomUUID(),
        unsubscribed_at: null,
        updated_at: now,
      }));

      // Re-subscribing clears a previous unsubscribe rather than duplicating.
      const { error } = await supabaseAdmin
        .from('update_subscriptions')
        .upsert(rows, { onConflict: 'email,list' });

      if (error) throw error;
    }

    if (toUnsubscribe.length > 0) {
      const { error } = await supabaseAdmin
        .from('update_subscriptions')
        .update({ status: 'unsubscribed', unsubscribed_at: now, updated_at: now })
        .eq('email', normalizedEmail)
        .in('list', toUnsubscribe);

      if (error) throw error;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Failed to record subscription change:', error);
    return res.status(500).json({ error: 'Could not record subscription' });
  }
}
