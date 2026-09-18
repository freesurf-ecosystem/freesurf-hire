import React from 'react';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../src/components/Layout/Header';
import BlogPost from '../../src/components/BlogPost';
import { faqQuestions } from '../../src/data/faqData';
import { customArticles, getCustomArticleMetadataBySlug } from '../../src/data/articleData';

interface ResourceSlugPageProps {
  slug: string;
}

function generateResourceSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getAllResourceSlugs(): string[] {
  const faqSlugs = faqQuestions.map((faq) => generateResourceSlug(faq.question));
  const customSlugs = customArticles.map((article) => article.slug);
  return Array.from(new Set([...customSlugs, ...faqSlugs]));
}

function getResourceHeadMetadata(slug: string): { title: string; description: string } {
  const customArticle = getCustomArticleMetadataBySlug(slug);
  if (customArticle) {
    return { title: customArticle.title, description: customArticle.excerpt };
  }

  const matchingFaq = faqQuestions.find((faq) => generateResourceSlug(faq.question) === slug);
  if (matchingFaq) {
    return {
      title: matchingFaq.question,
      description: matchingFaq.answer.slice(0, 160),
    };
  }

  return {
    title: 'Resources - FreeSurf',
    description: 'Guides and resources from FreeSurf.',
  };
}

export default function ResourceSlugPage({ slug }: ResourceSlugPageProps) {
  const headMetadata = getResourceHeadMetadata(slug);

  return (
    <>
      <Head>
        <title>{headMetadata.title}</title>
        <meta name="description" content={headMetadata.description} />
        <link rel="canonical" href={`https://freesurf.tools/resources/${slug}/`} />
      </Head>
      <Header currentView="browse" />
      <BlogPost slug={slug} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate on-demand; slugs come from the (currently empty) content data.
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<ResourceSlugPageProps> = async ({ params }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const validSlugs = new Set(getAllResourceSlugs());

  if (!slug || !validSlugs.has(slug)) {
    return { notFound: true };
  }

  return { props: { slug } };
};
