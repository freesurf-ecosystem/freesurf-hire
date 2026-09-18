// FAQ cluster metadata (topic hubs) for FreeSurf.
//
// The previous (real-estate) clusters have been cleared. Keep the shape below as the
// template for future contractor-network topic clusters. Add clusters to `faqClusters`.
//
// Example cluster:
// {
//   intentId: 'hire-decision',
//   journeyStage: 'awareness',
//   audience: 'buyer', // 'buyer' ~ contractor
//   primaryHubSlug: 'how-to-hire-a-contractor',
//   relatedQuestionSlugs: ['how-much-does-a-plumber-cost'],
//   relatedArticleIds: ['how-to-choose-a-plumber'],
// }

export interface FaqClusterMetadata {
  intentId: string;
  journeyStage: string;
  audience: 'seller' | 'buyer';
  primaryHubSlug: string;
  relatedQuestionSlugs: string[];
  relatedArticleIds: string[];
}

export const faqClusters: FaqClusterMetadata[] = [
  // Add contractor-network clusters here.
];

export function generateFaqClusterSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getFaqClusterMetadataBySlug(slug: string): FaqClusterMetadata | undefined {
  return faqClusters.find((c) => c.primaryHubSlug === slug);
}
