import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getCustomArticleMetadataBySlug, getRelatedCustomArticles, type ArticleMetadata } from '../../../data/articleData';
import { resourceArticleStyles } from './resourceArticleStyles';
import ResourceBreadcrumbs from './ResourceBreadcrumbs';
import ResourceArticleToc, { buildResourceArticleTocItems, type ResourceArticleTocItem } from './ResourceArticleToc';

interface ResourceArticleLayoutProps {
  sectionLabel: string;
  sectionHref: string;
  currentLabel: string;
  onBack: () => void;
  wide?: boolean;
  toc?: ReactNode;
  autoToc?: boolean;
  tocTitle?: string;
  showMobileToc?: boolean;
  header: ReactNode;
  children: ReactNode;
}

export default function ResourceArticleLayout({
  sectionLabel,
  sectionHref,
  currentLabel,
  wide = false,
  toc,
  autoToc = true,
  tocTitle,
  showMobileToc = true,
  header,
  children,
}: ResourceArticleLayoutProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [generatedTocItems, setGeneratedTocItems] = useState<ResourceArticleTocItem[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<ArticleMetadata[]>([]);

  useEffect(() => {
    if (!autoToc || !contentRef.current) {
      setGeneratedTocItems([]);
      return;
    }

    setGeneratedTocItems(buildResourceArticleTocItems(contentRef.current));
  }, [autoToc]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const currentSlug = pathSegments[pathSegments.length - 1];

    if (!currentSlug) {
      setRelatedArticles([]);
      return;
    }

    const currentArticle = getCustomArticleMetadataBySlug(currentSlug);

    if (!currentArticle) {
      setRelatedArticles([]);
      return;
    }

    setRelatedArticles(getRelatedCustomArticles(currentArticle.id, 4));
  }, []);

  const resolvedToc = toc ?? (
    autoToc && generatedTocItems.length > 0
      ? <ResourceArticleToc items={generatedTocItems} title={tocTitle} />
      : null
  );

  const relatedSection = relatedArticles.length > 0 ? (
    <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-lg sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Suggested Articles</p>
          <h2 className="text-2xl font-bold text-gray-900">Continue This Cluster</h2>
        </div>
        <p className="max-w-2xl text-sm text-gray-600">
          These links are chosen from shared tags and category overlap so the next click stays within the same topic cluster.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {relatedArticles.map((article) => (
          <article
            key={article.id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">{article.category}</p>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
              <a href={article.path} className="inline-block transition-all duration-200 hover:scale-[1.02] hover:text-blue-700">
                {article.title}
              </a>
            </h3>
            <p className="mt-2 text-sm text-gray-600">{article.excerpt}</p>
            <p className="mt-4">
              <a href={article.path} className="inline-block text-sm font-medium text-blue-600 transition-all duration-200 hover:scale-[1.03] hover:text-blue-800">
                Read this article
              </a>
            </p>
          </article>
        ))}
      </div>
    </section>
  ) : null;

  return (
    <div className={resourceArticleStyles.page}>
      <div className={wide ? resourceArticleStyles.wideContainer : resourceArticleStyles.container}>
        <ResourceBreadcrumbs
          sectionLabel={sectionLabel}
          sectionHref={sectionHref}
          currentLabel={currentLabel}
        />

        {resolvedToc ? (
          <div className="flex min-w-0 flex-col gap-8 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1 max-w-4xl">
              {header}
              {showMobileToc && <div className="mb-8 min-w-0 lg:hidden">{resolvedToc}</div>}
              <div ref={contentRef}>{children}</div>
              {relatedSection}
            </div>
            <div className="hidden w-56 shrink-0 lg:block lg:sticky lg:top-8 lg:h-fit">{resolvedToc}</div>
          </div>
        ) : (
          <>
            {header}
            <div ref={contentRef}>{children}</div>
            {relatedSection}
          </>
        )}
      </div>
    </div>
  );
}
