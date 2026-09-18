import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import ContractorSignup from '../src/components/ContractorSignup';
import { generateBreadcrumbSchema, generateWebPageSchema } from '../src/utils/schemaGenerator';

export default function ContractorSignupPage() {
  const pageUrl = 'https://freesurf.tools/signup';
  const pageDescription = 'Join FreeSurf as a contractor and get found by clients in your service area.';
  const webPageSchema = generateWebPageSchema({
    name: 'Join as a Contractor - FreeSurf',
    description: pageDescription,
    url: pageUrl,
    breadcrumbs: [
      { name: 'Home', url: 'https://freesurf.tools/' },
      { name: 'Join as a Contractor', url: pageUrl },
    ],
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://freesurf.tools/' },
    { name: 'Join as a Contractor', url: pageUrl },
  ]);

  return (
    <>
      <Head>
        <title>Join as Contractor - FreeSurf</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={pageUrl} />
        <script
          id="signup-webpage-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        />
        <script
          id="signup-breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>
      <ContractorSignup />
    </>
  );
}

// Use Server-Side Rendering for signup page
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
