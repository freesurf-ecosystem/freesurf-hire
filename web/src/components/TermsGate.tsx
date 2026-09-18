import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { getAnonSessionId } from '../lib/anonSession';
import {
  CONSENT_DISCLOSURE_VERSION,
  PRIVACY_ACKNOWLEDGEMENT_TEXT,
  PRIVACY_POLICY_URL,
  TERMS_ACCEPTANCE_TEXT,
  TERMS_OF_USE_URL,
  TERMS_STORAGE_KEY,
} from '../config/consent';

interface TermsGateProps {
  children: React.ReactNode;
  /** Where this acceptance happened, e.g. 'contractor_card_contact'. */
  context: string;
  contractorId?: string;
  className?: string;
}

/**
 * Blurs its children until the visitor affirmatively accepts the Terms, then
 * records the acceptance server-side (IP + user agent + version).
 *
 * Acceptance is remembered per browser so the gate interrupts once per Terms
 * version, not once per card.
 */
export default function TermsGate({
  children,
  context,
  contractorId,
  className = '',
}: TermsGateProps) {
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(TERMS_STORAGE_KEY) === CONSENT_DISCLOSURE_VERSION) {
        setAccepted(true);
      }
    } catch {
      // localStorage unavailable (e.g. private mode) — leave the gate in place.
    }
  }, []);

  const handleAccept = () => {
    if (!checked) return;
    setAccepted(true);
    try {
      window.localStorage.setItem(TERMS_STORAGE_KEY, CONSENT_DISCLOSURE_VERSION);
    } catch {
      // Non-fatal: the server-side record below is the durable one.
    }
    // Fire-and-forget. The server derives the IP, so this is the audit record.
    void fetch('/api/consent/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context,
        contractorId,
        termsVersion: CONSENT_DISCLOSURE_VERSION,
        sessionId: getAnonSessionId(),
      }),
    }).catch(() => {
      // Never block the visitor on logging.
    });
  };

  if (accepted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative min-h-[5.5rem] ${className}`}>
      <div
        aria-hidden="true"
        className="blur-[4px] select-none pointer-events-none opacity-50"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-2">
        <div className="w-full rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
            <Lock className="h-3 w-3 flex-shrink-0" />
            <span>Contact details are hidden until you agree to the Terms</span>
          </div>

          <label className="mt-2 flex items-start gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <a
                href={TERMS_OF_USE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {TERMS_ACCEPTANCE_TEXT}
              </a>
              <span className="block text-[11px] text-gray-400">
                {PRIVACY_ACKNOWLEDGEMENT_TEXT}:{' '}
                <a
                  href={PRIVACY_POLICY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Privacy Policy
                </a>
              </span>
            </span>
          </label>

          <button
            type="button"
            onClick={handleAccept}
            disabled={!checked}
            className="mt-2 w-full rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Show contact details
          </button>
        </div>
      </div>
    </div>
  );
}
