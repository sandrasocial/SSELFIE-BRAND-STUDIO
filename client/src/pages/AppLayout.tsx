import React from 'react';
import { MobileTabLayout } from '../components/MobileTabLayout';
import '../styles/editorial-luxury.css';

export function AppLayout() {
  return (
    <div className="relative min-h-screen bg-editorial-black">
      {/* Editorial gradient backdrop for maximum sophistication */}
      <div className="absolute inset-0 bg-gradient-to-br from-editorial-black via-neutral-950 to-neutral-900" />
      
      {/* Main content container with luxury spacing */}
      <div className="relative flex-1 p-3 pt-1">
        {/* Editorial glass container with sophisticated layering */}
        <div className="min-h-screen editorial-glass rounded-4xl shadow-editorial-xl">
          {/* Inner content with refined padding */}
          <div className="min-h-screen p-8">
            <MobileTabLayout />
          </div>
        </div>
      </div>
      
      {/* Minimal bottom gradient for visual depth */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  );
}

export default AppLayout;
