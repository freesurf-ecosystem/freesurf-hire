// Google Reviews utility functions for fetching and updating contractor reviews

import { supabase } from '../lib/supabase';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from '../lib/supabaseEnv';

// Validate and format website URL
export const validateAndFormatWebsiteUrl = (url: string): { isValid: boolean; formattedUrl?: string; error?: string } => {
  if (!url.trim()) {
    return { isValid: true }; // Empty URL is valid (optional field)
  }

  try {
    // Add https:// if no protocol is specified
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    // Validate URL format
    const urlObj = new URL(formattedUrl);
    
    // Basic validation
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return { isValid: false, error: 'Invalid website URL format' };
    }

    return { isValid: true, formattedUrl };
  } catch (error) {
    return { isValid: false, error: 'Invalid website URL format' };
  }
};

// Validate Google Business URL
export const validateGoogleBusinessUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url.trim()) {
    return { isValid: true }; // Empty URL is valid (optional field)
  }

  try {
    const urlObj = new URL(url.trim());
    
    // Check if it's a Google-related URL
    const validDomains = [
      'business.google.com',
      'www.google.com',
      'google.com',
      'maps.google.com',
      'goo.gl'
    ];
    
    const isValidDomain = validDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
    
    if (!isValidDomain) {
      return { 
        isValid: false, 
        error: 'Please enter a valid Google Business or Google Maps URL' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// Extract Place ID from various Google URL formats
export const extractPlaceIdFromUrl = (url: string): string | null => {
  if (!url) return null;

  console.log('🔍 Extracting Place ID from URL:', url);

  // Method 1: Look for ChIJ format (most reliable for new API)
  const chijMatch = url.match(/ChIJ[a-zA-Z0-9_-]+/);
  if (chijMatch) {
    console.log('✅ Found ChIJ Place ID:', chijMatch[0]);
    return chijMatch[0];
  }

  // Method 2: Look for /g/ format and extract the ID
  const gMatch = url.match(/\/g\/([a-zA-Z0-9_-]+)/);
  if (gMatch) {
    console.log('✅ Found g/ Place ID:', gMatch[1]);
    return gMatch[1];
  }

  // Method 3: Look for hex format (legacy, less reliable)
  const hexMatch = url.match(/0x[a-fA-F0-9]+:0x[a-fA-F0-9]+/);
  if (hexMatch) {
    console.log('⚠️ Found hex format Place ID (may not work with new API):', hexMatch[0]);
    return hexMatch[0];
  }

  // Method 4: Look for place_id parameter
  const placeIdMatch = url.match(/place_id=([a-zA-Z0-9_-]+)/);
  if (placeIdMatch) {
    console.log('✅ Found place_id parameter:', placeIdMatch[1]);
    return placeIdMatch[1];
  }

  console.log('❌ No Place ID found in URL');
  return null;
};

// Update contractor with Google reviews data using Place ID
export const updateContractorWithGoogleReviews = async (
  contractorId: string, 
  placeIdOrUrl: string
): Promise<{ rating: number; reviewCount: number } | null> => {
  try {
    console.log('🔍 Starting Google reviews update for contractor:', contractorId);
    console.log('🔍 Input (Place ID or URL):', placeIdOrUrl);

    let placeId: string;

    // Check if input is already a Place ID (doesn't contain http)
    if (!placeIdOrUrl.includes('http')) {
      placeId = placeIdOrUrl.trim();
      console.log('🔍 Input appears to be a Place ID:', placeId);
    } else {
      // Extract Place ID from URL
      const extractedId = extractPlaceIdFromUrl(placeIdOrUrl);
      if (!extractedId) {
        console.error('❌ Could not extract Place ID from URL');
        return null;
      }
      placeId = extractedId;
      console.log('🔍 Extracted Place ID from URL:', placeId);
    }

    console.log('🌐 Calling Google Places API with Place ID:', placeId);

    // Call our Google Places edge function
    const supabaseUrl = SUPABASE_URL;
    const supabaseAnonKey = SUPABASE_PUBLIC_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/google-places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ placeId }),
    });

    console.log('📡 Google Places API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Places API error:', errorText);
      return null;
    }

    const result = await response.json();
    console.log('📡 Google Places API result:', result);

    if (result.error) {
      console.error('❌ Google Places API returned error:', result.error);
      return null;
    }

    if (!result.success || !result.placeDetails) {
      console.error('❌ Invalid response format from Google Places API');
      return null;
    }

    const placeDetails = result.placeDetails;
    console.log('✅ Place details received:', {
      name: placeDetails.name,
      rating: placeDetails.rating,
      reviewCount: placeDetails.user_ratings_total
    });

    // Update contractor record with Google data
    const updateData = {
      rating: placeDetails.rating || 0,
      review_count: placeDetails.user_ratings_total || 0,
      google_place_id: placeId,
      google_reviews: placeDetails.reviews || []
    };

    console.log('💾 Updating contractor record with:', updateData);

    const { error: updateError } = await supabase
      .from('hire_contractor_profiles')
      .update(updateData)
      .eq('id', contractorId);

    if (updateError) {
      console.error('❌ Error updating contractor record:', updateError);
      return null;
    }

    console.log('✅ Contractor record updated successfully');

    return {
      rating: placeDetails.rating || 0,
      reviewCount: placeDetails.user_ratings_total || 0
    };

  } catch (error) {
    console.error('❌ Error in updateContractorWithGoogleReviews:', error);
    return null;
  }
};