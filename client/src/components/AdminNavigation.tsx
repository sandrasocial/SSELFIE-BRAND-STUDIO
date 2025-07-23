import React from 'react';
import { useLocation } from 'wouter';

export function AdminNavigation() {
  const [, setLocation] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="font-serif text-xl font-light tracking-wide text-white hover:opacity-70 transition-opacity duration-300"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            SSELFIE ADMIN
          </button>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
            <button 
              onClick={() => setLocation("/workspace")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Workspace
            </button>
            <button 
              onClick={() => setLocation("/visual-editor")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Visual Editor
            </button>
            <button 
              onClick={() => setLocation("/analytics")}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Analytics
            </button>
            <button
              onClick={() => setLocation('/api/logout')}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}