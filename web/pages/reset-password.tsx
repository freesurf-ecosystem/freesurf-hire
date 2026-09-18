import React from 'react';
import Head from 'next/head';
import Header from '../src/components/Layout/Header';
import PasswordResetPage from '../src/components/PasswordResetPage';

export default function ResetPasswordPage() {
  return (
    <>
      <Head>
        <title>Reset Password - FreeSurf</title>
        <meta name="description" content="Reset your FreeSurf password" />
      </Head>
      <Header currentView="browse" />
      <PasswordResetPage />
    </>
  );
}
