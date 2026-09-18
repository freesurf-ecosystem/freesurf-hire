import React from 'react';
import Head from 'next/head';
import Header from '../src/components/Layout/Header';

const SUPPORT_EMAIL = 'support@freesurf.tools';

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: 'How do I contact FreeSurf support?',
    answer: (
      <>
        Email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 underline">
          {SUPPORT_EMAIL}
        </a>
        . We reply within one business day.
      </>
    ),
  },
  {
    question: 'I cannot sign in to the mobile app.',
    answer: (
      <>
        Try the &ldquo;Forgot password&rdquo; link on the sign-in screen first. If that does not arrive within a few
        minutes, check your spam folder, then email {SUPPORT_EMAIL} from the address you used to sign up and we will
        help you regain access.
      </>
    ),
  },
  {
    question: 'How do I delete my account?',
    answer: (
      <>
        In the mobile app, open <strong>Settings</strong> from the home screen and tap <strong>Delete account</strong>.
        You can also email {SUPPORT_EMAIL} and we will remove your account on request. See our{' '}
        <a href="/data-deletion-instructions" className="text-blue-600 underline">
          data deletion instructions
        </a>{' '}
        page for full details.
      </>
    ),
  },
  {
    question: 'How does pricing work for contractors?',
    answer: (
      <>
        FreeSurf is free to use. There are no per-lead charges, no commission on your work, no monthly subscriptions,
        and no long-term contracts — that is the model rather than an introductory offer. The platform is also open
        source, so you can check how it works. Full details are on the{' '}
        <a href="/join-as-contractor" className="text-blue-600 underline">
          join as a contractor page
        </a>
        .
      </>
    ),
  },
  {
    question: 'How long does it take to hear from a buyer after submitting?',
    answer:
      'Most contractors respond within a few hours. If you have not heard back within 48 hours, you can send your request to additional contractors from the same flow without re-entering your details.',
  },
  {
    question: 'Is my information shared with anyone else?',
    answer: (
      <>
        Your contact details are shared only with the specific contractors you choose to contact. See our{' '}
        <a href="/privacy" className="text-blue-600 underline">
          Privacy Policy
        </a>{' '}
        for full details on how data is collected, stored, and shared.
      </>
    ),
  },
];

export default function SupportPage() {
  return (
    <>
      <Head>
        <title>Support - FreeSurf</title>
        <meta
          name="description"
          content="Contact FreeSurf support, find answers to common questions, and learn how to manage your account."
        />
        <link rel="canonical" href="https://freesurf.tools/support" />
      </Head>
      <Header currentView="browse" />
      <main className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Support</h1>
          <p className="mt-4 text-base text-gray-600">
            Need help with FreeSurf? The fastest way to reach us is by email. We respond within one business day.
          </p>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Contact us</h2>
            <p className="mt-2 text-sm text-gray-600">For account, billing, or technical questions:</p>
            <p className="mt-3 text-lg font-medium">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Please include your account email and a brief description of the issue so we can help quickly.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900">Frequently asked questions</h2>
            <dl className="mt-6 space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-gray-200 p-5">
                  <dt className="text-base font-semibold text-gray-900">{faq.question}</dt>
                  <dd className="mt-2 text-sm leading-6 text-gray-700">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900">Useful links</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-blue-600 underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-blue-600 underline">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="/data-deletion-instructions" className="text-blue-600 underline">
                  Data access and deletion instructions
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
