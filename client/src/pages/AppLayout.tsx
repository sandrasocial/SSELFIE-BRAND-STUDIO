import React from 'react';
import { MobileTabLayout } from '../components/MobileTabLayout';

// Editorial Luxury AppLayout - Pure Black Sophistication
export function AppLayout() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Subtle editorial gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-neutral-900" />
      
      {/* Main content container with editorial spacing */}
      <div className="relative min-h-screen mx-3 pt-1">
        {/* Editorial container with sophisticated backdrop */}
        <div className="min-h-screen bg-neutral-950/80 backdrop-blur-editorial rounded-editorial-xl shadow-editorial-xl border border-neutral-800/30">
          {/* Inner content with luxury padding */}
          <div className="min-h-screen">
            <MobileTabLayout />
          </div>
        </div>
      </div>
      
      {/* Minimal bottom safe area */}
      <div className="h-4 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}

export default AppLayout;
