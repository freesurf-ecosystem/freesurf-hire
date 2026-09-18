import React, { useState } from 'react';
import { Globe, RefreshCw, Star, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { updateContractorWithGoogleReviews } from '../utils/googleReviews';

interface GoogleReviewsManagerProps {
  contractor: any;
  onUpdate: () => void;
}

export default function GoogleReviewsManager({ contractor, onUpdate }: GoogleReviewsManagerProps) {
  const [placeId, setPlaceId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateReviews = async () => {
    if (!placeId.trim()) {
      setError('Please enter a Place ID');
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Admin updating Google reviews for contractor:', contractor.id);
      console.log('🔍 Using Place ID:', placeId);

      const result = await updateContractorWithGoogleReviews(contractor.id, placeId);
      
      if (result) {
        setSuccess(`Reviews updated: ${result.reviewCount} reviews, ${result.rating} rating`);
        setPlaceId(''); // Clear the input
        onUpdate(); // Refresh the contractors list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to fetch Google reviews. Please check the Place ID.');
      }
    } catch (error: any) {
      console.error('Error updating Google reviews:', error);
      setError(`Update failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Current Google Business URL (if available) */}
      {contractor.google_business_url && (
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Google Business URL:</p>
          <a 
            href={contractor.google_business_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Profile
          </a>
        </div>
      )}

      {/* Current Reviews Status */}
      <div className="text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <Star className="h-3 w-3 text-yellow-500" />
          <span>{contractor.rating || 0} rating</span>
          <span>•</span>
          <span>{contractor.review_count || 0} reviews</span>
        </div>
        {contractor.google_place_id && (
          <p className="text-gray-500 mt-1">Place ID: {contractor.google_place_id}</p>
        )}
      </div>

      {/* Manual Place ID Input */}
      <div className="space-y-2">
        <input
          type="text"
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
          placeholder="Enter Google Place ID (e.g., ChIJ...)"
          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        />
        
        <button
          onClick={handleUpdateReviews}
          disabled={isUpdating || !placeId.trim()}
          className="w-full flex items-center justify-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              <span>Update Reviews</span>
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-start space-x-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start space-x-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
        <p className="font-medium mb-1">How to find Place ID:</p>
        <p>1. Use <a href="https://localranking.com/google-placeid-finder" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">this tool</a></p>
        <p>2. Or extract from Google Business URL</p>
      </div>
    </div>
  );
}