import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import ContractorLogin from '../src/components/ContractorLogin';
import { generateBreadcrumbSchema, generateWebPageSchema } from '../src/utils/schemaGenerator';

export default function ContractorLoginPage() {
  const pageUrl = 'https://freesurf.tools/login';
  const pageDescription = 'Log in to your FreeSurf contractor account to manage your profile and client requests.';
  const webPageSchema = generateWebPageSchema({
    name: 'Contractor Login - FreeSurf',
    description: pageDescription,
    url: pageUrl,
    breadcrumbs: [
      { name: 'Home', url: 'https://freesurf.tools/' },
      { name: 'Contractor Login', url: pageUrl },
    ],
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://freesurf.tools/' },
    { name: 'Contractor Login', url: pageUrl },
  ]);

  return (
    <>
      <Head>
        <title>Contractor Login - FreeSurf</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={pageUrl} />
        <script
          id="login-webpage-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        />
        <script
          id="login-breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>
      <ContractorLogin />
    </>
  );
}

// Use Server-Side Rendering for login page
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
