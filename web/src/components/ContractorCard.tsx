import { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, DollarSign, ChevronDown, ChevronUp, Globe, Phone, ExternalLink } from 'lucide-react';
import { Contractor } from '../types';
import { generateContractorSchema, injectSchema, removeSchema } from '../utils/schemaGenerator';
import TermsGate from './TermsGate';

interface ContractorCardProps {
  contractor: Contractor;
  onContactClick: (contractor: Contractor) => void;
}

export default function ContractorCard({ contractor }: ContractorCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showSpecialties, setShowSpecialties] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [isRevealingPhone, setIsRevealingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
  const serviceAreas = contractor.service_areas || contractor.location_preferences?.states || [];
  const visibleSpecialties = showSpecialties ? contractor.specialties : contractor.specialties.slice(0, 4);

  // Inject contractor schema when card is rendered
  useEffect(() => {
    const schemaId = `schema-contractor-${contractor.id}`;
    const schema = generateContractorSchema(contractor);
    injectSchema(schema, schemaId);

    // Cleanup function to remove schema when card unmounts
    return () => {
      removeSchema(schemaId);
    };
  }, [contractor]);
  
  const handleContactEvent = (contactType: 'form' | 'phone' | 'website' | 'google_business', targetUrl?: string) => {
    console.log('🚀 === FRONTEND CONTACT EVENT TRIGGERED ===')
    console.log('📋 Contact details:', {
      contactType,
      contractorId: contractor.id,
      contractorCompany: contractor.company,
      targetUrl: targetUrl || 'N/A'
    });

    // The provider website / phone links below are native anchors
    // (href + target="_blank"), so the browser handles the redirect.
    // We intentionally do NOT call window.open here, which would open a
    // duplicate tab alongside the anchor's default navigation.
    // TODO(future): log an anonymized click event server-side for PPC billing.
  };

  // Normalize a provider website into a clickable URL
  const getWebsiteUrl = (url?: string): string | null => {
    if (!url || !url.trim()) return null;
    const trimmed = url.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const websiteUrl = getWebsiteUrl(contractor.website);

  // The number is not in the public payload, so fetch it on demand.
  const revealPhone = async () => {
    setIsRevealingPhone(true);
    setPhoneError('');
    try {
      const res = await fetch(`/api/contractor-phone/?contractorId=${contractor.id}`);
      const data = await res.json();
      if (!res.ok || !data?.phone) {
        setPhoneError(data?.error || 'Phone number unavailable');
        return;
      }
      setRevealedPhone(data.phone);
    } catch {
      setPhoneError('Could not load phone number');
    } finally {
      setIsRevealingPhone(false);
    }
  };

  // Format reviewer name to be anonymous (e.g., "John Doe" -> "John D.")
  const formatAnonymousName = (name: string): string => {
    if (!name || typeof name !== 'string') return 'Anonymous';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase() + '.';
    }
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  };

  // Truncate review text to 200 characters
  const truncateReviewText = (text: string, limit: number = 200, isExpanded: boolean = false): { truncated: string; isTruncated: boolean } => {
    // Handle non-string values
    const textString = String(text || '');
    if (!textString.trim()) {
      return { truncated: 'No review text available', isTruncated: false };
    }
    
    // If expanded, return full text
    if (isExpanded) {
      return { truncated: textString, isTruncated: false };
    }
    
    if (textString.length <= limit) {
      return { truncated: textString, isTruncated: false };
    }
    return { truncated: textString.substring(0, limit) + '...', isTruncated: true };
  };

  // Toggle expanded state for a specific review
  const toggleReviewExpansion = (reviewIndex: number) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewIndex)) {
      newExpanded.delete(reviewIndex);
    } else {
      newExpanded.add(reviewIndex);
    }
    setExpandedReviews(newExpanded);
  };
  // Render star rating for individual reviews
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        {contractor.reviewCount > 0 && contractor.reviews && contractor.reviews.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowReviews(!showReviews)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span>View Reviews ({contractor.reviews.length})</span>
              {showReviews ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        <div className="flex items-start space-x-4">
          {contractor.avatar && contractor.avatar.trim() !== '' && (
            <img
              src={contractor.avatar}
              alt={`${contractor.company} logo`}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate text-left">{contractor.company}</h3>
            {contractor.reviewCount > 0 && (
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {contractor.rating} ({contractor.reviewCount} {contractor.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description with expand/collapse */}
        <div className="mt-4">
          {contractor.bio ? (
            <>
              <p className={`text-gray-600 text-sm text-left ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}>
                {contractor.bio}
              </p>
              {contractor.bio.length > 150 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
                >
                  {isDescriptionExpanded ? 'Show Less' : '... Read More'}
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm italic">No description provided</p>
          )}
        </div>

        <div className="mt-4">
          {typeof contractor.yearsExperience === 'number' && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{contractor.yearsExperience} years experience</span>
            </div>
          )}
          
          {contractor.base_zip_code && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Based out of: {contractor.base_zip_code}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {serviceAreas.length > 0 ? serviceAreas.join(', ') : 'No service area set'}
            </span>
          </div>
        </div>

        {/* Contact info. Website is a public link; the phone number is NOT in
            the public payload, so it is fetched one at a time on demand. The
            whole block sits behind the Terms clickwrap so acceptance is on
            record. */}
        {(websiteUrl || contractor.showPhone) && (
          <TermsGate context="contractor_card_contact" contractorId={contractor.id}>
            <div className="mb-4 border-t border-gray-100 pt-3">
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleContactEvent('website', websiteUrl)}
                  className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors mb-2"
                >
                  <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{contractor.website}</span>
                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 text-gray-400" />
                </a>
              )}

              {contractor.showPhone && (
                revealedPhone ? (
                  <a
                    href={`tel:${revealedPhone.replace(/[^\d+]/g, '')}`}
                    onClick={() => handleContactEvent('phone')}
                    className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{revealedPhone}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={revealPhone}
                    disabled={isRevealingPhone}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                  >
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{isRevealingPhone ? 'Loading number…' : 'Show phone number'}</span>
                  </button>
                )
              )}

              {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
            </div>
          </TermsGate>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Services</h4>
            {contractor.specialties.length > 4 && (
              <button
                onClick={() => setShowSpecialties(!showSpecialties)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span>{showSpecialties ? 'Hide' : 'Show'}</span>
                {showSpecialties ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {visibleSpecialties.map((specialty) => (
              <span
                key={specialty}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Engagement</h4>
          <div className="flex flex-wrap gap-1">
            {contractor.financingOptions && contractor.financingOptions.length > 0 ? contractor.financingOptions.map((option) => (
              <span
                key={option}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                {option}
              </span>
            )) : (
              <span className="text-xs text-gray-500 italic">Engagement types not specified</span>
            )}
          </div>
        </div>


        <div>
          <button
            type="button"
            onClick={() => onContactClick(contractor)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Request a quote
          </button>
        </div>

        {/* Reviews Dropdown Content - Only show if reviewer count > 0 */}
        {contractor.reviewCount > 0 && showReviews && contractor.reviews && contractor.reviews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Reviews</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {contractor.reviews.slice(0, 10).map((review, index) => {
                console.log('🔍 Processing review:', { 
                  index, 
                  review, 
                  authorName: review.author_name,
                  text: review.text,
                  rating: review.rating,
                  reviewKeys: Object.keys(review)
                });
                
                const isExpanded = expandedReviews.has(index);
                const { truncated, isTruncated } = truncateReviewText(review.text, 200, isExpanded);
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatAnonymousName(review.author_name || review.authorName || 'Anonymous User')}
                        </span>
                        {renderStarRating(review.rating)}
                        <span className="text-xs text-gray-500">(from Google)</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {review.relative_time_description || review.relativeTimeDescription || 'Recently'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {truncated}
                      {!isExpanded && isTruncated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReviewExpansion(index);
                          }}
                          className="text-blue-600 ml-1 hover:text-blue-800 transition-colors"
                        >
                          Read more
                        </button>
                      )}
                      {isExpanded && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReviewExpansion(index);
                          }}
                          className="text-blue-600 ml-1 hover:text-blue-800 transition-colors"
                        >
                          Show less
                        </button>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
            {contractor.reviews.length > 10 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Showing 10 of {contractor.reviews.length} reviews
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}