import { FC } from 'react';
interface EditorialImageBreakProps {
  src: string;
  alt: string;
  height?: 'small' | 'medium' | 'large';
  overlay?: boolean;
  overlayText?: string;
}

export const EditorialImageBreak: FC<EditorialImageBreakProps> = ({
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
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          {overlayText && (
            <blockquote 
              className="text-white text-center text-2xl md:text-3xl lg:text-4xl font-light max-w-4xl px-8 md:px-12 leading-tight tracking-[-0.02em] italic"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              "{overlayText}"
            </blockquote>
          )}
        </div>
      )}
    </section>
  );
};
