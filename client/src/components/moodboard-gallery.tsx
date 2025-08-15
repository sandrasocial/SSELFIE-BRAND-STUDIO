import React from 'react';
import { EditorialImage } from './sandra-image-library';

interface MoodboardItem {
  src: string;
  alt: string;
  span: 3 | 4 | 6 | 8 | 12;
  aspectRatio?: 'square' | 'wide' | 'tall';
  overlayText?: string;
  overlayTitle?: string;
}

interface MoodboardGalleryProps {
  items: MoodboardItem[];
  className?: string;
}

export const MoodboardGallery: React.FC<MoodboardGalleryProps> = ({
  items,
  className = ""
}) => {
  return (
    <section className={`portfolio-grid bg-[var(--editorial-gray)] p-2 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className={`grid-item span-${item.span} ${item.aspectRatio ? `aspect-${item.aspectRatio}` : 'aspect-square'}`}>
          <img 
            src={item.src} 
            alt={item.alt} 
            className="w-full h-full object-cover editorial-hover"
            loading="lazy"
          />
          
          {(item.overlayText || item.overlayTitle) && (
            <div className="text-overlay flex items-center justify-center">
              <div className="text-center">
                {item.overlayTitle && (
                  <h3 className="editorial-headline text-4xl font-light text-[var(--luxury-black)] mb-4">
                    {item.overlayTitle}
                  </h3>
                )}
                {item.overlayText && (
                  <p className="text-[var(--soft-gray)] system-text">
                    {item.overlayText}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
};
