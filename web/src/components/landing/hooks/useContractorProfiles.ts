import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Contractor } from '../../../types';
import { services } from '../../../data/services';

interface UseContractorProfilesOptions {
  serviceSlug?: string;
  serviceName?: string;
  stateAbbr?: string;
  citySlug?: string;
  zipCode?: string;
}

const serviceNameBySlug = new Map(services.map((s) => [s.slug, s.name]));

const titleCase = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Loads contractor profiles from the hire_contractor_* tables for a given service
// and optional location, shaped for the existing ContractorCard contract.
export const useContractorProfiles = ({
  serviceSlug,
  serviceName,
  stateAbbr,
  citySlug,
  zipCode,
}: UseContractorProfilesOptions) => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        if (!serviceSlug) {
          if (!cancelled) setContractors([]);
          return;
        }

        // Reads the profiles table directly. This previously targeted a
        // `hire_contractor_public` view that was never created by any migration,
        // so every lookup 404'd and no contractor cards ever rendered.
        //
        // No view is needed for privacy: email and phone live in
        // hire_contractor_private (owner-only RLS), so this table holds nothing
        // that cannot be public. Row visibility comes from the
        // "hire profiles public read searchable" RLS policy, and the columns are
        // still listed explicitly rather than select('*').
        let query = supabase
          .from('hire_contractor_profiles')
          .select(
            [
              'id',
              'display_name',
              'contact_name',
              'company',
              'bio',
              'avatar_url',
              'base_zip_code',
              'service_slugs',
              'service_zips',
              'service_cities',
              'service_states',
              'engagement_types',
              'preferred_contact_method',
              'years_experience',
              'rating',
              'review_count',
              'google_business_url',
              'google_reviews',
              'website',
              'show_phone',
              'business_address',
              'show_business_address',
              'is_active',
              'admin_paused',
              'created_at',
              'updated_at',
            ].join(',')
          )
          .contains('service_slugs', [serviceSlug])
          .eq('is_searchable', true)
          .eq('is_active', true)
          .eq('admin_paused', false)
          .order('rating', { ascending: false });

        // Location filter. A zipcode must match exactly - no fallback.
        if (zipCode) {
          query = query.contains('service_zips', [zipCode]);
        } else if (citySlug || stateAbbr) {
          const clauses: string[] = [];
          if (citySlug) clauses.push(`service_cities.cs.{${citySlug}}`);
          if (stateAbbr) clauses.push(`service_states.cs.{${stateAbbr.toUpperCase()}}`);
          query = query.or(clauses.join(','));
        }

        const { data: profileRows, error: profilesError } = await query;
        if (profilesError) throw profilesError;

        const mapped: Contractor[] = (profileRows || []).map((p: any) => {
          const slugs: string[] = p.service_slugs || [];
          const specialties = slugs.length
            ? slugs.map((slug) => serviceNameBySlug.get(slug) || titleCase(slug))
            : serviceName
              ? [serviceName]
              : [];

          const serviceAreas = [
            ...(p.service_states || []),
            ...(p.service_cities || []).map(titleCase),
            ...(p.service_zips || []),
          ];

          return {
            id: p.id,
            name: p.display_name || p.contact_name || p.company || 'Contractor',
            company: p.company,
            // phone/email are not in the public view. The number is fetched on
            // demand from /api/contractor-phone.
            base_zip_code: p.base_zip_code,
            bio: p.bio,
            specialties,
            service_areas: serviceAreas,
            investment_types: p.engagement_types || [],
            location_preferences: { states: p.service_states || [], regions: [] },
            preferred_contact_method: p.preferred_contact_method || 'form',
            googleBusinessUrl: p.google_business_url,
            website: p.website,
            avatar: p.avatar_url,
            rating: parseFloat(p.rating) || 0,
            reviewCount: p.review_count || 0,
            reviews: p.google_reviews || [],
            yearsExperience: p.years_experience ?? undefined,
            financingOptions: (p.engagement_types || []).map(titleCase),
            isActive: p.is_active,
            is_active: p.is_active,
            admin_paused: p.admin_paused,
            showPhone: p.show_phone,
            businessAddress: p.business_address,
            showBusinessAddress: p.show_business_address,
            createdAt: p.created_at,
            created_at: p.created_at,
            updated_at: p.updated_at,
          };
        });

        if (!cancelled) setContractors(mapped);
      } catch (err) {
        console.error('Error loading contractors:', err);
        if (!cancelled) setContractors([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [serviceSlug, serviceName, stateAbbr, citySlug, zipCode]);

  return { contractors, isLoading };
};
