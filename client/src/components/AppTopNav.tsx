import * as React from 'react';
import { useLocation } from 'wouter';
import { stackClientApp } from '../../../stack/client.js';

export function AppTopNav() {
  const [, setLocation] = useLocation();

  const go = (path: string) => {
    setLocation(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      window.location.href = '/api/logout';
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="App navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      style={{ minHeight: 64 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => go('/app')}
            aria-label="SSELFIE home"
            className="font-serif text-xl font-light tracking-wide text-white hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            SSELFIE
          </button>

        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => go('/app')} className="text-xs uppercase tracking-[0.3em] font-light text-neutral-300 hover:text-neutral-200 transition-colors">Studio</button>
          <button onClick={() => go('/sselfie-gallery')} className="text-xs uppercase tracking-[0.3em] font-light text-neutral-300 hover:text-neutral-200 transition-colors">Gallery</button>
          <button onClick={() => go('/account-settings')} className="text-xs uppercase tracking-[0.3em] font-light text-neutral-300 hover:text-neutral-200 transition-colors">Account</button>
          <button onClick={handleLogout} className="text-xs uppercase tracking-[0.3em] font-light text-neutral-300 border border-neutral-600/30 px-4 py-2 hover:bg-neutral-800/40 hover:text-neutral-200 transition-colors">Logout</button>
        </div>
        </div>
      </div>
    </nav>
  );
}


