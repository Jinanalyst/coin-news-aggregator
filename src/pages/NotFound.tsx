import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const NotFound = () => {
  return (
    <>
      <SEO
        title="404 - Page Not Found | CryptoNews Hub"
        description="The page you are looking for could not be found. Return to the CryptoNews Hub homepage for the latest cryptocurrency news."
        type="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <p className="text-xl text-purple-200 mb-8">Page not found</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Return Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
