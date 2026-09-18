import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { ArrowRight, ArrowUp, CircleCheck, Wrench } from 'lucide-react';
import Header from './Layout/Header';
import Footer from './Layout/Footer';
import { useNavigate } from '../lib/navigation-compat';
import { services } from '../data/services';
import { Contractor } from '../types';
import { ChevronSection, Breadcrumb, ServiceLandingHero, ContractorCardGrid, FAQSection, SearchBar, useContractorProfiles } from './landing';
import RequestSubmissionModal from './RequestSubmissionModal';

interface ServiceZipLandingProps {
  serviceSlug: string;
  zip: string;
}

const GUARANTEES = [
  'No lead fees or commissions on contractor work',
  'Speak directly with the contractor, no strings attached',
  'Handle payment in the best way you see fit',
  'Free to use — no subscription necessary',
];

export default function ServiceZipLanding({ serviceSlug, zip }: ServiceZipLandingProps) {
  const navigate = useNavigate();
  const service = services.find((s) => s.slug === serviceSlug);
  const serviceName = service?.name ?? 'Service';

  const { contractors, isLoading } = useContractorProfiles({ serviceSlug, serviceName, zipCode: zip });
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [showOtherServices, setShowOtherServices] = useState(false);
  const [placeLabel, setPlaceLabel] = useState('');

  const providersRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const scrollToProviders = () => providersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Resolve the zip to a city for display only (routing never depends on this).
  useEffect(() => {
    let cancelled = false;
    import('../data/zipToCity.json').then((mod) => {
      const map = (mod.default ?? mod) as Record<string, [string, string]>;
      const entry = map[zip];
      if (!cancelled && entry) setPlaceLabel(`${entry[0]}, ${entry[1]}`);
    });
    return () => {
      cancelled = true;
    };
  }, [zip]);

  const related = useMemo(
    () => services.filter((s) => s.slug !== serviceSlug && s.scope !== 'remote'),
    [serviceSlug]
  );

  const faqs = useMemo(
    () => [
      {
        question: `Who offers ${serviceName.toLowerCase()} in zipcode ${zip}?`,
        answer: `The contractors listed above have selected ${zip} as part of their service area. Contact them directly — FreeSurf takes no fees or commissions.`,
      },
      {
        question: `How do I hire a ${serviceName.toLowerCase()} near ${zip}?`,
        answer: `Compare a few of the contractors above, request quotes, and hire the one that fits. You pay them directly.`,
      },
      {
        question: `Does FreeSurf charge fees?`,
        answer: `No. FreeSurf is free to use — no lead fees, no commissions, and no subscription.`,
      },
    ],
    [serviceName, zip]
  );

  const title = `${serviceName} in ${zip}${placeLabel ? ` (${placeLabel})` : ''} — FreeSurf`;
  const description = `Find and hire trusted ${serviceName} in zipcode ${zip}. Free to use — no lead fees or commissions.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={`https://freesurf.tools/${serviceSlug}/${zip}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header currentView="browse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchBar
            initialServiceSlug={serviceSlug}
            initialZip={zip}
            onSearch={(selected, nextZip) => {
              if (selected.scope === 'remote') {
                navigate(`/${selected.slug}`);
                return;
              }
              if (nextZip) navigate(`/${selected.slug}/${nextZip}`);
            }}
          />

          <Breadcrumb items={[{ name: 'Home', url: '/' }, { name: serviceName, url: `/${serviceSlug}` }, { name: zip }]} />

          <ServiceLandingHero
            service={serviceName}
            contractorCount={contractors.length}
            locationLabel={`near ${zip}${placeLabel ? ` (${placeLabel})` : ''}`}
            description={`Contractors who serve zipcode ${zip}. Compare quotes and connect directly — free to use, no lead fees or commissions.`}
          />
        </div>

        <div ref={providersRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <ContractorCardGrid
            contractors={contractors}
            isLoading={isLoading}
            onContactClick={setSelectedContractor}
            emptyStateMessage={`No ${serviceName} contractors for ${zip} yet`}
            emptyStateService={serviceName.toLowerCase()}
            onEmptyStateAction={() => navigate('/')}
          />
        </div>

        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
              Why hire {serviceName} on FreeSurf?
            </h2>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-8">
              <ul className="space-y-3">
                {GUARANTEES.map((item) => (
                  <li key={item} className="flex items-start">
                    <CircleCheck className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ChevronSection
          title="Browse Other Services"
          description="Explore other services available on FreeSurf."
          isOpen={showOtherServices}
          setIsOpen={setShowOtherServices}
          items={related.slice(0, 48).map((s) => ({ id: s.slug, label: s.name, href: `/${s.slug}` }))}
          gridCols="grid-cols-5"
          bgColor="bg-white"
        />

        <FAQSection faqs={faqs} title={`Frequently Asked Questions About ${serviceName} in ${zip}`} />

        <div className="bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-blue-100 mb-8">Review the {serviceName} contractors above and reach out directly.</p>
            <button
              type="button"
              onClick={scrollToProviders}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              See available contractors
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="sm:hidden fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowUp className="h-5 w-5" />
        </button>

        <Footer navigate={navigate} />

        {selectedContractor && (
          <RequestSubmissionModal
            contractor={selectedContractor}
            onClose={() => setSelectedContractor(null)}
            onSubmit={() => setSelectedContractor(null)}
          />
        )}
      </div>
    </>
  );
}
