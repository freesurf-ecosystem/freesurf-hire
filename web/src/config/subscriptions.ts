/**
 * Update-subscription lists.
 *
 * These are single-opt-in (no confirmation email), unlike the Feedfree Digest
 * which uses double opt-in and lives in `public.newsletter_signups`.
 *
 * Keep the values in sync with the check constraint on
 * `public.update_subscriptions.list`.
 */
export const UPDATE_LISTS = {
  PRODUCT: 'product_updates',
  ECOSYSTEM: 'ecosystem_updates',
} as const;

export type UpdateList = (typeof UPDATE_LISTS)[keyof typeof UPDATE_LISTS];

export const UPDATE_LIST_LABELS: Record<UpdateList, string> = {
  product_updates: 'FreeSurf contractor network',
  ecosystem_updates: 'Other FreeSurf products',
};

/** Bump when the wording below changes, so the recorded consent stays auditable. */
export const SUBSCRIPTION_CONSENT_VERSION = '2026.09.17.v1';

export const SUBSCRIPTION_DISCLOSURE =
  'You can unsubscribe at any time using the link in any email.';

/** Feedfree Digest is double opt-in and managed by the feedless app. */
export const FEEDFREE_DIGEST_URL = 'https://feedfree.tech';
