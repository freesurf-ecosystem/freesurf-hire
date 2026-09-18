import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useNavigate } from '../lib/navigation-compat';
import { MapPin, Building, Users, Wrench } from 'lucide-react';
import { Contractor } from '../types';
import { locations } from '../data/locationData';
import { services } from '../data/services';
import { injectSchema, removeSchema } from '../utils/schemaGenerator';
import { supabase } from '../lib/supabase';
import Footer from './Layout/Footer';
import { ChevronSection, Breadcrumb, ServiceLandingHero, ContractorCardGrid, FAQSection, SearchBar, useContractorProfiles } from './landing';
import RequestSubmissionModal from './RequestSubmissionModal';

interface ServiceLocationLandingProps {
  service?: string; // service slug
  state?: string; // state name
  location?: string; // location slug
  locationType?: 'city' | 'county' | 'neighborhood';
}

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function ServiceLocationLanding({ service, state, location, locationType = 'city' }: ServiceLocationLandingProps) {
  const navigate = useNavigate();
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [selectedState, setSelectedState] = useState('');
  const [citiesInState, setCitiesInState] = useState<{ name: string; slug: string; population?: number | null }[]>([]);
  const [countiesInState, setCountiesInState] = useState<{ name: string; slug: string; population?: number | null }[]>([]);
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const [showCountiesDropdown, setShowCountiesDropdown] = useState(false);
  const [showOtherServicesDropdown, setShowOtherServicesDropdown] = useState(false);
  const [showOtherStatesDropdown, setShowOtherStatesDropdown] = useState(false);

  const urlService = service;
  const urlState = state;
  const urlLocation = location;
  const router = useRouter();
  const zipParam = typeof router.query.zip === 'string' ? router.query.zip : '';

  const serviceObj = services.find((s) => s.slug === urlService);
  const stateObj = locations.find((s) => s.name === urlState);
  const serviceName = serviceObj?.name || 'Service';
  const stateName = stateObj?.name || 'Unknown State';

  const { contractors, isLoading: contractorsLoading } = useContractorProfiles({
    serviceSlug: urlService,
    serviceName,
    stateAbbr: stateObj?.state,
    citySlug: urlLocation,
    zipCode: zipParam,
  });

  const formatLocationName = (name?: string) => {
    if (!name) return 'Unknown Location';
    const spaced = name.replace(/-/g, ' ');
    return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const cleanLocationSlug = (slug: string, stateCode: string) => {
    const suffix = `-${stateCode.toLowerCase()}`;
    return slug.endsWith(suffix) ? slug.slice(0, -suffix.length) : slug;
  };

  const generateLocationUrl = (serviceSlug: string, stateNameParam: string, locSlug: string) =>
    `/${slugify(serviceSlug)}/${slugify(stateNameParam)}/${locSlug}`;

  const hashString = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  // Resolve `{a|b|c}` spintax deterministically per seed so each service/location
  // page gets a stable but varied phrasing (SEO variety).
  const resolveSpintax = (text: string, seed: string) =>
    text.replace(/\{([^{}]+)\}/g, (match, content) => {
      if (!content.includes('|')) return match;
      const options = content.split('|').map((option: string) => option.trim()).filter(Boolean);
      if (options.length === 0) return match;
      return options[hashString(`${seed}:${content}`) % options.length];
    });

  // Load the city / neighborhood record for this page
  useEffect(() => {
    if (!urlLocation) return;

    const loadLocationData = async () => {
      try {
        const table = locationType === 'county' ? 'counties' : locationType === 'neighborhood' ? 'neighborhoods' : 'cities';
        let { data, error } = await supabase.from(table).select('*').eq('slug', urlLocation).single();

        if (error && locationType === 'city') {
          const fallback = await supabase.from('neighborhoods').select('*').eq('slug', urlLocation).single();
          if (!fallback.error && fallback.data) {
            data = fallback.data;
            error = null;
          }
        }

        if (!error) setLocationData(data);
      } catch (err) {
        console.error('Failed to load location data:', err);
      }
    };

    loadLocationData();
  }, [urlLocation, locationType]);

  // Load other cities and counties in this state for internal linking
  useEffect(() => {
    const fetchLocations = async () => {
      if (!stateObj) return;
      const [citiesResult, countiesResult] = await Promise.all([
        supabase
          .from('cities')
          .select('name,slug,state_code,population')
          .eq('state_code', stateObj.state)
          .neq('slug', urlLocation || '')
          .order('population', { ascending: false })
          .limit(12),
        supabase
          .from('counties')
          .select('name,slug,state_code,population')
          .eq('state_code', stateObj.state)
          .neq('slug', urlLocation || '')
          .order('population', { ascending: false })
          .limit(12),
      ]);
      if (!citiesResult.error) setCitiesInState((citiesResult.data || []) as any);
      if (!countiesResult.error) setCountiesInState((countiesResult.data || []) as any);
    };
    fetchLocations();
  }, [stateObj, urlLocation]);

  const displayLocationName = formatLocationName(locationData?.name || urlLocation || 'Unknown Location');
  const displayPopulation = locationData?.population ? locationData.population.toLocaleString() : null;

  const pageTitle = `${serviceName} in ${displayLocationName}, ${stateName} | FreeSurf`;
  const pageDescription = `Find and hire trusted ${serviceName} in ${displayLocationName}, ${stateName}. Compare local pros and remote freelancers — free to use, no lead fees or commissions.`;

  const heroDescription = useMemo(() => {
    const templateSeed = `${serviceName}|${stateName}|${displayLocationName}`;
    const template = `{Connect with|Find|Hire} {verified|local|trusted} ${serviceName.toLowerCase()} pros in ${displayLocationName}. {Request|Compare|Get} {quotes|bids} from local pros and remote freelancers — free to use, no lead fees or commissions.${displayPopulation ? ` Serving a population of ${displayPopulation}.` : ''}`;
    return resolveSpintax(template, templateSeed);
  }, [displayLocationName, serviceName, stateName, displayPopulation]);

  const serviceFaqs = useMemo(
    () => [
      {
        question: `How do I hire a ${serviceName.toLowerCase()} in ${displayLocationName}?`,
        answer: `Search FreeSurf for ${serviceName.toLowerCase()} near ${displayLocationName}, compare quotes from local pros and remote freelancers, then contact them directly. FreeSurf charges no lead fees or commissions.`,
        slug: `how-to-hire-${slugify(serviceName)}`,
      },
      {
        question: `How much does a ${serviceName.toLowerCase()} cost in ${stateName}?`,
        answer: `Costs vary with the scope of the job and the provider. Ask for a written quote and compare at least three before you decide.`,
        slug: `cost-of-${slugify(serviceName)}`,
      },
      {
        question: `Can I hire a ${serviceName.toLowerCase()} remotely?`,
        answer: `Some ${serviceName.toLowerCase()} work can be done remotely. FreeSurf lists both local pros and remote freelancers so you can choose what fits your project.`,
        slug: `remote-${slugify(serviceName)}`,
      },
      {
        question: `Does FreeSurf charge fees to hire a ${serviceName.toLowerCase()}?`,
        answer: `No. FreeSurf is free to use — no lead fees, no commissions, and you pay the contractor directly however you both agree.`,
        slug: `fees-for-${slugify(serviceName)}`,
      },
    ],
    [serviceName, displayLocationName, stateName]
  );

  // SEO: title, meta description and structured data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!serviceObj || !stateObj) return;

    document.title = pageTitle;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', pageDescription);

    const base = 'https://freesurf.tools';
    const serviceSlug = slugify(serviceName);
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
        { '@type': 'ListItem', position: 2, name: serviceName, item: `${base}/${serviceSlug}/` },
        { '@type': 'ListItem', position: 3, name: stateName, item: `${base}/${serviceSlug}/${slugify(stateName)}/` },
        { '@type': 'ListItem', position: 4, name: displayLocationName },
      ],
    };
    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${serviceName} in ${displayLocationName}, ${stateName}`,
      serviceType: serviceName,
      areaServed: { '@type': 'City', name: displayLocationName },
      provider: { '@type': 'Organization', name: 'FreeSurf', url: `${base}/` },
    };
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: serviceFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    };
    const collectionPage = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${serviceName} in ${displayLocationName}, ${stateName}`,
      description: pageDescription,
      url: `${base}/${serviceSlug}/${slugify(stateName)}/${urlLocation}/`,
      about: { '@type': 'Service', name: serviceName },
      isPartOf: { '@type': 'WebSite', name: 'FreeSurf', url: `${base}/` },
    };
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${serviceName} contractors in ${displayLocationName}, ${stateName}`,
      numberOfItems: contractors.length,
      itemListElement: contractors.slice(0, 20).map((c, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'LocalBusiness',
          name: c.company || c.name,
          ...(c.rating
            ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: c.rating, reviewCount: c.reviewCount || 0 } }
            : {}),
        },
      })),
    };
    const place = {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: displayLocationName,
      address: { '@type': 'PostalAddress', addressRegion: stateName, addressCountry: 'US' },
      ...(locationData?.population
        ? { additionalProperty: [{ '@type': 'PropertyValue', name: 'population', value: locationData.population }] }
        : {}),
    };

    setTimeout(() => {
      injectSchema(breadcrumb, 'schema-breadcrumb');
      injectSchema(collectionPage, 'schema-collection');
      injectSchema(serviceSchema, 'schema-service');
      injectSchema(itemList, 'schema-itemlist');
      injectSchema(place, 'schema-place');
      injectSchema(faqSchema, 'schema-faq');
    }, 0);

    return () => {
      removeSchema('schema-breadcrumb');
      removeSchema('schema-collection');
      removeSchema('schema-service');
      removeSchema('schema-itemlist');
      removeSchema('schema-place');
      removeSchema('schema-faq');
    };
  }, [contractors, displayLocationName, locationData, pageDescription, pageTitle, serviceFaqs, serviceName, serviceObj, stateName, stateObj, urlLocation]);

  const handleContactClick = (contractor: Contractor) => setSelectedContractor(contractor);
  const handleRequestSubmit = () => {
    setSelectedContractor(null);
    alert('Request submitted! The contractor has been notified.');
  };

  const handleNewSearch = () => {
    if (selectedState) {
      navigate(`/${slugify(serviceName)}/${slugify(selectedState)}`);
    } else {
      navigate('/');
    }
  };

  if (!serviceObj || !stateObj) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            {!serviceObj && 'Service not found. '}
            {!stateObj && 'Location not found. '}
          </p>
          <a href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchBar
            initialServiceSlug={urlService}
            initialZip={zipParam}
            onSearch={(selected, zip) => {
              if (selected.scope === 'remote') {
                navigate(`/${selected.slug}`);
                return;
              }
              if (zip) navigate(`/${selected.slug}/${zip}`);
            }}
          />

          {/* Breadcrumb & Title */}
          <div className="mb-12 text-center">
            <Breadcrumb
              items={[
                { name: 'Home', url: '/' },
                { name: serviceName, url: `/${slugify(serviceName)}` },
                { name: stateName, url: `/${slugify(serviceName)}/${slugify(stateName)}` },
                { name: displayLocationName },
              ]}
            />

            <ServiceLandingHero
              service={serviceName}
              contractorCount={contractors.length}
              locationLabel={`in ${displayLocationName}, ${stateName}`}
              description={heroDescription}
            />
          </div>
        </div>

        {/* Location info card */}
        {locationData && (
          <div className="bg-white py-8 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">{locationType === 'county' ? 'County' : locationType === 'neighborhood' ? 'Neighborhood' : 'City'}</div>
                    <div className="font-semibold text-lg">{displayLocationName}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">State</div>
                    <div className="font-semibold text-lg">{stateName}</div>
                  </div>
                </div>
                {displayPopulation && (
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Population</div>
                      <div className="font-semibold text-lg">{displayPopulation}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Service</div>
                    <div className="font-semibold text-lg">{serviceName}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contractors */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {zipParam && (
            <p className="text-sm text-gray-600 mb-4">
              Showing contractors who serve zipcode <span className="font-medium">{zipParam}</span>.
              <button
                type="button"
                onClick={() => {
                  const query = { ...router.query };
                  delete query.zip;
                  router.replace({ pathname: router.pathname, query });
                }}
                className="ml-2 text-blue-600 hover:underline"
              >
                Show all of {displayLocationName}
              </button>
            </p>
          )}
          <ContractorCardGrid
            contractors={contractors}
            isLoading={contractorsLoading}
            onContactClick={handleContactClick}
            emptyStateMessage="No contractors yet"
            emptyStateService={serviceName.toLowerCase()}
            onEmptyStateAction={() => navigate('/')}
          />
        </div>

        {/* Cities */}
        <ChevronSection
          title={`Find ${serviceName} in Cities Throughout ${stateName}`}
          description={`Browse ${serviceName} in major cities across ${stateName}.`}
          isOpen={showCitiesDropdown}
          setIsOpen={setShowCitiesDropdown}
          items={citiesInState.map((city) => ({
            id: city.slug,
            label: formatLocationName(city.name),
            href: generateLocationUrl(serviceName, stateName, cleanLocationSlug(city.slug, stateObj?.state || '')),
          }))}
          gridCols="grid-cols-6"
          bgColor="bg-gray-100"
        />

        {/* Counties - only on county pages */}
        {locationType === 'county' && (
          <ChevronSection
            title={`Find ${serviceName} in Other Counties in ${stateName}`}
            description={`Browse ${serviceName} across counties throughout ${stateName}.`}
            isOpen={showCountiesDropdown}
            setIsOpen={setShowCountiesDropdown}
            items={countiesInState.map((county) => ({
              id: county.slug,
              label: formatLocationName(county.name),
              href: generateLocationUrl(serviceName, stateName, cleanLocationSlug(county.slug, stateObj?.state || '')),
            }))}
            gridCols="grid-cols-6"
            bgColor="bg-white"
          />
        )}

        {/* Other services */}
        <ChevronSection
          title={`Browse Other Services in ${displayLocationName}, ${stateName}`}
          description={`Explore other services available in ${displayLocationName}.`}
          isOpen={showOtherServicesDropdown}
          setIsOpen={setShowOtherServicesDropdown}
          items={services
            .filter((s) => s.scope !== 'remote' && s.slug !== urlService)
            .slice(0, 48)
            .map((s) => ({
              id: s.slug,
              label: s.name,
              href: generateLocationUrl(s.name, stateName, urlLocation || ''),
            }))}
          gridCols="grid-cols-5"
          bgColor="bg-white"
        />

        {/* Other states */}
        <ChevronSection
          title={`Find ${serviceName} in Other States`}
          description={`Browse ${serviceName.toLowerCase()} across different states.`}
          isOpen={showOtherStatesDropdown}
          setIsOpen={setShowOtherStatesDropdown}
          items={locations
            .filter((loc) => loc.name !== stateName)
            .map((loc) => ({
              id: loc.id,
              label: loc.name,
              href: `/${slugify(serviceName)}/${slugify(loc.name)}`,
            }))}
          gridCols="grid-cols-6"
          bgColor="bg-gray-100"
        />

        <FAQSection faqs={serviceFaqs} title={`Frequently Asked Questions About Hiring a ${serviceName} in ${displayLocationName}`} />

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
