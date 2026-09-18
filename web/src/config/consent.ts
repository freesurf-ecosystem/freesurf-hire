// Canonical consent disclosure text + versioning for FreeSurf.
//
// Every place a user clicks "I agree" must use one of the helpers below so the
// exact wording they saw can be reconstructed for audits or regulator requests.
// The version string is what gets written to the database alongside the
// snapshotted text â€” bump it whenever the wording changes.

export const CONSENT_DISCLOSURE_VERSION = '2026.09.17.v1';

// The canonical legal pages are served at /terms, /privacy and /eula. They are
// static HTML in web/public, ported verbatim from the links repo (the single
// source of truth for legal wording) and mapped by rewrites in next.config.mjs.
// Legacy /terms-of-use and /privacy-policy routes redirect here.
export const TERMS_OF_USE_URL = 'https://freesurf.tools/terms/';
export const PRIVACY_POLICY_URL = 'https://freesurf.tools/privacy/';

/**
 * localStorage key remembering a visitor's Terms acceptance, so the gate
 * interrupts once per browser per version rather than on every card.
 */
export const TERMS_STORAGE_KEY = 'freesurf.terms.accepted';

/**
 * The Terms line. This is the *contract* half of the pair, so it is phrased as
 * affirmative agreement â€” and it is what gets logged (with IP + timestamp) to
 * `hire_terms_acceptances` when someone accepts.
 */
export const TERMS_ACCEPTANCE_TEXT = 'I agree to the Terms of Use';

/**
 * The Privacy line. A privacy policy is a *notice*, not a contract: we inform,
 * the visitor acknowledges. Keeping it out of the "I agree" matters under GDPR â€”
 * consent must be freely given and unbundled, and bundling privacy acceptance
 * with contract acceptance is a common way to invalidate it.
 */
export const PRIVACY_ACKNOWLEDGEMENT_TEXT =
  'See how we handle your information in the Privacy Policy';

/**
 * Client request consent disclosure. Returned as a single plain-text string so
 * it can be rendered next to the consent checkbox and stored verbatim on the
 * request row for legal recordkeeping.
 */
export function getClientConsentDisclosure(contractorLabel: string): string {
  return [
    `By submitting this form, I consent to being contacted by ${contractorLabel} about my request.`,
    `${TERMS_ACCEPTANCE_TEXT}.`,
    `${PRIVACY_ACKNOWLEDGEMENT_TEXT}.`,
    `Message and data rates may apply.`,
  ].join(' ');
}

/**
 * Contractor signup consent disclosure (Terms acceptance + privacy notice).
 */
export function getContractorConsentDisclosure(): string {
  return [
    `${TERMS_ACCEPTANCE_TEXT}.`,
    `${PRIVACY_ACKNOWLEDGEMENT_TEXT}.`,
    `I consent to receiving emails and phone calls from FreeSurf regarding my account and client requests. I can opt out at any time.`,
    `Message and data rates may apply.`,
  ].join(' ');
}
