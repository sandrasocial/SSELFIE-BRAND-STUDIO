import React from 'react';

export default function AdminHero() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Full-bleed background with editorial gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Editorial overlay pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-10 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm20 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Content container with editorial spacing */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full px-8 text-center">
        {/* Main headline - Times New Roman editorial style */}
        <h1 
          className="text-6xl md:text-8xl font-light text-white uppercase tracking-wide mb-8 leading-tight"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Sandra's
          <br />
          Command Center
        </h1>
        
        {/* Editorial subheadline */}
        <p 
          className="text-xl md:text-2xl text-white font-light italic mb-12 max-w-2xl leading-relaxed"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Where empires are built, one authentic story at a time
        </p>
        
        {/* Luxury stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="text-center">
            <div 
              className="text-4xl md:text-5xl font-light text-white mb-2"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              120K+
            </div>
            <div className="text-sm text-gray-300 uppercase tracking-widest">
              Followers Built
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-4xl md:text-5xl font-light text-white mb-2"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              90
            </div>
            <div className="text-sm text-gray-300 uppercase tracking-widest">
              Days to Empire
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-4xl md:text-5xl font-light text-white mb-2"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              1000+
            </div>
            <div className="text-sm text-gray-300 uppercase tracking-widest">
              Lives Transformed
            </div>
          </div>
        </div>
        
        {/* Luxury CTA button */}
        <button className="group relative px-12 py-4 border border-white text-white font-light uppercase tracking-widest transition-all duration-300 hover:bg-white hover:text-black">
          <span className="relative z-10">Enter Dashboard</span>
          <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>
      </div>
      
      {/* Bottom editorial accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-60">
        <div className="flex flex-col items-center">
          <div className="w-px h-16 bg-white opacity-30 mb-2"></div>
          <div className="text-xs uppercase tracking-widest">Scroll</div>
        </div>
      </div>
    </div>
  );
}