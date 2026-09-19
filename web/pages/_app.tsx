import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../src/index.css';
// Global CSS for the MapLibre map used by the contractor service-area picker.
// Pages Router only allows global stylesheets in _app, so it lives here rather
// than in the component that uses it.
import 'maplibre-gl/dist/maplibre-gl.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Track page views with GTM when route changes
  useEffect(() => {
    // Push page view event to GTM dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'pageview',
      page: router.asPath,
      title: document.title,
    });
  }, [router.asPath]);

  return (
    <>
      <Head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KHCCGV8H');`,
          }}
        />

        {/* Favicon - black logo mark in browser tabs */}
        <link rel="icon" type="image/svg+xml" href="/logo-black.svg" />
        <link rel="shortcut icon" href="/logo-black.svg" />
        <link rel="apple-touch-icon" href="/logo-black.svg" />

        {/* Open Graph / Social Media */}
        <meta property="og:image" content="https://freesurf.tools/logo-black.svg" />
        <meta property="og:image:type" content="image/svg+xml" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://freesurf.tools/logo-black.svg" />
        
        {/* Critical resource hints for performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Preload critical hero image for LCP optimization */}
        <link 
          rel="preload" 
          as="image" 
          href="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1600" 
          fetchPriority="high"
        />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//images.pexels.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Reduce render-blocking resources */}
        <meta name="color-scheme" content="light dark" />
        
        {/* Additional performance hints */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KHCCGV8H"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      <Component {...pageProps} />
    </>
  );
}