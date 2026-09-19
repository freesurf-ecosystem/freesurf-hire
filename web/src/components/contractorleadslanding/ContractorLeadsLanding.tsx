import { Building2, Globe, MapPin, Shield } from 'lucide-react';
import { useNavigate } from '../../lib/navigation-compat';
import { FREE_TO_USE_LONG } from '../../config/pricing';
import {
  LeadComparisonChartSection,
  LeadFeatureStripSection,
  LeadFinalCtaSection,
  LeadHeroSection,
  LeadPageFrame,
  LeadProcessSection,
  LeadSkillSearchSection,
  LeadSpotlightSection,
  useLeadLandingMetadata,
} from './shared';

export default function ContractorLeadsLanding() {
  const navigate = useNavigate();

  const pageUrl = 'https://freesurf.tools/join-as-contractor';
  const pageTitle = 'Join as a Contractor - FreeSurf';
  const pageDescription =
    'FreeSurf is a free, open-source network where contractors, tradespeople, and freelancers can find clients. No lead fees, no commission, no subscription.';

  useLeadLandingMetadata({
    title: pageTitle,
    description: pageDescription,
    schemas: [
      {
        id: 'webpage-schema',
        data: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: pageTitle,
          description: pageDescription,
          url: pageUrl,
          isPartOf: {
            '@type': 'WebSite',
            name: 'FreeSurf',
            url: 'https://freesurf.tools',
          },
          publisher: {
            '@type': 'Organization',
            name: 'FreeSurf',
            url: 'https://freesurf.tools',
          },
        },
      },
      {
        id: 'service-schema',
        data: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'FreeSurf Contractor Network',
          serviceType: 'Contractor directory',
          provider: {
            '@type': 'Organization',
            name: 'FreeSurf',
          },
          description:
            'An open-source, free-to-use directory connecting clients with contractors, tradespeople, and freelancers. Clients send requests directly to the contractor they choose.',
          areaServed: {
            '@type': 'Country',
            name: 'United States',
          },
          audience: {
            '@type': 'Audience',
            audienceType: 'Contractors, tradespeople, and freelancers',
          },
          offers: {
            '@type': 'Offer',
            price: '0.00',
            priceCurrency: 'USD',
            description: `${FREE_TO_USE_LONG}`,
          },
        },
      },
      {
        id: 'breadcrumb-schema',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://freesurf.tools',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Join as a Contractor',
              item: pageUrl,
            },
          ],
        },
      },
    ],
  });

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <LeadPageFrame navigate={navigate}>
      <LeadHeroSection
        title="A free, open-source network for contractors"
        description={
          <>
            <p>Clients can either:</p>
            <ul className="mt-3 space-y-2 pl-5">
              <li className="list-disc">call you directly,</li>
              <li className="list-disc">visit your personal website,</li>
              <li className="list-disc">or fill out a form with their job information</li>
            </ul>
            <p className="mt-4 font-semibold text-slate-800">
              No more pesky middleman fees or platform overreach
            </p>
          </>
        }
        primaryActionLabel="Create Your Free Profile"
        onPrimaryAction={handleGetStarted}
      />

      <LeadFeatureStripSection
        cards={[
          {
            icon: Globe,
            title: 'Open source',
            description:
              'The platform code is public. You can see exactly how profiles, search, and requests work — and there are no hidden fees to find, because there are none.',
          },
          {
            icon: Shield,
            title: 'No lead fees, ever',
            description:
              'We don\u2019t charge per inquiry and we don\u2019t take a cut of your work. The platform doesn\u2019t earn from the introduction, so it has no reason to gatekeep it.',
          },
          {
            icon: Building2,
            title: 'You control your contact details',
            description:
              'Share your website if you have one. Your phone number is never listed publicly — visitors can reveal it one at a time, only if you allow it.',
          },
        ]}
      />

      <LeadComparisonChartSection
        eyebrow="Why the model is different"
        title="How FreeSurf compares"
        description="Traditional platforms charge for the introduction — per lead, per commission, or per subscription. Their business model depends on owning the connection between you and the client. Ours doesn't."
      />

      <LeadProcessSection
        eyebrow="How It Works"
        title="Be found without the lead-fee friction"
        steps={[
          {
            step: '01',
            title: 'Publish your profile',
            description:
              'Add your services, service area, a short bio, and your website. Set whether visitors can reveal your phone number.',
          },
          {
            step: '02',
            title: 'Show up in local and remote search',
            description:
              'Clients browsing your service in your area find you. Remote skills are listed without a location requirement.',
          },
          {
            step: '03',
            title: 'Respond on your own terms',
            description:
              'Requests land in your dashboard with the client\u2019s name, contact details, and what they need. Take on the ones that fit.',
          },
        ]}
      />

      <LeadSkillSearchSection
        eyebrow="Find your skill"
        title="What do you do?"
        description="Search for your trade or skill to see where you'd be listed. Every service on FreeSurf is a page clients search from."
        navigate={navigate}
      />

      <LeadSpotlightSection
        eyebrow="Why Contractors Join"
        title="A different model for contractor work"
        description="Most platforms make money by owning the introduction. FreeSurf is built the other way around: connect people directly, keep the software open, and don't charge for the connection."
        cards={[
          {
            icon: MapPin,
            title: 'Local coverage',
            description:
              'List the states and zipcodes you serve so nearby clients find you when they search your trade.',
          },
          {
            icon: Globe,
            title: 'Remote skills',
            description:
              'Work that can be done online is listed without a location, so you can be found anywhere.',
          },
          {
            icon: Building2,
            title: 'No gatekeeping',
            description:
              'Clients get your details directly. There is no bidding war, no credit system, and no algorithm deciding who gets seen.',
          },
        ]}
        panelEyebrow="What We're Building"
        panelTitle="Free connections, not paid introductions"
        panelCards={[
          {
            title: 'Requests, not auctions',
            description:
              'A client sends their request to you with context attached. You decide whether it is a fit.',
          },
          {
            title: 'Open source',
            description:
              'The code is public. If you want to know how ranking, requests, or contact details work, you can read it.',
          },
          {
            title: 'Your number, your choice',
            description:
              'Phone numbers are not published. Visitors can reveal yours one request at a time, and only if you allow it.',
          },
          {
            title: 'Room to grow',
            description:
              'The network is expanding across trades, professional services, and remote freelance skills.',
          },
        ]}
      />

      <LeadFinalCtaSection
        eyebrow="Get Started"
        title="Ready to be found?"
        description={`Create your free profile and start appearing in local and remote searches. ${FREE_TO_USE_LONG}`}
        primaryActionLabel="Create Your Free Profile"
        onPrimaryAction={handleGetStarted}
        secondaryActionLabel="Already have an account?"
        onSecondaryAction={() => navigate('/login')}
      />
    </LeadPageFrame>
  );
}
