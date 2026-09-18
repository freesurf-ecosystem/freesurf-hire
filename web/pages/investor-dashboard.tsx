import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import ContractorDashboard from '../src/components/ContractorDashboard';

export default function ContractorDashboardPage() {
  return (
    <>
      <Head>
        <title>Contractor Dashboard - FreeSurf</title>
        <meta name="description" content="Manage your contractor profile, services, and client requests on FreeSurf." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" type="image/png" href="/logo-black.svg" />
        <link rel="shortcut icon" href="/logo-black.svg" />
        <link rel="apple-touch-icon" href="/logo-black.svg" />
      </Head>
      <ContractorDashboard />
    </>
  );
}

// Use Server-Side Rendering for authenticated pages
// This prevents static generation and allows dynamic content
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
