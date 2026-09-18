/**
 * A stable, anonymous identifier for a visitor who is not signed in.
 *
 * The shared `consents` ledger keys on `user_id` (not null), so anonymous
 * visitors need something to key on. This is a random id kept in localStorage —
 * it is not tied to a person, and it exists purely so repeated acceptances from
 * the same browser can be grouped.
 */
const ANON_SESSION_KEY = 'freesurf.anon.session';

export function getAnonSessionId(): string {
  try {
    const existing = window.localStorage.getItem(ANON_SESSION_KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(ANON_SESSION_KEY, id);
    return id;
  } catch {
    // Private mode / storage disabled — still return something usable.
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
