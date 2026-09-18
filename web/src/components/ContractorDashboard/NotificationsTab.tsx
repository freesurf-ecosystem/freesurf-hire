import React, { useEffect, useState } from 'react';
import { Mail, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  FEEDFREE_DIGEST_URL,
  SUBSCRIPTION_DISCLOSURE,
  UPDATE_LISTS,
  UpdateList,
} from '../../config/subscriptions';

interface NotificationsTabProps {
  profile: { id: string };
}

const LIST_COPY: Record<UpdateList, { title: string; description: string }> = {
  product_updates: {
    title: 'FreeSurf contractor network updates',
    description: 'Product news and changes that affect your profile and requests.',
  },
  ecosystem_updates: {
    title: 'Other FreeSurf products',
    description: 'Occasional news about our other free tools.',
  },
};

const ALL_LISTS: UpdateList[] = [UPDATE_LISTS.PRODUCT, UPDATE_LISTS.ECOSYSTEM];

/**
 * Email preferences.
 *
 * These used to be collected during account creation, which meant anyone signing
 * up with Google / Apple / Facebook never saw them. They live here so every
 * contractor can set them after the fact.
 */
export default function NotificationsTab({ profile }: NotificationsTabProps) {
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      const userEmail = authData?.user?.email ?? '';
      if (!cancelled) setEmail(userEmail);

      if (!userEmail) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      const { data, error: loadError } = await supabase
        .from('update_subscriptions')
        .select('list,status');

      if (!cancelled) {
        if (loadError) {
          setError(loadError.message);
        } else {
          const next: Record<string, boolean> = {};
          for (const row of (data || []) as Array<{ list: string; status: string }>) {
            next[row.list] = row.status === 'subscribed';
          }
          setSubscribed(next);
        }
        setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  const toggle = (list: UpdateList) => {
    setSubscribed((prev) => ({ ...prev, [list]: !prev[list] }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!email) {
      setError('No email address on your account');
      return;
    }

    setIsSaving(true);
    try {
      const lists = ALL_LISTS.filter((list) => subscribed[list]);
      const unsubscribe = ALL_LISTS.filter((list) => !subscribed[list]);

      const res = await fetch('/api/subscribe/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          lists,
          unsubscribe,
          source: 'contractor_dashboard',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Could not save your preferences');
      }

      setSuccess('Preferences saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email Preferences</h2>
        <p className="text-gray-600">
          Choose what we email you about. {SUBSCRIPTION_DISCLOSURE}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
          {success}
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          ALL_LISTS.map((list) => (
            <label
              key={list}
              className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={Boolean(subscribed[list])}
                onChange={() => toggle(list)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">
                  {LIST_COPY[list].title}
                </span>
                <span className="block text-xs text-gray-500">{LIST_COPY[list].description}</span>
              </span>
            </label>
          ))
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">Feedfree Digest</p>
            <p className="mt-1 text-xs">
              Our separate long-form digest uses a confirmation email, so it&apos;s managed on its
              own site.{' '}
              <a
                href={FEEDFREE_DIGEST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Subscribe to the Feedfree Digest
              </a>
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || isLoading}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save preferences'}
      </button>
    </div>
  );
}
