import React from 'react';
import SecureIframe from './SecureIframe';

interface MentimeterEmbedProps {
  presentationId?: string;
  height?: string;
  className?: string;
  title?: string;
}

export default function MentimeterEmbed({ 
  presentationId = "aldn3b6egbvhm8up3oeg6pqnc8xwo8ks", // Default Hair Experience presentation
  height = "600px",
  className = "w-full",
  title = "Hair & Beauty Trends Survey"
}: MentimeterEmbedProps) {
  const mentiUrl = `https://www.mentimeter.com/app/presentation/${presentationId}`;
  
  return (
    <div className={`mentimeter-wrapper ${className}`}>
      <SecureIframe 
        src={mentiUrl}
        title={title}
        height={height}
        className="w-full border-0 rounded-lg"
      />
      
      {/* Fallback for development/testing */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2 font-light">
          Interactive survey powered by Mentimeter
        </p>
        <button
          onClick={() => window.open(mentiUrl, '_blank', 'width=800,height=600')}
          className="text-xs uppercase tracking-[0.2em] font-light text-blue-600 hover:text-blue-700 transition-colors"
        >
          Open in New Window
        </button>
      </div>
    </div>
  );
}

// Export named variations for different use cases
export const HairTrendsSurvey = () => (
  <MentimeterEmbed
    presentationId="aldn3b6egbvhm8up3oeg6pqnc8xwo8ks"
    title="Hair & Beauty Trends Survey - Vote on Latest Styles"
    height="500px"
  />
);

export const StylePreferencesPoll = () => (
  <MentimeterEmbed
    presentationId="b2m4c7frgpwim9vq4pfh7rqod9yxp9lt"
    title="Style Preferences Poll - What's Your Look?"
    height="400px"
  />
);

export const QuickMoodBoard = () => (
  <MentimeterEmbed
    presentationId="c3n5d8gshrxjn0wr5qgi8srpea0yq0mu"
    title="Quick Mood Board - Choose Your Inspiration"
    height="350px"
  />
);
