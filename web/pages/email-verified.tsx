import React from 'react';
import Head from 'next/head';
import Header from '../src/components/Layout/Header';
import EmailVerificationSuccess from '../src/components/EmailVerificationSuccess';

export default function EmailVerifiedPage() {
  return (
    <>
      <Head>
        <title>Email Verified - FreeSurf</title>
        <meta name="description" content="Your email has been verified" />
      </Head>
      <Header currentView="browse" />
      <EmailVerificationSuccess />
    </>
  );
}
