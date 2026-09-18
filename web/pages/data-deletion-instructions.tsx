import React from 'react';
import Head from 'next/head';
import Header from '../src/components/Layout/Header';
import DataDeletionInstructions from '../src/components/DataDeletionInstructions';

export default function DataDeletionInstructionsPage() {
  return (
    <>
      <Head>
        <title>Data Access and Deletion Requests - FreeSurf</title>
        <meta name="description" content="How to request access to, correction of, or deletion of personal information stored by FreeSurf." />
      </Head>
      <Header currentView="browse" />
      <DataDeletionInstructions />
    </>
  );
}
