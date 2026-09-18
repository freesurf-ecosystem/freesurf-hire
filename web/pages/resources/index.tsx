import React from 'react';
import Head from 'next/head';
import Header from '../../src/components/Layout/Header';
import ResourcesPage from '../../src/components/resources/components/ResourcesPage';

export default function Resources() {
  const pageUrl = 'https://freesurf.tools/resources/';

  return (
    <>
      <Head>
        <title>Resources - FreeSurf</title>
        <meta name="description" content="Guides and insights for clients and contractors — hiring, pricing, and getting work done." />
    <link rel="canonical" href={pageUrl} />
    <meta property="og:title" content="Resources - FreeSurf" />
        <meta property="og:description" content="Guides and insights for clients and contractors — hiring, pricing, and getting work done." />
        <meta property="og:url" content={pageUrl} />
      </Head>
      <Header currentView="browse" />
      <ResourcesPage />
    </>
  );
}
