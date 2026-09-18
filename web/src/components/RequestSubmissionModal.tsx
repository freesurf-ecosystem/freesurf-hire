import React, { useEffect, useState } from 'react';
import { X, User, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { Contractor } from '../types';
import { supabase } from '../lib/supabase';
import { CONSENT_DISCLOSURE_VERSION, PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '../config/consent';

interface RequestSubmissionModalProps {
  contractor: Contractor;
  onClose: () => void;
  onSubmit: () => void;
}

const slugify = (value: string) => value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

/**
 * The client's own details are remembered locally so reaching out to a second
 * contractor doesn't mean retyping everything. This is the client's own data on
 * the client's own device - never sent anywhere except the contractor they
 * choose to contact.
 */
const CLIENT_DETAILS_KEY = 'freesurf.client.details';

interface StoredClientDetails {
  name: string;
  email: string;
  phone: string;
  zip: string;
}

export default function RequestSubmissionModal({ contractor, onClose, onSubmit }: RequestSubmissionModalProps) {
  const serviceName = contractor.specialties?.[0] ?? '';
  const contractorName = contractor.company || contractor.name || 'this contractor';

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [zipCode, setZipCode] = useState(contractor.base_zip_code ?? '');
  const [message, setMessage] = useState('');
  const [hasConsented, setHasConsented] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Prefill from the previous request, if any.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CLIENT_DETAILS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<StoredClientDetails>;
      if (saved.name) setClientName(saved.name);
      if (saved.email) setClientEmail(saved.email);
      if (saved.phone) setClientPhone(saved.phone);
      if (saved.zip) setZipCode(saved.zip);
    } catch {
      // Corrupt or unavailable storage — start blank.
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clientName.trim()) {
      setSubmitError('Please enter your name');
      return;
    }
    if (!emailRegex.test(clientEmail.trim())) {
      setSubmitError('Please enter a valid email address');
      return;
    }
    if (!hasConsented) {
      setSubmitError('Please agree to the Terms of Use and Privacy Policy to proceed');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('hire_contractor_requests').insert({
        contractor_id: contractor.id,
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim() || null,
        service_slug: serviceName ? slugify(serviceName) : null,
        zip_code: zipCode.trim() || null,
        message: message.trim() || null,
        consent_disclosure_version: CONSENT_DISCLOSURE_VERSION,
      });

      if (error) throw error;

      // Remember the client's details for next time.
      try {
        window.localStorage.setItem(
          CLIENT_DETAILS_KEY,
          JSON.stringify({
            name: clientName.trim(),
            email: clientEmail.trim(),
            phone: clientPhone.trim(),
            zip: zipCode.trim(),
          })
        );
      } catch {
        // Non-fatal.
      }

      setSubmitSuccess(true);
      onSubmit();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Request a quote</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Request sent</h4>
            <p className="text-gray-600 mb-6">
              Your request has been sent to {contractorName}. They will reach out to you directly.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Send your details to <span className="font-medium text-gray-900">{contractorName}</span>
              {serviceName ? ` for ${serviceName}` : ''}. FreeSurf never takes a cut — you deal with them directly.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your name *</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full py-2 text-gray-900 outline-none bg-transparent"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full py-2 text-gray-900 outline-none bg-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full py-2 text-gray-900 outline-none bg-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zipcode</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                    className="w-full py-2 text-gray-900 outline-none bg-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none"
                placeholder="Describe the work you need done..."
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-1"
              />
              <span>
                I agree to the{' '}
                <a href={TERMS_OF_USE_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Terms of Use
                </a>{' '}
                and{' '}
                <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
