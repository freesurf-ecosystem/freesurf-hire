export interface Contractor {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  bio?: string;
  specialties: string[];
  investment_types: string[];
  location_preferences: {
    states: string[];
    regions: string[];
  };
  minimum_deal_size?: number;
  maximum_deal_size?: number;
  preferred_contact_method: 'phone' | 'email' | 'form';
  rating?: number;
  reviews_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
  payment_method_id?: string;
  subscription_status?: string;
  profile_image_url?: string;
  googleBusinessUrl?: string;
  reviews?: GoogleReview[];
  admin_paused?: boolean;
  balance_due?: number;
  auto_paused_reason?: string;
  auto_paused_at?: string;
  last_balance_payment_attempt?: string;
  last_balance_payment_status?: string;
  // Additional properties used in components
  base_zip_code?: string;
  years_experience?: number;
  yearsExperience?: number;
  avatar?: string;
  reviewCount?: number;
  financingOptions?: string[];
  service_areas?: string[];
  crm_system?: string;
  isActive?: boolean;
  /** Public-view flag: whether the phone may be revealed on demand. */
  showPhone?: boolean;
  /** Optional business address, only rendered when the contractor opted in. */
  businessAddress?: string;
  showBusinessAddress?: boolean;
}

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface Location {
  id: string;
  name: string;
  state: string;
}