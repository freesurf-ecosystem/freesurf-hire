import { Building2, DollarSign, Globe, MapPin, MousePointerClick, Shield, Star } from 'lucide-react';
import { useNavigate } from '../../lib/navigation-compat';
import { serviceTypes } from '../../data/serviceTypes';
import { FREE_LEAD_OFFER_LONG, FREE_LEAD_OFFER_SHORT } from '../../config/pricing';
import {
  LeadComparisonSection,
  LeadFeatureStripSection,
  LeadFinalCtaSection,
  LeadHeroSection,
  LeadPageFrame,
  LeadPricingSection,
  LeadProcessSection,
  LeadServiceGridSection,
  LeadSpotlightSection,
  useLeadLandingMetadata,
} from './shared';

export default function ContractorLeadsLanding() {
  const navigate = useNavigate();

  const pageUrl = 'https://freesurf.tools/join-as-contractor';
  const pageTitle = 'Join as a Contractor - FreeSurf';
  const pageDescription =
    'FreeSurf is a free, open-source network where contractors, tradespeople, and freelancers get found by clients searching for what they do. No lead fees, no commission, no subscription.';

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
            'A free directory connecting clients with contractors, tradespeople, and freelancers. Clients send requests directly to the contractor they choose.',
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
            description: `${FREE_LEAD_OFFER_LONG}`,
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
    navigate('/investor-signup');
  };

  const comparisonCards = [
    {
      title: 'Pay-per-lead marketplaces',
      pricing: 'Charge per inquiry, often $50-$250+ each',
      fit: 'Raw inbound volume, if you have the follow-up capacity to work it.',
      tradeoff:
        'You pay before you know whether the job is real, and the same inquiry is often sold to several contractors at once.',
    },
    {
      title: 'PPC and ads platforms',
      pricing: 'You fund the ads, landing pages, and ongoing management',
      fit: 'Works if you already run paid acquisition well.',
      tradeoff: 'Real setup cost and ad spend before you learn whether the channel works for you.',
    },
    {
      title: 'FreeSurf',
      pricing: `${FREE_LEAD_OFFER_SHORT}`,
      fit: 'Best when you want to be found without per-lead costs, commission, or subscriptions while the network grows.',
      tradeoff:
        'An earlier-stage network, so the value today is free visibility â€” and requests that come to you with real context attached.',
      featured: true,
    },
  ];

  const supportedServices = serviceTypes.map((service) => ({
    title: service.name,
    description: service.description,
    href: `/${service.slug}`,
  }));

  return (
    <LeadPageFrame navigate={navigate}>
      <LeadHeroSection
        eyebrow={`Contractor Network \u2022 ${FREE_LEAD_OFFER_SHORT.toUpperCase()}`}
        title="Get found by clients who"
        accentTitle="need your work"
        description={`FreeSurf is a free, open-source network where contractors, tradespeople, and freelancers are found by clients searching for what they do. Clients send you a request with their details, or call you directly if you choose to share your number. ${FREE_LEAD_OFFER_LONG}`}
        signals={[
          `${FREE_LEAD_OFFER_SHORT}`,
          'No lead fees and no commission on your work',
          'Requests come straight to you \u2014 you decide who to take on',
        ]}
        primaryActionLabel="Create Your Free Profile"
        onPrimaryAction={handleGetStarted}
        secondaryActionLabel="Sign in"
        onSecondaryAction={() => navigate('/investor-login')}
        snapshotLabel="How it works"
        snapshotTitle="From profile to paying work"
        snapshotBadge={`${FREE_LEAD_OFFER_SHORT}`}
        snapshotCards={[
          {
            eyebrow: 'Step 1',
            title: 'Create your profile',
            description:
              'List the services you offer, the area you cover, and how you want to be contacted. It takes a few minutes and costs nothing.',
            icon: Star,
            tone: 'warm',
          },
          {
            eyebrow: 'Step 2',
            title: 'Clients find you',
            description:
              'People searching for your service in your area see your profile alongside the work you do and where you operate.',
            icon: MousePointerClick,
            tone: 'teal',
          },
          {
            eyebrow: 'Step 3',
            title: 'They reach out, you decide',
            description:
              'Requests arrive in your dashboard with the client\u2019s details and what they need. You choose who to follow up with.',
            icon: DollarSign,
            tone: 'dark',
          },
        ]}
      />

      <LeadFeatureStripSection
        cards={[
          {
            icon: Shield,
            title: 'No lead fees, ever',
            description:
              'We don\u2019t charge per inquiry and we don\u2019t take a cut of your work. You keep everything you earn from the client.',
          },
          {
            icon: Building2,
            title: 'Built for every kind of work',
            description:
              'Tradespeople, local service providers, and remote freelancers can all be listed. Local work uses a zipcode; remote skills don\u2019t need one.',
          },
          {
            icon: Globe,
            title: 'You control your contact details',
            description:
              'Share your website if you have one. Your phone number is never listed publicly \u2014 visitors can reveal it one at a time, only if you allow it.',
          },
        ]}
      />

      <LeadComparisonSection
        eyebrow="Why the model is different"
        title="Most networks charge you for the introduction"
        description="Per-lead pricing, commission on your invoices, or a monthly subscription just to be listed. We do none of those things."
        cards={comparisonCards}
        actionLabel="Read more in our resources"
        onAction={() => navigate('/resources')}
      />

      <LeadProcessSection
        eyebrow="How It Works"
        title="Being found, without the lead-fee friction"
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

      <LeadPricingSection
        eyebrow="Pricing"
        title={`${FREE_LEAD_OFFER_SHORT} \u2014 no per-lead costs`}
        description={`While we build the network, participation is free: no per-lead charges, no commission, and no contracts. ${FREE_LEAD_OFFER_LONG}`}
        bullets={[
          `${FREE_LEAD_OFFER_LONG}`,
          'No lead fees and no commission \u2014 you keep what you earn.',
          'No subscriptions, no setup fees, and no long-term contracts.',
          'Your profile stays yours: list your website and decide whether to share a phone number.',
        ]}
      />

      <LeadServiceGridSection
        eyebrow="Category Coverage"
        title="Categories you can be listed in"
        description="Local trades and remote freelance skills, all on the same network. Pick the ones you actually do."
        cards={supportedServices}
        navigate={navigate}
      />

      <LeadSpotlightSection
        eyebrow="Why Contractors Join"
        title="A lower-risk way to get in front of clients"
        description="Different contractors want different things from a network. The platform works best when your profile reflects the real shape of your business."
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
        panelTitle="A free network with no middleman tax"
        panelCards={[
          {
            title: 'Requests, not auctions',
            description:
              'A client sends their request to you with context attached. You decide whether it is a fit.',
          },
          {
            title: 'No lead-fee risk',
            description:
              'No per-lead charges, no commission, and no subscription while the network is free for early participants.',
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
        description={`Create your free profile and start appearing in local and remote searches. ${FREE_LEAD_OFFER_LONG}`}
        primaryActionLabel="Create Your Free Profile"
        onPrimaryAction={handleGetStarted}
        secondaryActionLabel="Already have an account?"
        onSecondaryAction={() => navigate('/investor-login')}
      />
    </LeadPageFrame>
  );
}
