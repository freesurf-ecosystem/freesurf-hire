import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: any[];
  formatted_address?: string;
  website?: string;
  formatted_phone_number?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { placeId } = await req.json();
    
    if (!placeId) {
      return new Response(
        JSON.stringify({ error: 'Place ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get Google Places API key from environment
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      console.error('❌ Google Places API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Google Places API key not configured',
          details: 'Please add GOOGLE_PLACES_API_KEY to Supabase secrets'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('🔍 Fetching Google Place details for place ID:', placeId);
    
    // Use the new Places API (New) format
    const searchUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    
    console.log('🌐 Making API request to Google Places API');
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews,formattedAddress,websiteUri,nationalPhoneNumber'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Places API HTTP error:', response.status, errorText);
      
      let errorMessage = `HTTP ${response.status}: ${errorText}`;
      
      if (response.status === 403) {
        errorMessage = 'API key access denied. Please check: 1) Places API (New) is enabled, 2) Billing is enabled, 3) API key has proper permissions.';
      } else if (response.status === 404) {
        errorMessage = 'Place not found. Please verify the Google Business Profile URL is correct.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request format or place ID. Please check the Google Business Profile URL.';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorText
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const data = await response.json();
    
    console.log('📡 Google Places API (New) response received');
    
    if (data) {
      console.log('✅ Successfully fetched place details:', {
        name: data.displayName?.text,
        rating: data.rating,
        reviewCount: data.userRatingCount,
        reviewsLength: data.reviews?.length
      });
      
      // Transform new API format to match our expected format
      const transformedData = {
        place_id: data.id,
        name: data.displayName?.text || '',
        rating: data.rating || 0,
        user_ratings_total: data.userRatingCount || 0,
        reviews: (data.reviews || []).map((review: any) => ({
          author_name: review.authorAttribution?.displayName || review.author_name || 'Anonymous',
          rating: review.rating || 0,
          text: review.text?.text || review.originalText?.text || review.text || 'No review text available',
          relative_time_description: review.relativePublishTimeDescription || review.relative_time_description || 'Recently',
          time: review.publishTime ? new Date(review.publishTime).getTime() / 1000 : Date.now() / 1000
        })),
        formatted_address: data.formattedAddress || '',
        website: data.websiteUri || '',
        formatted_phone_number: data.nationalPhoneNumber || ''
      };
      
      return new Response(
        JSON.stringify({
          success: true,
          placeDetails: transformedData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.error('❌ Unexpected response format from Google Places API (New)');
      
      return new Response(
        JSON.stringify({ 
          error: 'Unexpected response format from Google Places API (New)',
          details: 'The API response format was not as expected'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
  } catch (error: any) {
    console.error('❌ Error in google-places function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});