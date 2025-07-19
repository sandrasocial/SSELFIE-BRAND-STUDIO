import React from 'react';

export default function LuxuryLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border border-black mb-8 animate-spin border-t-transparent mx-auto"></div>
        <h2 
          className="text-3xl font-serif text-black tracking-wide animate-pulse"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Loading Sandra's Empire...
        </h2>
      </div>
    </div>
  );
}