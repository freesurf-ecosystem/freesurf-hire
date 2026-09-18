// Re-export all types from their respective files
export * from './contractor';

// Additional common types
export interface US_State {
  name: string;
  abbr: string;
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