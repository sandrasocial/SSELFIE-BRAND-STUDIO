import React from 'react';
import { useLocation } from 'wouter';
import { stackClientApp } from '../../../stack/client';

export function AppTopNav() {
  const [, setLocation] = useLocation();

  const go = (path: string) => {
    setLocation(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await stackClientApp.signOut();
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="App navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-black/10 backdrop-blur"
      style={{ minHeight: 64 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => go('/app')}
            aria-label="SSELFIE home"
            className="font-serif text-xl font-light tracking-wide text-black hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            SSELFIE
          </button>

        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => go('/maya')} className="text-xs uppercase tracking-[0.3em] font-light text-black/80 hover:text-black">Studio</button>
          <button onClick={() => go('/sselfie-gallery')} className="text-xs uppercase tracking-[0.3em] font-light text-black/80 hover:text-black">Gallery</button>
          <button onClick={() => go('/account-settings')} className="text-xs uppercase tracking-[0.3em] font-light text-black/80 hover:text-black">Account</button>
          <button onClick={handleLogout} className="text-xs uppercase tracking-[0.3em] font-light text-black border border-black/30 px-4 py-2 hover:bg-black hover:text-white transition-colors">Logout</button>
        </div>
        </div>
      </div>
    </nav>
  );
}


