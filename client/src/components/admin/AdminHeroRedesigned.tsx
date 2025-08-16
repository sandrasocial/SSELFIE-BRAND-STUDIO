// React import not needed with Vite JSX transform

export default function AdminHeroRedesigned() {
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
              €67
            </div>
            <div className="text-sm text-gray-300 uppercase tracking-widest">
              Monthly Revenue
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
        
        {/* Luxury action buttons */}
        <div className="flex flex-col sm:flex-row gap-6">
          <button 
            className="px-8 py-3 bg-white text-black font-light uppercase tracking-widest hover:bg-gray-100 transition-colors duration-300"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            View Analytics
          </button>
          
          <button 
            className="px-8 py-3 border border-white text-white font-light uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Manage Agents
          </button>
        </div>
      </div>
      
      {/* Minimalist scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-px h-16 bg-white opacity-30"></div>
      </div>
    </div>
  );
}