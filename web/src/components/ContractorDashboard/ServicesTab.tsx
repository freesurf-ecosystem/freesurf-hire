import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { services } from '../../data/services';

interface ServicesTabProps {
  profile: any;
  /** Lets the dashboard refresh its onboarding state after a save. */
  onSaved?: () => void;
}

const titleCase = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const serviceNameBySlug = new Map(services.map((s) => [s.slug, s.name]));

export default function ServicesTab({ profile, onSaved }: ServicesTabProps) {
  const [serviceSlugs, setServiceSlugs] = useState<string[]>([]);
  const [zips, setZips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showList, setShowList] = useState(false);
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');

  // Services and service area live as array columns on the profile row, so the
  // tab reads and writes that one record instead of child tables.
  const load = async () => {
    setIsLoading(true);
    const { data, error: loadError } = await supabase
      .from('hire_contractor_profiles')
      .select('service_slugs,service_zips')
      .eq('id', profile.id)
      .maybeSingle();

    if (loadError) {
      setError(loadError.message);
    } else if (data) {
      setServiceSlugs(data.service_slugs || []);
      setZips(data.service_zips || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  const save = async (patch: {
    service_slugs?: string[];
    service_zips?: string[];
  }) => {
    setError('');
    const { error: saveError } = await supabase
      .from('hire_contractor_profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (saveError) {
      setError(saveError.message);
      return false;
    }
    onSaved?.();
    return true;
  };

  const addedSlugs = new Set(serviceSlugs);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return services.filter((s) => !addedSlugs.has(s.slug) && s.name.toLowerCase().includes(q)).slice(0, 20);
  }, [query, addedSlugs]);

  const addService = async (slug: string) => {
    const next = [...serviceSlugs, slug];
    if (await save({ service_slugs: next })) {
      setServiceSlugs(next);
      setQuery('');
      setShowList(false);
    }
  };

  const removeService = async (slug: string) => {
    const next = serviceSlugs.filter((s) => s !== slug);
    if (await save({ service_slugs: next })) setServiceSlugs(next);
  };

  const addArea = async () => {
    const value = zip.trim();
    if (value && !zips.includes(value)) {
      const next = [...zips, value];
      if (await save({ service_zips: next })) setZips(next);
    }
    setZip('');
  };

  const removeZip = async (value: string) => {
    const next = zips.filter((z) => z !== value);
    if (await save({ service_zips: next })) setZips(next);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Services &amp; Service Area</h2>
        <p className="text-gray-600">Pick the services you offer and where you work.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

      {/* Services */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Services you offer</h3>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowList(true);
            }}
            onFocus={() => setShowList(true)}
            onBlur={() => setTimeout(() => setShowList(false), 150)}
            placeholder="Search services to add..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showList && query.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-20">
              {matches.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">No matching services.</p>
              ) : (
                matches.map((s) => (
                  <button
                    key={s.slug}
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

        <div className="flex flex-wrap gap-2 mt-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : serviceSlugs.length === 0 ? (
            <p className="text-sm text-gray-500">No services added yet.</p>
          ) : (
            serviceSlugs.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700"
              >
                {serviceNameBySlug.get(slug) || titleCase(slug)}
                <button onClick={() => removeService(slug)} className="text-gray-400 hover:text-red-600" aria-label="Remove">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Service area. Zipcodes only: the local search matches on the exact zip
          a client enters, so a state would never match anything. */}
      <div id="service-area" className="scroll-mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Where you work</h3>
        <div className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addArea();
              }
            }}
            placeholder="Add a zipcode..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addArea}
            disabled={!/^\d{5}$/.test(zip.trim())}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {zips.length === 0 ? (
            <p className="text-sm text-gray-500">No service area set yet.</p>
          ) : (
            zips.map((value) => (
              <span
                key={`zip-${value}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700"
              >
                {value}
                <button onClick={() => removeZip(value)} className="text-gray-400 hover:text-red-600" aria-label="Remove">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
