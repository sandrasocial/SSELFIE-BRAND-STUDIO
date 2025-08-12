import React from 'react';
import { PreLoginNavigationUnified } from '../components/pre-login-navigation-unified';
import { GlobalFooter } from '../components/global-footer';

export default function AdminAccessOnly() {
  return (
    <div className="min-h-screen bg-white">
      <PreLoginNavigationUnified />
      
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="editorial-headline text-3xl mb-6">Admin Access Only</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            This area is restricted to authorized administrators only.
          </p>
        </div>
      </div>
      
      <GlobalFooter />
    </div>
  );
}