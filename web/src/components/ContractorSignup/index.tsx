import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '../../lib/navigation-compat';
import { supabase } from '../../lib/supabase';
import { services } from '../../data/services';
import { locations } from '../../data/locationData';
import EmailVerificationPage from '../EmailVerificationPage';
import ContractorSignupStep1 from './ContractorSignupStep1';
import ContractorSignupSuccess from './ContractorSignupSuccess';
import { CONSENT_DISCLOSURE_VERSION, getContractorConsentDisclosure, TERMS_OF_USE_URL, PRIVACY_POLICY_URL } from '../../config/consent';

const titleCase = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function ContractorSignup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: account
    email: '',
    password: '',
    confirmPassword: '',
    productUpdates: false,
    ecosystemUpdates: false,
    // Step 2: profile
    displayName: '',
    company: '',
    phone: '',
    showPhone: true,
    baseZipCode: '',
    bio: '',
    website: '',
    yearsExperience: '' as string | number,
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceQuery, setServiceQuery] = useState('');
  const [showServiceList, setShowServiceList] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [statePick, setStatePick] = useState('');

  const filteredServices = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    if (!q) return [];
    return services
      .filter((s) => !selectedServices.includes(s.slug) && s.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [serviceQuery, selectedServices]);

  // If a session already exists, the account is done â€” go straight to the
  // profile step. This covers two returns:
  //   * OAuth (Google / Apple / Facebook) â€” supabase-js exchanges the ?code= and
  //     creates the session automatically (detectSessionInUrl).
  //   * an email-confirmation link.
  // Previously this only fired when the URL contained #access_token, which OAuth
  // (PKCE, ?code=) never does â€” so social sign-in landed back on Step 1 and the
  // account questions were effectively lost.
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data?.session) return;

      const email = data.session.user?.email;
      if (email) {
        setFormData((prev) => ({ ...prev, email }));
      }
      setCurrentStep(2);
    };

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const addService = (slug: string) => {
    setSelectedServices((prev) => [...prev, slug]);
    setServiceQuery('');
    setShowServiceList(false);
  };
  const removeService = (slug: string) => setSelectedServices((prev) => prev.filter((s) => s !== slug));
  const addState = () => {
    if (statePick && !selectedStates.includes(statePick)) {
      setSelectedStates((prev) => [...prev, statePick]);
    }
    setStatePick('');
  };
  const removeState = (abbr: string) => setSelectedStates((prev) => prev.filter((s) => s !== abbr));

  const handleSubmit = async () => {
    setError('');
    if (!formData.displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }
    if (!hasConsented) {
      setError('Please agree to the Terms of Use and Privacy Policy to proceed');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please create your account first');

      const { data: profile, error: profileError } = await supabase
        .from('hire_contractor_profiles')
        .upsert(
          {
            user_id: user.id,
            display_name: formData.displayName.trim(),
            contact_name: formData.displayName.trim(),
            company: formData.company.trim() || null,
            website: formData.website.trim() || null,
            bio: formData.bio.trim() || null,
            base_zip_code: formData.baseZipCode.trim() || null,
            show_phone: formData.showPhone,
            years_experience: formData.yearsExperience === '' ? null : Number(formData.yearsExperience),
            service_slugs: selectedServices,
            service_zips: formData.baseZipCode.trim() ? [formData.baseZipCode.trim()] : [],
            service_states: selectedStates,
            is_published: true,
            is_searchable: true,
            published_at: new Date().toISOString(),
            terms_consent_date: new Date().toISOString(),
            tcpa_consent: true,
            consent_disclosure_version: CONSENT_DISCLOSURE_VERSION,
          },
          { onConflict: 'user_id' }
        )
        .select('id')
        .single();

      if (profileError) throw profileError;

      // Contact details live in a separate table with no public access, so they
      // can't be harvested from the search payload.
      const { error: privateError } = await supabase
        .from('hire_contractor_private')
        .upsert(
          {
            contractor_id: profile.id,
            email: user.email ?? formData.email ?? null,
            phone: formData.phone.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'contractor_id' }
        );

      if (privateError) throw privateError;

      setCurrentStep(3);
    } catch (err: any) {
      setError(err?.message || 'Failed to create your profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (showEmailVerification) {
    return (
      <EmailVerificationPage
        email={formData.email}
        onBack={() => setShowEmailVerification(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join FreeSurf as a Contractor</h1>
          <p className="text-gray-600 mt-2">
            {currentStep === 1 && 'Step 1 of 2 â€” Create your account'}
            {currentStep === 2 && 'Step 2 of 2 â€” Build your profile'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          {currentStep === 1 && (
            <ContractorSignupStep1
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              error={error}
              setError={setError}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              onNextStep={() => setCurrentStep(2)}
              onShowEmailVerification={() => setShowEmailVerification(true)}
            />
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your name *</label>
                  <input
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="mt-2 flex items-start gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={formData.showPhone}
                      onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      Show my phone number to visitors (they tap to reveal it â€” it isn&apos;t
                      listed publicly)
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base zipcode</label>
                  <input
                    inputMode="numeric"
                    value={formData.baseZipCode}
                    onChange={(e) => setFormData({ ...formData, baseZipCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 5) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
                  <input
                    type="number"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services you offer *</label>
                <div className="relative">
                  <input
                    value={serviceQuery}
                    onChange={(e) => {
                      setServiceQuery(e.target.value);
                      setShowServiceList(true);
                    }}
                    onFocus={() => setShowServiceList(true)}
                    onBlur={() => setTimeout(() => setShowServiceList(false), 150)}
                    placeholder="Search services to add..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showServiceList && serviceQuery.trim() && (
                    <div className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                      {filteredServices.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-500">No matching services.</p>
                      ) : (
                        filteredServices.map((s) => (
                          <button
                            key={s.slug}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => addService(s.slug)}
                            className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-blue-50"
                          >
                            <span className="text-gray-900">{s.name}</span>
                            <span className="text-[10px] uppercase tracking-wide text-gray-400">{s.scope}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedServices.map((slug) => (
                    <span key={slug} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700">
                      {services.find((s) => s.slug === slug)?.name || titleCase(slug)}
                      <button type="button" onClick={() => removeService(slug)} className="text-gray-400 hover:text-red-600">Ã—</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Service area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">States you serve</label>
                <div className="flex gap-3">
                  <select
                    value={statePick}
                    onChange={(e) => setStatePick(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Add a state...</option>
                    {locations.map((l) => (
                      <option key={l.state} value={l.state}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addState}
                    disabled={!statePick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedStates.map((abbr) => (
                    <span key={abbr} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700">
                      {locations.find((l) => l.state === abbr)?.name || abbr}
                      <button type="button" onClick={() => removeState(abbr)} className="text-gray-400 hover:text-red-600">Ã—</button>
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={hasConsented} onChange={(e) => setHasConsented(e.target.checked)} className="mt-1" />
                <span>
                  I agree to the{' '}
                  <a href={TERMS_OF_USE_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Use</a>{' '}
                  and{' '}
                  <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  {' '}
                  <span className="text-xs text-gray-400">{getContractorConsentDisclosure()}</span>
                </span>
              </label>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating profile...' : 'Create my profile'}
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <ContractorSignupSuccess
              onGoToDashboard={() => navigate('/investor-dashboard')}
              onGoToHomepage={() => navigate('/')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
