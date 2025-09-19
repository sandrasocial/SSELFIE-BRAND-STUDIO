import React from 'react';
import SecureIframe from './SecureIframe';

interface CanvaEmbedProps {
  designId?: string;
  height?: string;
  className?: string;
  title?: string;
}

export default function CanvaEmbed({ 
  designId = "DAGTKvqGqY0", // Default Hair Experience design gallery
  height = "600px",
  className = "w-full",
  title = "Hair & Beauty Design Inspiration"
}: CanvaEmbedProps) {
  const canvaUrl = `https://www.canva.com/design/${designId}/view?embed`;
  
  return (
    <div className={`canva-wrapper ${className}`}>
      <SecureIframe 
        src={canvaUrl}
        title={title}
        height={height}
        className="w-full border-0 rounded-lg"
      />
      
      {/* Fallback for development/testing */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2 font-light">
          Professional design templates powered by Canva
        </p>
        <button
          onClick={() => window.open(canvaUrl, '_blank', 'width=1000,height=700')}
          className="text-xs uppercase tracking-[0.2em] font-light text-blue-600 hover:text-blue-700 transition-colors"
        >
          Open in New Window
        </button>
      </div>
    </div>
  );
}

// Export named variations for different design collections
export const HairStylingGallery = () => (
  <CanvaEmbed
    designId="DAGTKvqGqY0"
    title="Hair Styling Portfolio Gallery - Professional Layouts"
    height="550px"
  />
);

export const BeautyBrandTemplates = () => (
  <CanvaEmbed
    designId="DAFMNwrHr8k"
    title="Beauty Brand Templates - Social Media Ready"
    height="500px"
  />
);

export const SalonMarketingDesigns = () => (
  <CanvaEmbed
    designId="DABCDerFg3h"
    title="Salon Marketing Designs - Professional Presentations"
    height="600px"
  />
);

export const QuickStyleInspiration = () => (
  <CanvaEmbed
    designId="DAXYZabCd4i"
    title="Quick Style Inspiration - Mood Boards & Color Palettes"
    height="400px"
  />
);