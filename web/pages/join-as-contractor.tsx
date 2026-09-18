import React from 'react';
import Head from 'next/head';
import Header from '../src/components/Layout/Header';
import ContractorLeadsLanding from '../src/components/contractorleadslanding/ContractorLeadsLanding';

export default function LeadsForPropertyBuyers() {
  const pageUrl = 'https://freesurf.tools/join-as-contractor/';
  const pageTitle = 'Join as a Contractor - FreeSurf';
  const pageDescription =
    'FreeSurf is a free, open-source network where contractors, tradespeople, and freelancers get found by clients searching for what they do. No lead fees, no commission, no subscription.';

  return (
    <>
      <Head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <link rel="canonical" href={pageUrl} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
    <meta property="og:url" content={pageUrl} />
      </Head>
      <Header currentView="browse" />
      <ContractorLeadsLanding />
    </>
  );
}
