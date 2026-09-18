// FAQ / blog content for FreeSurf.
//
// The previous (real-estate) content has been cleared. Keep the shape below as the
// template for future contractor-network FAQ / blog content. Add entries to
// `faqQuestions`.
//
// Example entry:
// {
//   question: 'How much does a plumber cost?',
//   answer: 'Short answer (<=300 words) shown in FAQ sections on landing pages.',
//   blogContent: 'Long markdown answer used for the individual blog post.',
//   isSellerSpecific: false, // "seller" ~ customer/client
//   isBuyerSpecific: false,  // "buyer" ~ contractor
// }

export interface FAQItem {
  question: string;
  answer: string; // Short version (300 words max) - for FAQ sections on landing pages
  blogContent: string; // Long version (full detailed answer) - for individual blog posts
  isHomeSpecific?: boolean;
  isLandSpecific?: boolean;
  isCommercialSpecific?: boolean;
  isMobileHomeSpecific?: boolean;
  isSellerSpecific?: boolean; // defaults to true if not specified
  isBuyerSpecific?: boolean;
}

export const faqQuestions: FAQItem[] = [
  // Add contractor-network FAQ / blog entries here.
];
