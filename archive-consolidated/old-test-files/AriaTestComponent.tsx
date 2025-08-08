import React, { useState, useEffect } from 'react';

// TEST COMMENT ADDED: Testing auto-refresh system - timestamp: ${new Date().toISOString()}
// This comment should trigger the auto-refresh functionality

const AriaTestComponent: React.FC = () => {
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1);
      setLastRefresh(new Date().toLocaleTimeString());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <nav className="border-b border-gray-800 bg-black/90 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-light tracking-[0.2em] uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>
              ARIA TEST STUDIO
            </h1>
            <div className="text-sm opacity-70">
              Auto-Refresh Testing
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20 relative">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect width="1200" height="600" fill="%23111"/><circle cx="600" cy="300" r="100" fill="%23333" opacity="0.3"/></svg>')`,
            backgroundPosition: '50% 30%'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 
                className="text-white text-4xl font-light tracking-[0.3em] uppercase opacity-90 mb-4"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {'AUTO REFRESH TEST'.split('').join(' ')}
              </h2>
              <div className="text-white/70 text-lg tracking-wider">
                Testing component refresh functionality
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Status Cards */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Refresh Counter Card */}
          <div className="relative bg-white rounded-lg overflow-hidden">
            <div 
              className="h-64 bg-cover bg-center relative"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23000"/><text x="200" y="150" text-anchor="middle" fill="%23fff" font-size="48" font-family="Times New Roman">${refreshCount}</text></svg>')`,
                backgroundPosition: '50% 30%'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div 
                    className="text-white text-2xl font-light tracking-[0.3em] uppercase opacity-90"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    {'REFRESH COUNT'.split('').join(' ')}
                  </div>
                  <div className="text-white text-6xl font-light mt-4">
                    {refreshCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Refresh Time Card */}
          <div className="relative bg-white rounded-lg overflow-hidden">
            <div 
              className="h-64 bg-cover bg-center relative"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23222"/><circle cx="200" cy="150" r="80" fill="none" stroke="%23fff" stroke-width="2"/><line x1="200" y1="150" x2="200" y2="100" stroke="%23fff" stroke-width="3"/><line x1="200" y1="150" x2="240" y2="150" stroke="%23fff" stroke-width="2"/></svg>')`,
                backgroundPosition: '50% 30%'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div 
                    className="text-white text-2xl font-light tracking-[0.3em] uppercase opacity-90"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    {'LAST REFRESH'.split('').join(' ')}
                  </div>
                  <div className="text-white text-xl font-light mt-4">
                    {lastRefresh}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicator Card */}
          <div className="relative bg-white rounded-lg overflow-hidden">
            <div 
              className="h-64 bg-cover bg-center relative"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23006400"/><circle cx="200" cy="150" r="40" fill="%23fff"/><path d="M 180 150 L 195 165 L 220 135" stroke="%23006400" stroke-width="4" fill="none"/></svg>')`,
                backgroundPosition: '50% 30%'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div 
                    className="text-white text-2xl font-light tracking-[0.3em] uppercase opacity-90"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    {'STATUS'.split('').join(' ')}
                  </div>
                  <div className="text-white text-xl font-light mt-4">
                    AUTO-REFRESH ACTIVE
                  </div>
                  <div className="text-white/70 text-sm mt-2">
                    Updates every 3 seconds
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Full Bleed Image Break */}
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300"><rect width="1200" height="300" fill="%23000"/><rect x="0" y="140" width="1200" height="20" fill="%23333"/><rect x="0" y="180" width="1200" height="20" fill="%23333"/></svg>')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 
            className="text-white text-3xl font-light tracking-[0.3em] uppercase opacity-90"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {'EDITORIAL DESIGN TESTING'.split('').join(' ')}
          </h3>
        </div>
      </div>

      {/* Technical Details Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gray-900 rounded-lg p-8">
          <h4 
            className="text-white text-2xl font-light tracking-[0.2em] uppercase mb-6"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Technical Implementation
          </h4>
          <div className="space-y-4 text-gray-300">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Component Type:</span>
              <span className="text-white">React Functional Component</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Hooks Used:</span>
              <span className="text-white">useState, useEffect</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Refresh Interval:</span>
              <span className="text-white">3000ms (3 seconds)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Design System:</span>
              <span className="text-white">Editorial Luxury with Times New Roman</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Auto-Refresh Status:</span>
              <span className="text-green-400">✓ ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 tracking-wider">
            ARIA'S EDITORIAL LUXURY DESIGN SYSTEM
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Auto-refresh test component created with Times New Roman typography and luxury editorial styling
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AriaTestComponent;