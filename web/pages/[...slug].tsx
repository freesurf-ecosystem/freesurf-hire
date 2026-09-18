import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { INDEX_LOCAL_PAGES, INDEX_REMOTE_SERVICE_PAGES } from '../src/config/seo';
import { GetStaticPaths, GetStaticProps } from 'next';
import ServiceLocationLanding from '../src/components/ServiceLocationLanding';
import ServiceZipLanding from '../src/components/ServiceZipLanding';
import RemoteServiceLanding from '../src/components/RemoteServiceLanding';
import ContractorLogin from '../src/components/ContractorLogin';
import ContractorLeadsLanding from '../src/components/contractorleadslanding/ContractorLeadsLanding';
import Header from '../src/components/Layout/Header';
import { locations } from '../src/data/locationData';
import { services } from '../src/data/services';

interface DynamicPageProps {
  params: string[];
  pageType: 'service' | 'service-location' | 'service-zip' | 'contractor-login' | 'join-as-contractor' | 'not-found';
  state?: string;
  location?: string;
  locationType?: 'city' | 'county' | 'neighborhood';
  serviceSlug?: string;
  zip?: string;
}

const createSlug = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function DynamicPage({ pageType, state, location, locationType, serviceSlug, zip }: DynamicPageProps) {
  const router = useRouter();

  // Remote service pages carry real editorial content, so they are indexable.
  // Local city/zip pages are taxonomy-driven rather than inventory-driven and
  // stay quarantined until there is content behind them. See src/config/seo.ts.
  const shouldNoindex =
    (pageType === 'service' && !INDEX_REMOTE_SERVICE_PAGES) ||
    ((pageType === 'service-location' || pageType === 'service-zip') && !INDEX_LOCAL_PAGES);

  const getCanonicalUrl = () => {
    const base = 'https://freesurf.tools';
    switch (pageType) {
      case 'service':
        return `${base}/${serviceSlug}`;
      case 'service-location':
        return `${base}/${serviceSlug}/${createSlug(state ?? '')}/${location}`;
      case 'service-zip':
        return `${base}/${serviceSlug}/${zip}`;
      case 'contractor-login':
        return `${base}/login`;
      case 'join-as-contractor':
        return `${base}/join-as-contractor`;
      default:
        return base;
    }
  };

  const getPageTitle = () => {
    switch (pageType) {
      case 'service': {
        const svc = services.find((s) => s.slug === serviceSlug);
        return `${svc?.name ?? 'Service'} — Hire on FreeSurf`;
      }
      case 'service-location': {
        const svc = services.find((s) => s.slug === serviceSlug);
        return `${svc?.name ?? 'Service'} in ${location}, ${state} | FreeSurf`;
      }
      case 'service-zip': {
        const svc = services.find((s) => s.slug === serviceSlug);
        return `${svc?.name ?? 'Service'} in ${zip} | FreeSurf`;
      }
      case 'contractor-login':
        return 'Contractor Login - FreeSurf';
      case 'join-as-contractor':
        return 'Join as a Contractor - FreeSurf';
      default:
        return 'FreeSurf';
    }
  };

  const getPageDescription = () => {
    switch (pageType) {
      case 'service': {
        const svc = services.find((s) => s.slug === serviceSlug);
        const name = svc?.name ?? 'a service';
        return svc?.scope === 'remote'
          ? `Hire a ${name} freelancer on FreeSurf. Free to use, no lead fees or commissions — connect directly.`
          : `Find ${name} pros near you on FreeSurf. Free to use, no lead fees or commissions — connect directly.`;
      }
      case 'service-location': {
        const svc = services.find((s) => s.slug === serviceSlug);
        const name = svc?.name ?? 'a service';
        return `Find and hire trusted ${name} in ${location}, ${state}. Compare local pros and remote freelancers — free to use, no lead fees or commissions.`;
      }
      case 'service-zip': {
        const svc = services.find((s) => s.slug === serviceSlug);
        const name = svc?.name ?? 'a service';
        return `Find and hire trusted ${name} in zipcode ${zip}. Free to use — no lead fees or commissions.`;
      }
      case 'contractor-login':
        return 'Log in to your FreeSurf contractor account.';
      case 'join-as-contractor':
        return 'Join the FreeSurf network as a contractor. Free to use — no lead fees or commissions.';
      default:
        return 'FreeSurf is a free, open-source platform connecting clients and contractors directly.';
    }
  };

  const renderContent = () => {
    switch (pageType) {
      case 'service':
        return <RemoteServiceLanding serviceSlug={serviceSlug ?? ''} />;
      case 'service-location':
        return (
          <div>
            <Header currentView="browse" />
            <ServiceLocationLanding
              service={serviceSlug}
              state={state}
              location={location}
              locationType={locationType}
            />
          </div>
        );
      case 'service-zip':
        return <ServiceZipLanding serviceSlug={serviceSlug ?? ''} zip={zip ?? ''} />;
      case 'contractor-login':
        return (
          <div>
            <Header currentView="login" />
            <ContractorLogin />
          </div>
        );
      case 'join-as-contractor':
        return (
          <div>
            <Header currentView="signup" />
            <ContractorLeadsLanding />
          </div>
        );
      default:
        if (typeof window !== 'undefined') router.push('/');
        return <div>Redirecting...</div>;
    }
  };

  return (
    <>
      <Head>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={getCanonicalUrl()} />
        {shouldNoindex && (
          // Keep the pages reachable, but out of the index until there is real
          // content behind them. See src/config/seo.ts.
          <meta name="robots" content="noindex, follow" />
        )}
      </Head>
      {renderContent()}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string[];

  if (!slug || slug.length === 0) {
    return { notFound: true };
  }

  if (slug[0] === 'login') {
    return { props: { params: slug, pageType: 'contractor-login' } };
  }

  if (slug[0] === 'join-as-contractor') {
    return { props: { params: slug, pageType: 'join-as-contractor' } };
  }

  // Service routes (taxonomy skills)
  const matchedService = services.find((s) => s.slug === createSlug(slug[0]));
  if (matchedService) {
    if (slug.length === 1 && matchedService.scope === 'remote') {
      return {
        props: {
          params: slug,
          pageType: 'service',
          serviceSlug: matchedService.slug,
        },
      };
    }

    if (slug.length === 2 && /^\d{5}$/.test(slug[1]) && matchedService.scope !== 'remote') {
      return {
        props: {
          params: slug,
          pageType: 'service-zip',
          serviceSlug: matchedService.slug,
          zip: slug[1],
        },
      };
    }

    if (slug.length === 3 && matchedService.scope !== 'remote') {
      const matchedState = locations.find((loc) => createSlug(loc.name) === createSlug(slug[1]));
      if (matchedState) {
        const locationSlug = createSlug(slug[2]);
        const locationType: 'city' | 'county' = locationSlug.endsWith('-county') ? 'county' : 'city';
        return {
          props: {
            params: slug,
            pageType: 'service-location',
            serviceSlug: matchedService.slug,
            state: matchedState.name,
            location: locationSlug,
            locationType,
          },
        };
      }
    }

    // Local services only have city pages; send bare service URLs to the homepage.
    return { redirect: { destination: '/', permanent: false } };
  }

  return { notFound: true };
};
