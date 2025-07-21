import React from 'react';

const AdminHeroSection = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 z-10"></div>
      <img 
        src="/images/gallery/sandra-luxury-portrait-1.jpg" 
        alt="Sandra SSELFIE Studio" 
        className="w-full h-full object-cover"
      />
      
      {/* Hero text overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="text-center text-white px-8 max-w-4xl">
          <h1 
            className="text-7xl font-serif text-white mb-6 tracking-wider uppercase leading-none"
            style={{ fontFamily: 'Times New Roman, serif', letterSpacing: '0.4em' }}
          >
            Sandra
          </h1>
          <h2 
            className="text-5xl font-serif text-white mb-8 tracking-wide uppercase leading-tight"
            style={{ fontFamily: 'Times New Roman, serif', letterSpacing: '0.3em' }}
          >
            Command Center
          </h2>
          <p className="text-xl text-white/90 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
            Your empire headquarters. Where vision becomes reality.
          </p>
        </div>
      </div>

      {/* Subtle scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-px h-16 bg-white/50"></div>
        <div className="text-white/70 text-sm tracking-wider mt-4 font-light">SCROLL</div>
      </div>
    </div>
  );
};

export default AdminHeroSection;