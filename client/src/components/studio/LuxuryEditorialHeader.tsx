import React from 'react';

// Luxury editorial header component for SSELFIE Studio
export const LuxuryEditorialHeader: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => {
  return (
    <header className="relative py-12 px-6 border-b border-gray-200 mb-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 tracking-tight leading-none mb-4" 
            style={{ fontFamily: 'Times New Roman' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="font-serif text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
             style={{ fontFamily: 'Times New Roman' }}>
            {subtitle}
          </p>
        )}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-16 h-px bg-gray-200"></div>
        </div>
      </div>
    </header>
  );
}