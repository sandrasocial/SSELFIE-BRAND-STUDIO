import React from 'react';

export default function AdminHero() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Full Bleed Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/gallery/sandra-portrait-editorial.jpg')`
        }}
      />
      
      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white max-w-4xl mx-auto px-6">
          <h1 
            className="text-6xl md:text-8xl font-light uppercase tracking-wide mb-6"
            style={{ 
              fontFamily: 'Times New Roman',
              fontWeight: 200,
              letterSpacing: '-0.01em'
            }}
          >
            SANDRA'S DASHBOARD
          </h1>
          
          <p 
            className="text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 300
            }}
          >
            From rock bottom to empire builder—command center for your transformation journey
          </p>
          
          {/* Editorial Quote */}
          <blockquote 
            className="mt-12 text-2xl md:text-4xl italic text-white/90"
            style={{ 
              fontFamily: 'Times New Roman',
              letterSpacing: '-0.02em'
            }}
          >
            "Every empire started with a single brave step forward."
          </blockquote>
        </div>
      </div>
      
      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}