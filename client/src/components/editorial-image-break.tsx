import React from 'react';

interface EditorialImageBreakProps {
  src: string;
  alt: string;
  height?: 'small' | 'medium' | 'large';
  overlay?: boolean;
  overlayText?: string;
}

export const EditorialImageBreak: React.FC<EditorialImageBreakProps> = ({
  src,
  alt,
  height = 'medium',
  overlay = false,
  overlayText
}) => {
  const heightClass = {
    small: 'h-[30vh]',
    medium: 'h-[40vh]',
    large: 'h-[60vh]'
  }[height];

  return (
    <section className={`w-full ${heightClass} overflow-hidden relative`}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover editorial-hover"
        loading="lazy"
      />
      
      {overlay && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          {overlayText && (
            <p className="text-white text-center text-xl md:text-2xl font-light max-w-2xl px-8 system-text">
              {overlayText}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
