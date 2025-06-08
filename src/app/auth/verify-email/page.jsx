// app/auth/verify-email/page.jsx
import { Suspense } from 'react';
import Head from 'next/head'; // Head is a client component, no longer needed in App Router for <head> elements
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import VerifyEmailClientComponent from '@/components/VerifyEmailClientComponent';

export default function VerifyEmailPageWrapper() {
  return (
    <>
      {/* Head is handled differently in App Router using metadata exports */}
      {/* For page-specific metadata, you can use 'metadata' export in page.js/tsx */}
      {/* Example:
      export const metadata = {
        title: 'Verify Email | flame&crumble',
        description: 'Verify your email address for flame&crumble',
      };
      */}
      <title>Verify Email | flame&crumble</title>
      <meta name="description" content="Verify your email address for flame&crumble" />

      <Navbar />

      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Wrap the client component that uses useSearchParams with Suspense */}
        <Suspense fallback={
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
            <p>Loading verification form...</p>
            {/* You can add a spinner or skeleton here */}
          </div>
        }>
          <VerifyEmailClientComponent />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}