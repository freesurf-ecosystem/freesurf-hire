import React from 'react';
import Head from 'next/head';

export default function DebugEnv() {
  const [clientEnv, setClientEnv] = React.useState<any>(null);

  React.useEffect(() => {
    // Check what's available client-side
    setClientEnv({
      processEnv: {
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'MISSING',
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Present (hidden)' : 'MISSING',
        VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Present (hidden)' : 'MISSING',
      },
      hasImportMeta: typeof import.meta !== 'undefined',
      hasWindow: typeof window !== 'undefined',
    });
  }, []);

  return (
    <>
      <Head>
        <title>Environment Variables Debug - FreeSurf</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Environment Variables Debug</h1>
        
        <h2>Server-Side (Build Time)</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
{JSON.stringify({
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'MISSING',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Present (hidden)' : 'MISSING',
  VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Present (hidden)' : 'MISSING',
}, null, 2)}
        </pre>

        <h2>Client-Side (Runtime)</h2>
        {clientEnv ? (
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
{JSON.stringify(clientEnv, null, 2)}
          </pre>
        ) : (
          <p>Loading...</p>
        )}

        <h2>Instructions</h2>
        <p>This page helps debug environment variable issues.</p>
        <ul>
          <li><strong>Server-Side</strong>: Shows what was available during build</li>
          <li><strong>Client-Side</strong>: Shows what's available in the browser</li>
        </ul>
        <p>If anything shows "MISSING", the environment variables aren't configured correctly in Digital Ocean.</p>
        
        <p><a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>&lt; Back to Homepage</a></p>
      </div>
    </>
  );
}
