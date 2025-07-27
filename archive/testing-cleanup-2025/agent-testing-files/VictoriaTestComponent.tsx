import React from 'react';

export default function VictoriaTestComponent() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-light text-black uppercase tracking-wide" 
            style={{ fontFamily: 'Times New Roman, serif' }}>
          Victoria Agent Test
        </h1>
        
        <button 
          className="px-12 py-4 bg-black text-white font-light uppercase tracking-widest border-none hover:bg-gray-900 transition-colors duration-300"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          onClick={() => console.log('Victoria Agent Test Working!')}
        >
          Victoria Agent Test Working!
        </button>
        
        <p className="text-gray-600 font-light max-w-md mx-auto leading-relaxed"
           style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          This component demonstrates our luxury design system: Times New Roman headlines, 
          system fonts for body text, black/white palette, and editorial spacing.
        </p>
      </div>
    </div>
  );
}