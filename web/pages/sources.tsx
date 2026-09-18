import React from 'react';
import Head from 'next/head';
import Header from '../src/components/Layout/Header';

export default function SourcesPage() {
  return (
    <>
      <Head>
        <title>Data Sources - FreeSurf</title>
        <meta name="description" content="Data sources used by FreeSurf for geographic information." />
      </Head>
      <Header currentView="browse" />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Sources</h1>
          <p className="text-gray-700 mb-6">
            We use the following public datasets from SimpleMaps for geographic information:
          </p>
          <ul className="space-y-3 text-blue-600 underline">
            <li>
              <a href="https://simplemaps.com/data/us-cities" target="_blank" rel="noopener noreferrer">
                US Cities
              </a>
            </li>
            <li>
              <a href="https://simplemaps.com/data/us-counties" target="_blank" rel="noopener noreferrer">
                US Counties
              </a>
            </li>
            <li>
              <a href="https://simplemaps.com/data/us-neighborhoods" target="_blank" rel="noopener noreferrer">
                US Neighborhoods
              </a>
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}
