import React from 'react';
import Head from 'next/head';
import AdminPanel from '../src/components/AdminPanel';

export default function AdminPanelPage() {
  return (
    <>
      <Head>
        <title>Admin Panel - FreeSurf</title>
        <meta name="description" content="Admin Panel" />
      </Head>
      <AdminPanel />
    </>
  );
}
