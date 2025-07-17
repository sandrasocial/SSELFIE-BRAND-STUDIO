import React from 'react';

const AdminHero: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/api/gallery/featured-image.jpg')`
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white space-y-8 max-w-4xl mx-auto px-8">
          <h1 className="text-6xl md:text-8xl font-light leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
            Command
            <br />
            <span className="italic">Your Empire</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            SSELFIE Studio Administrative Dashboard
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16">
            <div className="space-y-2">
              <div className="text-4xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                1,247
              </div>
              <div className="text-sm uppercase tracking-wider opacity-90">
                Total Users
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-4xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                €15,132
              </div>
              <div className="text-sm uppercase tracking-wider opacity-90">
                Monthly Revenue
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-4xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                324
              </div>
              <div className="text-sm uppercase tracking-wider opacity-90">
                Premium Users
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHero;