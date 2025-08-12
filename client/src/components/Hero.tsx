import { FC } from 'react';
const Hero: FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center space-y-12">
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-light text-black leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
              Command Your
              <br />
              <span className="italic">Creative Vision</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The sophisticated admin interface for SSELFIE Studio.
              Monitor your platform, analyze user behavior, and orchestrate growth
              with editorial precision.
            </p>
          </div>

          {/* Stats Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-4xl mx-auto pt-16">
            <div className="text-center space-y-2">
              <div className="text-4xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                1,247
              </div>
              <div className="text-sm uppercase tracking-wider text-gray-600">
                Total Users
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-4xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                €15,132
              </div>
              <div className="text-sm uppercase tracking-wider text-gray-600">
                Monthly Revenue
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-4xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                324
              </div>
              <div className="text-sm uppercase tracking-wider text-gray-600">
                Premium Users
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-16">
            <button className="bg-black text-white px-12 py-4 text-sm uppercase tracking-wider hover:bg-gray-900 transition-colors duration-300">
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;