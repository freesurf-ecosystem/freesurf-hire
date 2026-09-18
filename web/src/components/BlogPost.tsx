import { useEffect, useState } from 'react';
import { useNavigate } from '../lib/navigation-compat';
import { ArrowLeft, Clock, Tag, Calendar } from 'lucide-react';
import Footer from './Layout/Footer';
import ResourceBreadcrumbs from './resources/components/ResourceBreadcrumbs';
import { faqQuestions } from '../data/faqData';
import { customArticles, getCustomArticleMetadataBySlug, getRelatedCustomArticles } from '../data/articleData';
import { generateFaqClusterSlug, getFaqClusterMetadataBySlug } from '../data/faqClusterData';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  injectSchema,
  removeSchema,
} from '../utils/schemaGenerator';

function buildFaqRouteSlug(question: string, propertyType: string): string {
  if (question.includes('{propertytype}')) {
    return generateFaqClusterSlug(question.replace(/{propertytype}/g, propertyType));
  }

  return generateFaqClusterSlug(question);
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

function buildExcerpt(text: string): string {
  return `${text.split(/\s+/).slice(0, 30).join(' ')}...`;
}

function stripGenericLocationTokens(text: string): string {
  return text
    .replace(/\{location\}/g, '')
    .replace(/\{state\}/g, '')
    .replace(/\s+in\s+\{location\},\s*\{state\}/gi, '')
    .replace(/\s+in\s+\{location\}/gi, '')
    .replace(/\s+in\s+\{state\}/gi, '')
    .replace(/\s+in\s+the\s+\{location\}\s+area/gi, '')
    .replace(/\s+,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([?.!,])/g, '$1')
    .trim();
}

interface BlogPostProps {
  slug: string;
}

export default function BlogPost({ slug }: BlogPostProps) {
  const navigate = useNavigate();
  const [customContent, setCustomContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Property types that can be in URLs (consolidated list)
  const propertyTypeVariants = [
    'single family home',
    'residential vacant land',
    'mobile home',
    'commercial property'
  ];

  // Check if this is a custom article
  const customArticle = getCustomArticleMetadataBySlug(slug);

  // Load custom article content from markdown file
  useEffect(() => {
    if (customArticle) {
      fetch(`/resources/${customArticle.slug}.md`)
        .then(res => res.text())
        .then(text => {
          setCustomContent(text);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error loading article:', err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [customArticle]);

  // Find the FAQ that matches this slug
  // Try to match with any property type variant
  const faqPost = faqQuestions.find(faq => {
    // Try matching with all property type variants
    for (const propertyType of propertyTypeVariants) {
      const faqSlug = buildFaqRouteSlug(faq.question, propertyType);
      if (faqSlug === slug) {
        return true;
      }
    }
    return false;
  });

  // Process the post data if found
  let title = '';
  let content = '';
  let category = '';
  let readTime = '';
  let detectedPropertyType = 'property';
  let isCustomArticle = false;

  if (customArticle) {
    // Custom article
    isCustomArticle = true;
    title = customArticle.title;
    content = customContent;
    category = customArticle.category;
    readTime = customArticle.readTime;
  } else if (faqPost) {
    // Detect which property type was used in the URL
    for (const propertyType of propertyTypeVariants) {
      const testSlug = buildFaqRouteSlug(faqPost.question, propertyType);
      if (testSlug === slug) {
        detectedPropertyType = propertyType;
        break;
      }
    }

    // Replace {propertytype} only; remove location tokens since blog posts are generic
    title = stripGenericLocationTokens(
      faqPost.question.replace(/{propertytype}/g, detectedPropertyType),
    );
    
    content = faqPost.blogContent.replace(/{propertytype}/g, detectedPropertyType);
    category = categorizePost(faqPost);
    readTime = estimateReadTime(content);
  }

  // Generate meta description from first 150 characters of content
  const generateMetaDescription = (text: string): string => {
    const plainText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');
    const words = plainText.split(/\s+/).slice(0, 25).join(' ');
    return words.length < plainText.length ? words + '...' : words;
  };

  const pageUrl = `https://freesurf.tools/resources/${slug}`;
  const metaDescription = content ? generateMetaDescription(content) : '';
  const isBuyerResource = customArticle
    ? customArticle.isBuyerSpecific === true
    : faqPost
      ? faqPost.isBuyerSpecific === true
      : false;
  const sectionLabel = isBuyerResource ? 'Contractor Resources' : 'Client Resources';
  const sectionHref = isBuyerResource
    ? '/resources#contractor-resources'
    : '/resources#client-resources';
  const sectionUrl = `https://freesurf.tools${sectionHref}`;
  const relatedCustomArticles = customArticle ? getRelatedCustomArticles(slug, 4) : [];
  const faqClusterMetadata = !customArticle && faqPost
    ? getFaqClusterMetadataBySlug(generateFaqClusterSlug(faqPost.question))
    : undefined;
  const clusterHubArticle = faqClusterMetadata
    ? getCustomArticleMetadataBySlug(faqClusterMetadata.primaryHubSlug)
    : undefined;
  const faqSuggestedArticles = !customArticle && faqPost
    ? (() => {
      const metadataArticles = faqClusterMetadata
        ? faqClusterMetadata.relatedArticleIds
          .map((articleId) => customArticles.find((article) => article.id === articleId))
          .filter((article): article is (typeof customArticles)[number] => Boolean(article))
        : [];

      const fallbackArticles: typeof customArticles = [];

      return [...metadataArticles, ...fallbackArticles]
        .filter((article, index, array) => array.findIndex((candidate) => candidate.id === article.id) === index)
        .filter((article) => article.slug !== clusterHubArticle?.slug)
        .slice(0, 4);
    })()
    : [];
  const relatedFaqArticles = !customArticle && faqPost
    ? (() => {
      const metadataRelatedQuestions = faqClusterMetadata
        ? faqClusterMetadata.relatedQuestionSlugs
          .map((relatedSlug) => faqQuestions.find((faq) => generateFaqClusterSlug(faq.question) === relatedSlug))
          .filter((faq): faq is (typeof faqQuestions)[number] => Boolean(faq) && faq !== faqPost)
        : [];

      const fallbackQuestions = faqQuestions.filter((faq) => categorizePost(faq) === category && faq !== faqPost);

      return [...metadataRelatedQuestions, ...fallbackQuestions]
        .filter((faq, index, array) => array.findIndex((candidate) => candidate.question === faq.question) === index)
        .slice(0, 4);
    })()
    : [];

  // Set page title and meta description
  useEffect(() => {
    if (title && content) {
      if (typeof document !== 'undefined') {
        document.title = title;

        let metaDescriptionTag = document.querySelector('meta[name="description"]');
        if (!metaDescriptionTag) {
          metaDescriptionTag = document.createElement('meta');
          metaDescriptionTag.setAttribute('name', 'description');
          document.head.appendChild(metaDescriptionTag);
        }
        metaDescriptionTag.setAttribute('content', metaDescription);
      }
    }
  }, [title, content, metaDescription]);

  useEffect(() => {
    if (!title || !content || typeof document === 'undefined') {
      return;
    }

    const articleSchema = generateArticleSchema({
      headline: title,
      description: metaDescription,
      datePublished: '2025-10-13',
      dateModified: '2026-03-16',
      articleBody: content,
      url: pageUrl,
      keywords: [category, detectedPropertyType, 'real estate investing', 'cash buyers'],
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://freesurf.tools/' },
      { name: 'Resources', url: 'https://freesurf.tools/resources' },
      { name: sectionLabel, url: sectionUrl },
      { name: title, url: pageUrl },
    ]);

    injectSchema(articleSchema, 'article-schema');
    injectSchema(breadcrumbSchema, 'breadcrumb-schema');

    return () => {
      removeSchema('article-schema');
      removeSchema('breadcrumb-schema');
    };
  }, [title, content, metaDescription, category, detectedPropertyType, pageUrl, sectionLabel, sectionUrl]);

  if (!faqPost && !customArticle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <a
            href="/resources"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!faqPost && !customArticle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <a
            href="/resources"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </a>
        </div>
      </div>
    );
  }



  const publishDate = 'October 13, 2025';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ResourceBreadcrumbs
            sectionLabel={sectionLabel}
            sectionHref={sectionHref}
            currentLabel={title}
          />
          <a
            href="/resources"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </a>

          <div className="flex items-center gap-4 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Tag className="h-3 w-3 mr-1" />
              {category}
            </span>
            <span className="inline-flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {readTime}
            </span>
            <span className="inline-flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              {publishDate}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Style H2 headings
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                    {children}
                  </h2>
                ),
                // Style paragraphs
                p: ({ children }) => (
                  <p className="mb-6 text-gray-700 leading-relaxed">
                    {children}
                  </p>
                ),
                // Style links
                a: ({ href, children }) => {
                  const isInternalLink = Boolean(href && href.startsWith('/'));

                  if (isInternalLink) {
                    return (
                      <a
                        href={href}
                        onClick={(event) => {
                          event.preventDefault();
                          navigate(href);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {children}
                      </a>
                    );
                  }

                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {children}
                    </a>
                  );
                },
                // Style images
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt || ''}
                    className="w-full rounded-lg shadow-md my-8"
                    loading="lazy"
                  />
                ),
                // Style strong/bold text
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">{children}</strong>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to find a contractor?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Connect with contractors near you or remote freelancers — free to use.
          </p>
          <a
            href="/"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </a>
        </div>

        {!isCustomArticle && clusterHubArticle && (
          <div className="mt-12 bg-white rounded-xl shadow-sm p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                Topic Hub
              </span>
              <span className="text-sm text-gray-500">Broader parent guide</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Move up to the parent article</h3>
            <p className="text-gray-600 mb-6 max-w-2xl">
              This question sits inside a larger decision path. Use the hub article for the full landscape, then branch back out into the subtopics that best fit your situation.
            </p>
            <a
              href={`/resources/${clusterHubArticle.slug}`}
              className="block rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {clusterHubArticle.category}
                </span>
                <span className="text-xs text-gray-500">{clusterHubArticle.readTime}</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{clusterHubArticle.title}</h4>
              <p className="text-gray-600">{clusterHubArticle.excerpt}</p>
            </a>
          </div>
        )}

        {(isCustomArticle || faqSuggestedArticles.length > 0) && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isCustomArticle ? 'Continue This Cluster' : 'Follow the Next Branches'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isCustomArticle
                ? 'These are the next guides and comparisons most closely tied to this topic.'
                : 'These guides and comparisons are the next connected pages in this topic cluster.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(isCustomArticle ? relatedCustomArticles : faqSuggestedArticles).map((relatedArticle) => (
                <a
                  key={relatedArticle.slug}
                  href={`/resources/${relatedArticle.slug}`}
                  className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {relatedArticle.category}
                    </span>
                    <span className="text-xs text-gray-500">{relatedArticle.readTime}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {relatedArticle.title}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {relatedArticle.excerpt}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {!isCustomArticle && relatedFaqArticles.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Related Questions</h3>
            <p className="text-gray-600 mb-6">
              These are adjacent questions readers usually ask after this one.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedFaqArticles.map((relatedFaq) => {
                const relatedSlug = buildFaqRouteSlug(relatedFaq.question, detectedPropertyType);
                const relatedTitle = stripGenericLocationTokens(
                  relatedFaq.question.replace(/{propertytype}/g, detectedPropertyType),
                );
                const excerpt = buildExcerpt(
                  stripGenericLocationTokens(
                    relatedFaq.blogContent.replace(/{propertytype}/g, detectedPropertyType),
                  ),
                );

                return (
                  <a
                    key={relatedSlug}
                    href={`/resources/${relatedSlug}`}
                    className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedTitle}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {excerpt}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16">
        <Footer navigate={navigate} />
      </div>
    </div>
  );
}
