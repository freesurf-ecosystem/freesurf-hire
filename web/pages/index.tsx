import Head from 'next/head';
import { GetServerSideProps } from 'next';
import LandingPage from '../src/components/LandingPage';
import { generateOrganizationSchema, generateWebsiteSchema } from '../src/utils/schemaGenerator';

export default function HomePage() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      <Head>
        <title>FreeSurf | Open-source contractor network</title>
        <meta name="description" content="Open-source marketplace connecting contractors and small businesses with individuals who need a home service or freelancer help" />
        <link rel="canonical" href="https://freesurf.tools/" />
        <script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
      </Head>
      <LandingPage />
    </>
  );
}

// Use Server-Side Rendering for homepage
// This allows dynamic content and prevents SSG issues
export const getServerSideProps: GetServerSideProps = async ({ resolvedUrl }) => {
  const requestUrl = new URL(`https://freesurf.tools${resolvedUrl}`);

  if (requestUrl.searchParams.has('ref')) {
    requestUrl.searchParams.delete('ref');

    const destination = `${requestUrl.pathname}${requestUrl.searchParams.toString() ? `?${requestUrl.searchParams.toString()}` : ''}`;

    return {
      redirect: {
        destination,
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};