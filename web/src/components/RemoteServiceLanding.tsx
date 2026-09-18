import { useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { ArrowRight, ArrowUp, Search, MessageSquare, CreditCard, CircleCheck } from 'lucide-react';
import Header from './Layout/Header';
import Footer from './Layout/Footer';
import { useNavigate } from '../lib/navigation-compat';
import { services } from '../data/services';
import { Contractor } from '../types';
import { ChevronSection, Breadcrumb, ServiceLandingHero, ContractorCardGrid, FAQSection, useContractorProfiles } from './landing';
import RequestSubmissionModal from './RequestSubmissionModal';

interface RemoteServiceLandingProps {
  serviceSlug: string;
}

const STEPS = [
  {
    icon: Search,
    title: 'Find the right freelancer',
    text: 'Browse remote pros by skill, portfolio, and reviews — no location required.',
  },
  {
    icon: MessageSquare,
    title: 'Talk directly',
    text: 'Reach out through their own email, phone, or website. No gatekeeping, no lead fees.',
  },
  {
    icon: CreditCard,
    title: 'Pay how you want',
    text: 'Agree on scope and payment directly. FreeSurf never takes a cut.',
  },
];

const GUARANTEES = [
  'No lead fees or commissions on remote work',
  'Speak directly with the freelancer, no strings attached',
  'Handle payment in the best way you see fit',
  'Work with freelancers anywhere, not just nearby',
];

export default function RemoteServiceLanding({ serviceSlug }: RemoteServiceLandingProps) {
  const navigate = useNavigate();
  const service = services.find((s) => s.slug === serviceSlug);
  const serviceName = service?.name ?? 'Freelancer';

  const { contractors, isLoading } = useContractorProfiles({ serviceSlug, serviceName });
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [showOtherServices, setShowOtherServices] = useState(false);

  const providersRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const scrollToProviders = () => {
    providersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const related = useMemo(
    () => services.filter((s) => s.slug !== serviceSlug && s.scope === 'remote'),
    [serviceSlug]
  );

  const faqs = useMemo(
    () => [
      {
        question: `How do I hire a ${serviceName.toLowerCase()} freelancer?`,
        answer: `Search FreeSurf for ${serviceName.toLowerCase()}, review the available freelancers, and contact them directly. FreeSurf charges no lead fees or commissions.`,
      },
      {
        question: `Can ${serviceName.toLowerCase()} work be done remotely?`,
        answer: `Yes. ${serviceName} is a remote skill, so you can work with a freelancer anywhere. Everything is handled online.`,
      },
      {
        question: `Does FreeSurf charge fees to hire a ${serviceName.toLowerCase()}?`,
        answer: `No. FreeSurf is free to use — no lead fees, no commissions, and you pay the freelancer directly however you both agree.`,
      },
      {
        question: `How much does a ${serviceName.toLowerCase()} cost?`,
        answer: `Costs vary with scope and experience. Ask for a quote and compare a few freelancers before you decide.`,
      },
    ],
    [serviceName]
  );

  const title = `${serviceName} — Hire Remote Freelancers on FreeSurf`;
  const description = `Hire a ${serviceName} freelancer on FreeSurf. Work remotely, anywhere — free to use, no lead fees or commissions.`;

  const handleRequestSubmit = () => {
    setSelectedContractor(null);
    alert('Request submitted! The contractor has been notified.');
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={`https://freesurf.tools/${serviceSlug}/`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header currentView="browse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ name: 'Home', url: '/' }, { name: serviceName }]} />

          <ServiceLandingHero
            service={serviceName}
            contractorCount={contractors.length}
            locationLabel="Nationwide"
            description={`Work with a ${serviceName} freelancer anywhere. Free to use — no lead fees, no commissions, and you connect directly.`}
          />
        </div>

        {/* Available freelancers */}
        <div ref={providersRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <ContractorCardGrid
            contractors={contractors}
            isLoading={isLoading}
            onContactClick={setSelectedContractor}
            emptyStateMessage={`No ${serviceName} freelancers yet`}
            emptyStateService={serviceName.toLowerCase()}
            onEmptyStateAction={scrollToTop}
          />
        </div>

        {/* How it works */}
        <div className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Guarantees */}
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

        {/* Other remote services */}
        <ChevronSection
          title="Browse Other Remote Skills"
          description="Explore freelancers who specialize in different remote skills. Each skill has its own network of available providers."
          isOpen={showOtherServices}
          setIsOpen={setShowOtherServices}
          items={related.slice(0, 48).map((s) => ({
            id: s.slug,
            label: s.name,
            href: `/${s.slug}`,
          }))}
          gridCols="grid-cols-5"
          bgColor="bg-white"
        />

        <FAQSection faqs={faqs} title={`Frequently Asked Questions About Hiring a ${serviceName}`} />

        {/* CTA - scrolls back to the top so the visitor can keep reviewing providers */}
        <div className="bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Review the {serviceName} freelancers above and reach out directly.
            </p>
            <button
              type="button"
              onClick={scrollToProviders}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              See available freelancers
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile-only back-to-top */}
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
            onSubmit={handleRequestSubmit}
          />
        )}
      </div>
    </>
  );
}
