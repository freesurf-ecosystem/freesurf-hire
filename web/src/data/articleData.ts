// Article metadata for the FreeSurf blog / resources system.
//
// The previous (real-estate) content has been cleared. Keep the shapes below as
// the template for future contractor-network articles. Add entries to
// `customArticles` and (optionally) group them in `articleClusters`.
//
// Example entry:
// {
//   id: 'how-to-choose-a-plumber',
//   title: 'How to Choose a Plumber',
//   slug: 'how-to-choose-a-plumber',
//   excerpt: 'A short summary shown in listings and meta description.',
//   category: 'Guides',
//   tags: ['plumbing', 'hiring'],
//   readTime: '6 min read',
//   path: '/resources/how-to-choose-a-plumber',
//   isSellerSpecific: false,
//   isBuyerSpecific: false,
// }

export interface ArticleMetadata {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: string;
  path: string;
  isSellerSpecific: boolean;
  isBuyerSpecific: boolean;
}

export interface ArticleCluster {
  id: string;
  title: string;
  description: string;
  audience: 'seller' | 'buyer';
  articleIds: string[];
}

export const customArticles: ArticleMetadata[] = [
  // Add contractor-network articles here.
];

export const articleClusters: ArticleCluster[] = [
  // Add clusters here, e.g. { id: 'home-services', title: 'Home Services', ... }.
];

export function getCustomArticleMetadata(id: string): ArticleMetadata {
  const article = customArticles.find((a) => a.id === id);
  if (!article) {
    // Return a minimal placeholder so callers can render gracefully.
    return {
      id,
      title: '',
      slug: id,
      excerpt: '',
      category: '',
      tags: [],
      readTime: '',
      path: '',
      isSellerSpecific: false,
      isBuyerSpecific: false,
    };
  }
  return article;
}

export function getCustomArticleMetadataBySlug(slug: string): ArticleMetadata | undefined {
  return customArticles.find((a) => a.slug === slug);
}

export function getArticleClusterArticles(clusterId: string): ArticleMetadata[] {
  const cluster = articleClusters.find((c) => c.id === clusterId);
  if (!cluster) return [];
  return cluster.articleIds
    .map((id) => customArticles.find((a) => a.id === id))
    .filter((a): a is ArticleMetadata => Boolean(a));
}

export function getRelatedCustomArticles(articleIdOrSlug: string, limit = 4): ArticleMetadata[] {
  return customArticles
    .filter((a) => a.id !== articleIdOrSlug && a.slug !== articleIdOrSlug)
    .slice(0, limit);
}
