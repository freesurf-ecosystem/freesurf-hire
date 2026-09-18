import React from 'react';
import Head from 'next/head';
import Header from '../src/components/Layout/Header';
import Footer from '../src/components/Layout/Footer';
import { ECOSYSTEM_TOOLS, ECOSYSTEM_GITHUB } from '../src/config/ecosystem';

const SOURCES = [
  {
    group: 'Geographic data',
    items: [
      {
        name: 'USPS ZIP Locale Detail',
        href: 'https://postalpro.usps.com/ZIP_Locale_Detail',
        note: 'ZIP code to city/state naming.',
      },
      {
        name: 'US Census Bureau — ZCTA Gazetteer',
        href: 'https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html',
        note: 'ZIP code centroids (latitude/longitude).',
      },
      {
        name: 'US Census Bureau — ZCTA to Place relationship',
        href: 'https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.html',
        note: 'Mapping ZIP codes to their place (city).',
      },
      {
        name: 'US Census Bureau — Cartographic Boundary Files',
        href: 'https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html',
        note: 'ZCTA boundaries, used for map work.',
      },
    ],
  },
  {
    group: 'Icons and graphics',
    items: [
      {
        name: 'SVG Repo',
        href: 'https://www.svgrepo.com',
        note: 'Vectors and icons used in the marketplace comparison section.',
      },
    ],
  },
  {
    group: 'Infrastructure',
    items: [
      { name: 'Cloudflare Workers', href: 'https://workers.cloudflare.com', note: 'Hosting and edge compute.' },
      { name: 'Supabase', href: 'https://supabase.com', note: 'Postgres database and authentication.' },
    ],
  },
];

export default function SourcesPage() {
  return (
    <>
      <Head>
        <title>Data Sources - FreeSurf</title>
        <meta
          name="description"
          content="The public datasets, graphics and infrastructure FreeSurf relies on."
        />
        <link rel="canonical" href="https://freesurf.tools/sources" />
      </Head>
      <Header currentView="browse" />
      <main className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Data Sources</h1>
          <p className="text-lg text-gray-600 mb-12">
            FreeSurf is built on public datasets and open tools. These are the ones we rely on, and
            we&apos;re grateful to the people who maintain them.
          </p>

          <div className="space-y-12">
            {SOURCES.map((group) => (
              <section key={group.group}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{group.group}</h2>
                <ul className="space-y-4">
                  {group.items.map((item) => (
                    <li key={item.name} className="border-l-2 border-gray-200 pl-4">
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {item.name}
                      </a>
                      <p className="text-sm text-gray-600 mt-1">{item.note}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">FreeSurf tools</h2>
              <ul className="space-y-4">
                {ECOSYSTEM_TOOLS.map((tool) => (
                  <li key={tool.name} className="border-l-2 border-gray-200 pl-4">
                    {tool.href ? (
                      <a
                        href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {tool.name}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-500">{tool.name}</span>
                    )}
                    <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-600 mt-6">
                The platform source is available at{' '}
                <a
                  href={ECOSYSTEM_GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {ECOSYSTEM_GITHUB.replace('https://', '')}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
