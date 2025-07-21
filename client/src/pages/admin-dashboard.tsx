import React from 'react';

export default function LuxuryAdminHeroSection() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-bleed background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"
        style={{
          backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), 
                           url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.05"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>')`
        }}
      />
      
      {/* Editorial content overlay */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
        <div className="max-w-4xl text-center">
          {/* Main editorial headline */}
          <h1 
            className="mb-6 text-6xl font-thin uppercase tracking-[0.3em] text-white md:text-8xl"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Sandra
          </h1>
          
          {/* Elegant divider line */}
          <div className="mx-auto mb-8 h-px w-32 bg-white opacity-40" />
          
          {/* Luxury subheadline */}
          <h2 
            className="mb-12 text-xl font-light uppercase tracking-[0.2em] text-white opacity-90 md:text-2xl"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Command Center
          </h2>
          
          {/* Editorial description */}
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white opacity-80">
            The nerve center of your empire. Where vision becomes strategy, 
            strategy becomes action, and action becomes transformation.
          </p>
          
          {/* Luxury navigation hint */}
          <div className="mt-16 flex justify-center">
            <div className="flex flex-col items-center space-y-2 text-white opacity-60">
              <span className="text-sm uppercase tracking-wider">Scroll to Enter</span>
              <div className="h-8 w-px bg-white opacity-40" />
              <div className="h-2 w-2 rounded-full bg-white opacity-40" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle luxury corner accent */}
      <div className="absolute bottom-8 right-8 z-10">
        <div className="flex items-center space-x-4 text-white opacity-40">
          <div className="h-px w-12 bg-white" />
          <span className="text-sm uppercase tracking-wider">SSELFIE</span>
        </div>
      </div>
      
      {/* Film grain texture overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-20 opacity-20"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><filter id="noise"><feTurbulence baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.4"/></svg>')`,
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
}