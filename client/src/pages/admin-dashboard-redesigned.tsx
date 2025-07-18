import React from 'react';

export default function AdminHeroSection() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Full-bleed background with editorial gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Editorial overlay pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-white/20 h-full"></div>
          ))}
        </div>
      </div>

      {/* Main content with luxury editorial layout */}
      <div className="relative z-10 flex flex-col justify-center items-start h-full px-16 max-w-7xl mx-auto">
        {/* Editorial date stamp */}
        <div className="text-white/60 text-sm font-light tracking-[0.2em] uppercase mb-8">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>

        {/* Main headline - Times New Roman luxury */}
        <h1 
          className="text-white font-light tracking-[-0.02em] leading-[0.9] mb-6"
          style={{ 
            fontFamily: 'Times New Roman, serif',
            fontSize: 'clamp(3rem, 8vw, 8rem)'
          }}
        >
          SANDRA'S
          <br />
          COMMAND
          <br />
          CENTER
        </h1>

        {/* Subtitle with editorial spacing */}
        <div className="flex items-center mb-12">
          <div className="w-12 h-px bg-white/40 mr-6"></div>
          <p className="text-white/80 text-lg font-light tracking-wide max-w-md">
            Your empire dashboard. Where phone strategies become million-dollar movements.
          </p>
        </div>

        {/* Editorial stats row */}
        <div className="flex items-center space-x-12 text-white/60">
          <div className="text-center">
            <div className="text-2xl font-light text-white mb-1">120K+</div>
            <div className="text-xs uppercase tracking-widest">Followers Built</div>
          </div>
          <div className="w-px h-12 bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl font-light text-white mb-1">90</div>
            <div className="text-xs uppercase tracking-widest">Days To Empire</div>
          </div>
          <div className="w-px h-12 bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl font-light text-white mb-1">∞</div>
            <div className="text-xs uppercase tracking-widest">Possibilities</div>
          </div>
        </div>
      </div>

      {/* Bottom editorial border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      
      {/* Corner editorial details */}
      <div className="absolute top-8 right-8 text-white/40 text-xs uppercase tracking-widest transform rotate-90 origin-top-right">
        SSELFIE STUDIO
      </div>
      
      <div className="absolute bottom-8 left-8 text-white/40 text-xs uppercase tracking-widest">
        EST. 2024 × LUXURY DIGITAL
      </div>
    </div>
  );
}