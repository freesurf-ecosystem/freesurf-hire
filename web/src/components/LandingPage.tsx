import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from '../lib/navigation-compat';
import { Search, Home, MapPin, Clock, DollarSign, GitCompare, ChevronDown, ChevronUp } from 'lucide-react';
import { serviceTypes } from '../data/serviceTypes';
import type { ServiceType } from '../data/serviceTypes';
import { services } from '../data/services';
import type { ServiceOption } from '../data/services';
import { useInferredLocation } from '../lib/geo';
import Header from './Layout/Header';
import Typewriter from './landing/components/Typewriter';
import Graphic from './landing/components/Graphic';
import { MARKETPLACE_COMPARISON } from '../config/marketplaceComparison';
import Reveal from './landing/components/Reveal';
// Lazy load Footer since it's below the fold
const Footer = lazy(() => import('./Layout/Footer'));



// Split hero imagery: local trade work on the left, remote freelancing on the right.
const HERO_IMAGES = {
  local: 'https://images.pexels.com/photos/5691503/pexels-photo-5691503.jpeg',
  remote: 'https://images.pexels.com/photos/12662877/pexels-photo-12662877.jpeg',
};

// Same split concept for the closing CTA, with different photography.
const CTA_IMAGES = {
  local: 'https://images.pexels.com/photos/5767799/pexels-photo-5767799.jpeg',
  remote: 'https://images.pexels.com/photos/5588200/pexels-photo-5588200.jpeg',
};

const heroImageUrl = (src: string) => {
  const w = typeof window !== 'undefined' && window.innerWidth < 768 ? '800' : '1600';
  return `${src}?auto=compress&cs=tinysrgb&w=${w}`;
};

const REVEAL_STEP = 24;

const FEATURED_SLUGS = new Set(serviceTypes.map((s) => s.slug));
const IN_PERSON_FEATURED = serviceTypes.filter((s) => s.scope === 'local');
const REMOTE_FEATURED = serviceTypes.filter((s) => s.scope === 'remote');
const EXTRA_IN_PERSON = services.filter((s) => s.scope !== 'remote' && !FEATURED_SLUGS.has(s.slug));
const EXTRA_REMOTE = services.filter((s) => s.scope === 'remote' && !FEATURED_SLUGS.has(s.slug));

// Typed intro copy — mirrors the reveal used on the Post app hero.
const HEADLINE_TYPE_LINES = [
  { text: 'New open-source, commission-free', italic: true },
  { text: 'marketplace for contractors' },
];

const INTRO_TYPE_LINES = [
  { text: '(Typically either:' },
  { text: 'contractors pay a lead fee or a commission is taken' },
  { text: 'or clients pay a subscription to access contractors)' },
];


type SelectableService = { name: string; slug: string; scope: string };

function ServiceGroup({
  title,
  subtitle,
  featured,
  extras,
  reveal,
  onReveal,
  onSelect,
}: {
  title: string;
  subtitle: string;
  featured: ServiceType[];
  extras: ServiceOption[];
  reveal: number;
  onReveal: (next: number) => void;
  onSelect: (service: SelectableService) => void;
}) {
  return (
    <div className="mb-16 last:mb-0">
      <Reveal>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featured.map((service, index) => {
          const Icon = service.icon;
          return (
            <Reveal key={service.slug} delayMs={(index % 3) * 90} className="h-full">
              <a
                href={`/${service.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(service);
                }}
                className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 text-left w-full"
              >
                <div className="p-6">
                  <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>

      {reveal > 0 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {extras.slice(0, reveal).map((s) => (
            <a
              key={s.slug}
              href={`/${s.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelect(s);
              }}
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              {s.name}
            </a>
          ))}
        </div>
      )}

      {extras.length > 0 && (
        <div className="text-center mt-6">
          {reveal < extras.length ? (
            <button
              type="button"
              onClick={() => onReveal(Math.min(reveal + REVEAL_STEP, extras.length))}
              className="inline-flex items-center gap-2 text-blue-700 font-medium hover:text-blue-900 transition-colors"
            >
              Show more
              <ChevronDown className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onReveal(0)}
              className="inline-flex items-center gap-2 text-gray-500 font-medium hover:text-gray-700 transition-colors"
            >
              Show fewer
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [serviceQuery, setServiceQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [showServiceList, setShowServiceList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [zip, setZip] = useState('');
  const [zipTouched, setZipTouched] = useState(false);
  const [localReveal, setLocalReveal] = useState(0);
  const [remoteReveal, setRemoteReveal] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const [outroActive, setOutroActive] = useState(false);
  const [outroDots, setOutroDots] = useState(0);

  const inferred = useInferredLocation();

  // Prefill the zipcode from the visitor's approximate location (IP) until they type their own.
  useEffect(() => {
    if (!zipTouched && inferred.zip) setZip(inferred.zip);
  }, [inferred.zip, zipTouched]);

  const isRemote = selectedService?.scope === 'remote';

  // Only surface matches once the user starts typing.
  const filteredServices = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    if (!q) return [];
    return services.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 50);
  }, [serviceQuery]);

  const selectService = (service: ServiceOption) => {
    setSelectedService(service);
    setServiceQuery(service.name);
    setShowServiceList(false);
    setHighlightedIndex(-1);
    if (service.scope === 'remote') setZip('');
  };

  // Remote services go straight to their landing page; local ones pre-fill the
  // search bar and send the user to the zipcode field.
  const goToService = (service: SelectableService) => {
    if (service.scope === 'remote') {
      navigate(`/${service.slug}`);
      return;
    }
    setSelectedService({
      name: service.name,
      slug: service.slug,
      scope: service.scope as ServiceOption['scope'],
    });
    setServiceQuery(service.name);
    setShowServiceList(false);
    setHighlightedIndex(-1);
    setZip('');
    if (typeof document !== 'undefined') {
      const input = document.getElementById('landing-zip') as HTMLInputElement | null;
      input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input?.focus();
    }
  };

  // Preload the hero background images
  useEffect(() => {
    const local = new Image();
    local.onload = () => setIsImageLoaded(true);
    local.src = heroImageUrl(HERO_IMAGES.local);
    const remote = new Image();
    remote.src = heroImageUrl(HERO_IMAGES.remote);
  }, []);

  // Type the trailing ellipsis on "We wanted to put a stop to the practice", one dot at a time.
  useEffect(() => {
    if (!outroActive || outroDots >= 3) return;
    const timer = setTimeout(
      () => setOutroDots((count) => count + 1),
      outroDots === 0 ? 300 : 500
    );
    return () => clearTimeout(timer);
  }, [outroActive, outroDots]);

  const handleSearch = () => {
    if (!selectedService) {
      alert('Please select a service type to continue');
      return;
    }
    // Remote skills have no location component.
    if (isRemote) {
      navigate(`/${selectedService.slug}`);
      return;
    }
    if (!zip.trim()) {
      alert('Please enter a zipcode to find contractors in your area');
      return;
    }
    navigate(`/${selectedService.slug}/${zip.trim()}`);
  };



  return (
    <div className="min-h-screen bg-white">
        {/* Header with Authentication */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <Header currentView="landing" isOverlay={true} />
        </div>

      {/* Hero Section */}
      <div 
        className={`hero-section relative text-white transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-90'}`} 
      >
        <div className="absolute inset-0 flex">
          <div
            className="w-1/2 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImageUrl(HERO_IMAGES.local)})` }}
          />
          <div
            className="w-1/2 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImageUrl(HERO_IMAGES.remote)})` }}
          />
        </div>
        <div className="hero-overlay absolute inset-0 bg-black opacity-40"></div>
        <div className="hero-content relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
          <div className="text-center mb-12">
            <h1 className="hero-title text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find contractors near you or a remote freelancer
            </h1>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
            {/* Single Line Search */}
            <div className="flex flex-col sm:flex-row gap-0 border border-gray-300 rounded-xl">
              {/* Service Field */}
              <div className="relative flex-1 border-b sm:border-b-0 sm:border-r border-gray-300 rounded-t-xl sm:rounded-t-none sm:rounded-l-xl">
                <div className="w-full px-4 py-4 flex items-center space-x-3">
                  <Home className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={serviceQuery}
                      onChange={(e) => {
                        setServiceQuery(e.target.value);
                        setSelectedService(null);
                        setShowServiceList(true);
                        setHighlightedIndex(-1);
                      }}
                      onFocus={() => {
                        if (filteredServices.length > 0) setShowServiceList(true);
                      }}
                      onBlur={() => setTimeout(() => setShowServiceList(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          if (!showServiceList) {
                            setShowServiceList(true);
                            setHighlightedIndex(filteredServices.length > 0 ? 0 : -1);
                          } else {
                            setHighlightedIndex((i) => Math.min(i + 1, filteredServices.length - 1));
                          }
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setHighlightedIndex((i) => Math.max(i - 1, 0));
                        } else if (e.key === 'Enter') {
                          if (showServiceList && highlightedIndex >= 0 && filteredServices[highlightedIndex]) {
                            e.preventDefault();
                            selectService(filteredServices[highlightedIndex]);
                          }
                        } else if (e.key === 'Escape') {
                          setShowServiceList(false);
                          setHighlightedIndex(-1);
                        }
                      }}
                      placeholder="Search services"
                      autoComplete="off"
                      className="w-full font-medium text-gray-900 placeholder-gray-500 border-none outline-none focus:ring-0 p-0 bg-transparent"
                    />
                    {showServiceList && serviceQuery.trim().length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-3 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-30">
                        {filteredServices.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-500">No services match "{serviceQuery.trim()}".</p>
                        ) : (
                          filteredServices.map((s, index) => (
                            <button
                              type="button"
                              key={s.slug}
                              onMouseDown={(e) => e.preventDefault()}
                              onMouseEnter={() => setHighlightedIndex(index)}
                              onClick={() => selectService(s)}
                              className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-left ${
                                index === highlightedIndex ? 'bg-blue-50' : ''
                              }`}
                            >
                              <span className="text-gray-900">{s.name}</span>
                              {s.scope === 'remote' && (
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Remote</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Zipcode Field */}
              <div className="relative flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-300" style={{width: '150px'}}>
                <div className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className={`h-5 w-5 flex-shrink-0 ${isRemote ? 'text-gray-300' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <input
                        id="landing-zip"
                        type="text"
                        inputMode="numeric"
                        value={zip}
                        onChange={(e) => {
                          setZipTouched(true);
                          setZip(e.target.value.replace(/[^0-9]/g, '').slice(0, 5));
                        }}
                        disabled={isRemote}
                        placeholder={isRemote ? 'Remote' : 'Zipcode'}
                        autoComplete="postal-code"
                        className={`w-full font-medium border-none outline-none focus:ring-0 p-0 bg-transparent ${isRemote ? 'text-gray-300 placeholder-gray-300 cursor-not-allowed' : 'text-gray-900 placeholder-gray-500'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex-shrink-0 rounded-b-xl sm:rounded-b-none sm:rounded-r-xl overflow-hidden" style={{minWidth: '140px'}}>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!selectedService || (!isRemote && !zip.trim())}
                  title={!selectedService ? 'Select a service to continue' : (!isRemote && !zip.trim()) ? 'Enter a zipcode to find local contractors' : 'Search'}
                  className="w-full h-full bg-blue-800 text-white hover:bg-blue-900 transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 px-4 py-4"
                >
                  <Search className="h-5 w-5" />
                  <span className="font-medium">Search</span>
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Choose a service to find qualified contractors. Add a zipcode for local results — remote skills don't need one.
            </p>
          </div>
        </div>
      </div>

      {/* Clarification Section */}
      <div className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              <Typewriter
                lines={HEADLINE_TYPE_LINES}
                startDelayMs={350}
                onComplete={() => setIntroActive(true)}
              />
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-loose">
              <Typewriter
                lines={INTRO_TYPE_LINES}
                active={introActive}
                startDelayMs={120}
                onComplete={() => setOutroActive(true)}
              />
            </p>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 max-w-3xl mx-auto mt-4 italic">
              We wanted to put a stop to the practice
              {outroActive && (
                <>
                  {'.'.repeat(outroDots)}
                  <span className="freesurf-caret">|</span>
                </>
              )}
            </h3>
          </div>

          <Reveal>
            <div className="flex items-center justify-between gap-4 mb-10">
              <h3 className="text-lg font-bold text-gray-900">How our marketplace differs</h3>
              <span className="ml-auto text-right text-lg font-bold text-gray-900">
                vs. other marketplaces
              </span>
            </div>
          </Reveal>

          <div className="space-y-16">
            {MARKETPLACE_COMPARISON.map(({ concept, us, them, freesurf, other }) => (
              <div key={concept}>
                <Reveal>
                  <div className="flex items-start gap-4">
                    <span className="h-16 w-16 flex-shrink-0 rounded-2xl bg-white text-blue-600 flex items-center justify-center">
                      <Graphic src={us} className="h-12 w-12" />
                    </span>
                    <p className="min-w-0 flex-1 text-base sm:text-lg font-semibold leading-relaxed text-gray-900">
                      {freesurf}
                    </p>
                  </div>
                </Reveal>

                <Reveal delayMs={220}>
                  <div className="mt-4 ml-20 flex items-start gap-4">
                    <p className="flex-1 pl-12 text-base sm:text-lg italic leading-relaxed text-gray-900">
                      <span className="font-semibold">Other marketplaces:</span> {other}
                    </p>
                    <span className="h-16 w-16 flex-shrink-0 rounded-2xl bg-white text-black flex items-center justify-center">
                      <Graphic src={them} className="h-12 w-12" />
                    </span>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Contractors for All Types of Needs
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From home services to remote freelance skills — our network of contractors and freelancers is ready to help
              </p>
            </div>
          </Reveal>

          <ServiceGroup
            title="In-person skills"
            subtitle="Local pros who come to you — add your zipcode to see who's nearby."
            featured={IN_PERSON_FEATURED}
            extras={EXTRA_IN_PERSON}
            reveal={localReveal}
            onReveal={setLocalReveal}
            onSelect={goToService}
          />

          <ServiceGroup
            title="Remote skills"
            subtitle="Work that can be done online — no zipcode needed, browse and hire right away."
            featured={REMOTE_FEATURED}
            extras={EXTRA_REMOTE}
            reveal={remoteReveal}
            onReveal={setRemoteReveal}
            onSelect={goToService}
          />
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose FreeSurf?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don't want to worry about platform overreach
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delayMs={0}>
              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GitCompare className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compare Offers</h3>
                <p className="text-gray-600">Get multiple quotes from contractors without unintentionally billing them for the conversation (see our article on lead-fee platforms)</p>
              </div>
            </Reveal>

            <Reveal delayMs={90}>
              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Speak directly to the contractor if you want, pay how you want</h3>
                <p className="text-gray-600">Get conversations started with low friction</p>
              </div>
            </Reveal>

            <Reveal delayMs={180}>
              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscription necessary</h3>
                <p className="text-gray-600">Check out all of our other free tools in the footer to help your own business succeed</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative text-white">
        <div className="absolute inset-0 flex">
          <div
            className="w-1/2 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImageUrl(CTA_IMAGES.local)})` }}
          />
          <div
            className="w-1/2 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImageUrl(CTA_IMAGES.remote)})` }}
          />
        </div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-24">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Your First Quote?
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Both service type and zipcode are required to find contractors in your area.
            </p>
            <button
              onClick={() => {
                // Smooth scroll to top with better performance
                if ('scrollTo' in window) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  // Fallback for older browsers
                  document.documentElement.scrollTop = 0;
                }
              }}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </button>
          </Reveal>
        </div>
      </div>

      {/* Footer */}
      <Suspense fallback={<div style={{ height: '200px' }} />}>
        <Footer navigate={navigate} />
      </Suspense>
      </div>
  );
}
