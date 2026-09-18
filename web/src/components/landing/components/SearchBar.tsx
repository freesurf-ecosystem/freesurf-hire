import React, { useEffect, useMemo, useState } from 'react';
import { Search, Home, MapPin } from 'lucide-react';
import { services } from '../../../data/services';
import type { ServiceOption } from '../../../data/services';
import { useInferredLocation } from '../../../lib/geo';

interface SearchBarProps {
  initialServiceSlug?: string;
  initialZip?: string;
  onSearch: (service: ServiceOption, zip: string) => void;
  showLabel?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialServiceSlug,
  initialZip = '',
  onSearch,
  showLabel = false,
}) => {
  const initial = services.find((s) => s.slug === initialServiceSlug) || null;
  const inferred = useInferredLocation();
  const [serviceQuery, setServiceQuery] = useState(initial?.name ?? '');
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(initial);
  const [showServiceList, setShowServiceList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [zip, setZip] = useState(initialZip);
  const [zipTouched, setZipTouched] = useState(Boolean(initialZip));

  // Prefill the zipcode from the visitor's approximate location (IP) unless they
  // already have one (e.g. on a /{service}/{zip} page) or have typed their own.
  useEffect(() => {
    if (!zipTouched && inferred.zip) setZip(inferred.zip);
  }, [inferred.zip, zipTouched]);

  const isRemote = selectedService?.scope === 'remote';

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

  const handleSearch = () => {
    if (!selectedService) return;
    onSearch(selectedService, isRemote ? '' : zip.trim());
  };

  return (
    <div className="mb-6">
      {showLabel && <h3 className="text-lg font-medium text-gray-900 mb-4">Search Contractors</h3>}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-0 border border-gray-300 rounded-lg bg-white">
          {/* Service Field */}
          <div className="relative flex-1 border-b sm:border-b-0 sm:border-r border-gray-300 rounded-t-lg sm:rounded-t-none sm:rounded-l-lg">
            <div className="w-full px-3 py-3 flex items-center space-x-2">
              <Home className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
                  className="w-full text-sm text-gray-900 placeholder-gray-500 border-none outline-none focus:ring-0 p-0 bg-transparent"
                />
                {showServiceList && serviceQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-30">
                    {filteredServices.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-500">No services match "{serviceQuery.trim()}".</p>
                    ) : (
                      filteredServices.map((s, index) => (
                        <button
                          type="button"
                          key={s.slug}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onClick={() => selectService(s)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm ${
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
          <div className="relative flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-300" style={{ width: '130px' }}>
            <div className="px-3 py-3">
              <div className="flex items-center space-x-2">
                <MapPin className={`h-4 w-4 flex-shrink-0 ${isRemote ? 'text-gray-300' : 'text-gray-400'}`} />
                <input
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
                  className={`w-full text-sm border-none outline-none focus:ring-0 p-0 bg-transparent ${
                    isRemote ? 'text-gray-300 placeholder-gray-300 cursor-not-allowed' : 'text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex-shrink-0 rounded-b-lg sm:rounded-b-none sm:rounded-r-lg overflow-hidden" style={{ minWidth: '60px' }}>
            <button
              type="button"
              onClick={handleSearch}
              disabled={!selectedService || (!isRemote && !zip.trim())}
              title={!selectedService ? 'Select a service to continue' : (!isRemote && !zip.trim()) ? 'Enter a zipcode to find local contractors' : 'Search'}
              className="w-full h-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center px-4 py-3"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          Search for contractors by service — add a zipcode for local results
        </p>
      </div>
    </div>
  );
};
