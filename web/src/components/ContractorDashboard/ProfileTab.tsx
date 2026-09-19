import React, { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProfileTabProps {
  profile: any;
  onSaved: (profile: any) => void;
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-');

export default function ProfileTab({ profile, onSaved }: ProfileTabProps) {
  const [form, setForm] = useState({
    display_name: profile.display_name ?? '',
    contact_name: profile.contact_name ?? '',
    company: profile.company ?? '',
    email: '',
    phone: '',
    website: profile.website ?? '',
    bio: profile.bio ?? '',
    avatar_url: profile.avatar_url ?? '',
    base_zip_code: profile.base_zip_code ?? '',
    business_address: profile.business_address ?? '',
    show_business_address: profile.show_business_address ?? false,
    username: profile.username ?? '',
    hourly_rate: profile.hourly_rate ?? '',
    rate_notes: profile.rate_notes ?? '',
    years_experience: profile.years_experience ?? '',
    license_number: profile.license_number ?? '',
    insured: profile.insured ?? false,
    is_published: profile.is_published ?? false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Contact details are in hire_contractor_private, so don't write them back
  // until we've read the existing values (owner-only row, RLS permits).
  const [privateLoaded, setPrivateLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from('hire_contractor_private')
        .select('email,phone')
        .eq('contractor_id', profile.id)
        .maybeSingle();

      if (!cancelled && data) {
        setForm((prev) => ({ ...prev, email: data.email ?? '', phone: data.phone ?? '' }));
      }
      if (!cancelled) setPrivateLoaded(true);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const { data, error: saveError } = await supabase
        .from('hire_contractor_profiles')
        .update({
          display_name: form.display_name || null,
          contact_name: form.contact_name || null,
          company: form.company || null,
          website: form.website || null,
          bio: form.bio || null,
          avatar_url: form.avatar_url || null,
          base_zip_code: form.base_zip_code || null,
          business_address: form.business_address || null,
          show_business_address: form.business_address ? Boolean(form.show_business_address) : false,
          username: form.username ? slugify(form.username) : null,
          hourly_rate: form.hourly_rate === '' ? null : Number(form.hourly_rate),
          rate_notes: form.rate_notes || null,
          years_experience: form.years_experience === '' ? null : Number(form.years_experience),
          license_number: form.license_number || null,
          insured: Boolean(form.insured),
          is_published: Boolean(form.is_published),
          published_at: form.is_published ? (profile.published_at ?? new Date().toISOString()) : null,
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (saveError) throw saveError;

      if (privateLoaded) {
        const { error: privateError } = await supabase
          .from('hire_contractor_private')
          .upsert(
            {
              contractor_id: profile.id,
              email: form.email || null,
              phone: form.phone || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'contractor_id' }
          );

        if (privateError) throw privateError;
      }

      setSuccess('Profile saved');
      onSaved(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    props: { type?: string; placeholder?: string } = {}
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={props.type ?? 'text'}
        value={String(form[key] ?? '')}
        onChange={(e) => update(key, e.target.value)}
        placeholder={props.placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-600">This is what clients see when they find you in search.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">{success}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('Display name', 'display_name', { placeholder: 'Jane Doe' })}
        {field('Contact name', 'contact_name')}
        {field('Company', 'company')}
        {field('Public username', 'username', { placeholder: 'jane-plumbing' })}
        {field('Email', 'email', { type: 'email' })}
        {field('Phone', 'phone', { type: 'tel' })}
        {field('Website', 'website', { placeholder: 'https://example.com' })}
        {field('Avatar URL', 'avatar_url')}
        {field('Base zipcode', 'base_zip_code')}
        {field('Years of experience', 'years_experience', { type: 'number' })}
        {field('Hourly rate (USD)', 'hourly_rate', { type: 'number' })}
        {field('License number', 'license_number')}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business address</label>
        <input
          value={form.business_address}
          onChange={(e) => update('business_address', e.target.value)}
          placeholder="123 Main St, Springfield, IL 62704"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.show_business_address}
            disabled={!form.business_address.trim()}
            onChange={(e) => update('show_business_address', e.target.checked)}
          />
          Show my business address on my public profile
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your services and experience..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rate notes</label>
        <input
          value={form.rate_notes}
          onChange={(e) => update('rate_notes', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Free estimates, materials billed separately"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.insured} onChange={(e) => update('insured', e.target.checked)} />
          Insured
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_published} onChange={(e) => update('is_published', e.target.checked)} />
          Publish my profile in search
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </div>
  );
}
