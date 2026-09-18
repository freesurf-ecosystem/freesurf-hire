import React, { useState } from 'react';
import { BookOpen, ArrowRight, Search } from 'lucide-react';
import Footer from '../../Layout/Footer';
import { faqQuestions } from '../../../data/faqData';
import { articleClusters, customArticles, getArticleClusterArticles } from '../../../data/articleData';
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  injectSchema,
  removeSchema,
} from '../../../utils/schemaGenerator';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/{propertytype}/g, 'property')
    .replace(/{location}/g, '')
    .replace(/{state}/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

function categorizePost(faq: typeof faqQuestions[0]): string {
  if (faq.isHomeSpecific) return 'Single-Family Homes';
  if (faq.isMobileHomeSpecific) return 'Mobile Homes';
  if (faq.isLandSpecific) return 'Vacant Land';
  if (faq.isCommercialSpecific) return 'Commercial Properties';
  return 'General';
}

function getCardActionLabel(title: string): string {
  if (/\bvs\b|\bvs\.\b/i.test(title)) {
    return 'See Comparison';
  }

  if (/^review of /i.test(title)) {
    return 'Read Review';
  }

  if (/^best /i.test(title) || /compare/i.test(title)) {
    return 'Compare Options';
  }

  return 'Explore Guide';
}

export default function ResourcesPage() {
  const pageUrl = 'https://freesurf.tools/resources';
  const pageDescription = 'Guides and insights for clients and contractors — hiring, pricing, and getting work done.';

  const [sellerSearchTerm, setSellerSearchTerm] = useState('');
  const [sellerSelectedCategory, setSellerSelectedCategory] = useState<string>('All');
  const [showAllSellerArticles, setShowAllSellerArticles] = useState(false);

  const [buyerSearchTerm, setBuyerSearchTerm] = useState('');
  const [buyerSelectedCategory, setBuyerSelectedCategory] = useState<string>('All');
  const [showAllBuyerArticles, setShowAllBuyerArticles] = useState(false);

  React.useEffect(() => {
    document.title = 'Resources - FreeSurf';
  }, []);

  React.useEffect(() => {
    const webPageSchema = generateWebPageSchema({
      name: 'Resources - FreeSurf',
      description: pageDescription,
      url: pageUrl,
      breadcrumbs: [
        { name: 'Home', url: 'https://freesurf.tools/' },
        { name: 'Resources', url: pageUrl },
      ],
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://freesurf.tools/' },
      { name: 'Resources', url: pageUrl },
    ]);

    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Resources - FreeSurf',
      url: pageUrl,
      description: pageDescription,
      about: [
        'hiring contractors',
        'cash home buyers',
        'contractor lead generation',
        'service guides',
      ],
    };

    injectSchema(webPageSchema, 'resources-webpage-schema');
    injectSchema(breadcrumbSchema, 'resources-breadcrumb-schema');
    injectSchema(itemListSchema, 'resources-collection-schema');

    return () => {
      removeSchema('resources-webpage-schema');
      removeSchema('resources-breadcrumb-schema');
      removeSchema('resources-collection-schema');
    };
  }, [pageDescription, pageUrl]);

  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  const propertyTypes = [
    'single family home',
    'residential vacant land',
    'mobile home',
    'commercial property'
  ];

  const faqBlogPosts = faqQuestions.flatMap((faq) => {
    if (faq.question.includes('{propertytype}')) {
      return propertyTypes.map(propertyType => {
        const title = faq.question
          .replace(/{propertytype}/g, propertyType)
          .replace(/\s+in\s+\{location\},\s*\{state\}/gi, '')
          .replace(/\s+in\s+\{location\}/gi, '')
          .replace(/\s+in\s+\{state\}/gi, '')
          .replace(/\s+in\s+the\s+\{location\}\s+area/gi, '');
        const slug = generateSlug(title);
        const excerpt = faq.blogContent.replace(/{propertytype}/g, propertyType).split(/\s+/).slice(0, 30).join(' ') + '...';
        const category = categorizePost(faq);
        const readTime = estimateReadTime(faq.blogContent);

        return {
          id: slug,
          title,
          slug,
          excerpt,
          category,
          readTime,
          path: `/resources/${slug}`,
          isSellerSpecific: faq.isSellerSpecific !== false,
          isBuyerSpecific: faq.isBuyerSpecific === true,
        };
      });
    }

    const title = faq.question
      .replace(/\s+in\s+\{location\},\s*\{state\}/gi, '')
      .replace(/\s+in\s+\{location\}/gi, '')
      .replace(/\s+in\s+\{state\}/gi, '')
      .replace(/\s+in\s+the\s+\{location\}\s+area/gi, '');
    const slug = generateSlug(title);
    const excerpt = faq.blogContent.split(/\s+/).slice(0, 30).join(' ') + '...';
    const category = categorizePost(faq);
    const readTime = estimateReadTime(faq.blogContent);

    return {
      id: slug,
      title,
      slug,
      excerpt,
      category,
      readTime,
      path: `/resources/${slug}`,
      isSellerSpecific: faq.isSellerSpecific !== false,
      isBuyerSpecific: faq.isBuyerSpecific === true,
    };
  });

  const allBlogPosts = [...customArticles, ...faqBlogPosts];
  const platformUpdates = customArticles.filter((post) => post.category === 'Platform Updates');

  const sellerPosts = allBlogPosts.filter(post => post.isSellerSpecific !== false);
  const buyerPosts = allBlogPosts.filter(post => post.isBuyerSpecific === true);

  const sellerCategories = ['All', ...Array.from(new Set(sellerPosts.map(post => post.category)))];
  const buyerCategories = ['All', ...Array.from(new Set(buyerPosts.map(post => post.category)))];

  const filterPosts = (posts: typeof allBlogPosts, searchTerm: string, selectedCategory: string) => {
    return posts.filter(post => {
      const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter((word: string) => word.length > 0);

      if (searchWords.length === 0) {
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        return matchesCategory;
      }

      const titleLower = post.title.toLowerCase();
      const excerptLower = post.excerpt.toLowerCase();
      const matchesSearch = searchWords.every((word: string) =>
        titleLower.includes(word) || excerptLower.includes(word)
      );

      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredSellerPosts = filterPosts(sellerPosts, sellerSearchTerm, sellerSelectedCategory);
  const filteredBuyerPosts = filterPosts(buyerPosts, buyerSearchTerm, buyerSelectedCategory);

  const buyerClusterEntries = articleClusters
    .filter((cluster) => cluster.audience === 'buyer')
    .map((cluster) => ({
      ...cluster,
      articles: getArticleClusterArticles(cluster.id),
    }))
    .filter((cluster) => cluster.articles.length > 0);

  const sellerClusterEntries = articleClusters
    .filter((cluster) => cluster.audience === 'seller')
    .map((cluster) => ({
      ...cluster,
      articles: getArticleClusterArticles(cluster.id),
    }))
    .filter((cluster) => cluster.articles.length > 0);

  const sellerPostsToDisplay = showAllSellerArticles ? filteredSellerPosts : filteredSellerPosts.slice(0, 9);
  const buyerPostsToDisplay = showAllBuyerArticles ? filteredBuyerPosts : filteredBuyerPosts.slice(0, 9);

  const hasMoreSellerPosts = filteredSellerPosts.length > 9;
  const hasMoreBuyerPosts = filteredBuyerPosts.length > 9;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Resources & Guides
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Guides and insights for clients and contractors — hiring, pricing, and getting work done.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-16 rounded-2xl border border-blue-100 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 p-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Featured Topics</p>
            <h2 className="mt-3 text-3xl font-bold">Browse by Goal</h2>
            <p className="mt-3 text-base text-blue-100">
              These sections group the library by what you're trying to accomplish, so the next step is clear.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
            <section>
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">Client Paths</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Client Resources</h3>
                <p className="mt-2 text-sm text-blue-100">
                  Move from hiring questions into comparisons, how-tos, and contractor-protection topics.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {sellerClusterEntries.map((cluster) => (
                  <section key={cluster.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <h4 className="text-xl font-semibold text-white">{cluster.title}</h4>
                    <p className="mt-2 text-sm text-blue-100">{cluster.description}</p>

                    <ul className="mt-5 space-y-3">
                      {cluster.articles.map((article) => (
                        <li key={article.id}>
                          <a
                            href={article.path}
                            className="group inline-flex items-start text-left text-blue-50 transition-colors hover:text-white"
                          >
                            <span className="mr-3 mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-300 transition-colors group-hover:bg-white" />
                            <span>
                              <span className="block font-medium">{article.title}</span>
                              <span className="block text-sm text-blue-200 group-hover:text-blue-50">{article.category}</span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Contractor Paths</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Contractor Tool Clusters</h3>
                <p className="mt-2 text-sm text-blue-100">
                  Grouped by winning clients, operations, and growth.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {buyerClusterEntries.map((cluster) => (
                  <section key={cluster.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <h4 className="text-xl font-semibold text-white">{cluster.title}</h4>
                    <p className="mt-2 text-sm text-blue-100">{cluster.description}</p>

                    <ul className="mt-5 space-y-3">
                      {cluster.articles.map((article) => (
                        <li key={article.id}>
                          <a
                            href={article.path}
                            className="group inline-flex items-start text-left text-blue-50 transition-colors hover:text-white"
                          >
                            <span className="mr-3 mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300 transition-colors group-hover:bg-white" />
                            <span>
                              <span className="block font-medium">{article.title}</span>
                              <span className="block text-sm text-blue-200 group-hover:text-blue-50">{article.category}</span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          </div>
        </div>

        {platformUpdates.length > 0 && (
          <div id="platform-updates" className="mb-16 scroll-mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Platform Updates</h2>
                <p className="text-gray-600 mt-2">Written notices about policy, product, and operational changes that affect how the platform works.</p>
              </div>
              <span className="text-sm font-medium text-gray-500">{platformUpdates.length} notice{platformUpdates.length === 1 ? '' : 's'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformUpdates.map((post) => (
                <a
                  key={post.id}
                  href={post.path}
                  className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                      Read Update
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

          <div id="client-resources" className="mb-16 scroll-mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Client Resources</h2>
              <p className="text-gray-600 mt-2">Guides to help you hire and work with contractors</p>
            </div>
            <span className="text-sm font-medium text-gray-500">{filteredSellerPosts.length} articles</span>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search client articles..."
                value={sellerSearchTerm}
                onChange={(e) => setSellerSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {sellerCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSellerSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sellerSelectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerPostsToDisplay.map((post) => (
              <a
                key={post.id}
                href={post.path}
                className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                    {getCardActionLabel(post.title)}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                </div>
              </a>
            ))}
          </div>

          {hasMoreSellerPosts && !showAllSellerArticles && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllSellerArticles(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show More Articles ({filteredSellerPosts.length - 9} more)
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          )}

          {filteredSellerPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No client articles found matching your search.</p>
            </div>
          )}
        </div>

          <div id="contractor-resources" className="mb-16 scroll-mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Contractor Resources</h2>
              <p className="text-gray-600 mt-2">Guides for contractors and freelancers</p>
            </div>
            <span className="text-sm font-medium text-gray-500">{filteredBuyerPosts.length} articles</span>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search contractor articles..."
                value={buyerSearchTerm}
                onChange={(e) => setBuyerSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {buyerCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setBuyerSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    buyerSelectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buyerPostsToDisplay.map((post) => (
              <a
                key={post.id}
                href={post.path}
                className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                    {getCardActionLabel(post.title)}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                </div>
              </a>
            ))}
          </div>

          {hasMoreBuyerPosts && !showAllBuyerArticles && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllBuyerArticles(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show More Articles ({filteredBuyerPosts.length - 9} more)
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          )}

          {filteredBuyerPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No contractor articles found matching your search.</p>
            </div>
          )}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Stay Informed</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get notified when we publish new guides and resources.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}