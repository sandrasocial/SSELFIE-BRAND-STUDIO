import React from 'react';
import { SandraImages } from '@/lib/sandra-images';

interface EnhancedHeroProps {
  backgroundImage?: string;
  title: string;
  tagline?: string;
  subtitle?: string;
  ctaText?: string;
  ctaSecondaryText?: string;
  onCtaClick?: () => void;
  onCtaSecondaryClick?: () => void;
  fullHeight?: boolean;
  overlay?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  showStats?: boolean;
  stats?: Array<{ number: string; label: string; }>;
}

export function EnhancedHero({
  backgroundImage = SandraImages.editorial.laptop1,
  title,
  tagline,
  subtitle,
  ctaText,
  ctaSecondaryText,
  onCtaClick,
  onCtaSecondaryClick,
  fullHeight = true,
  overlay = true,
  textAlign = 'left',
  showStats = false,
  stats = []
}: EnhancedHeroProps) {
  return (
    <section 
      className={`relative bg-cover bg-center ${fullHeight ? 'h-screen' : 'h-[70vh]'} flex items-end`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {overlay && (
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      )}
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16">
        <div className={`max-w-2xl ${textAlign === 'center' ? 'mx-auto text-center' : textAlign === 'right' ? 'ml-auto text-right' : ''}`}>
          {tagline && (
            <p className="text-xs uppercase tracking-wider text-white opacity-90 mb-4">
              {tagline}
            </p>
          )}
          
          <h1 className="text-6xl md:text-8xl font-light text-white mb-6 leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-xl text-white opacity-90 mb-8 font-light leading-relaxed">
              {subtitle}
            </p>
          )}
          
          {showStats && stats.length > 0 && (
            <div className="flex space-x-12 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-light text-white" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {stat.number}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-white opacity-75">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex space-x-6">
            {ctaText && onCtaClick && (
              <button
                onClick={onCtaClick}
                className="bg-white text-[#0a0a0a] px-8 py-4 text-xs uppercase tracking-wider hover:bg-opacity-90 transition-colors"
              >
                {ctaText}
              </button>
            )}
            
            {ctaSecondaryText && onCtaSecondaryClick && (
              <button
                onClick={onCtaSecondaryClick}
                className="border border-white text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-white hover:text-[#0a0a0a] transition-colors"
              >
                {ctaSecondaryText}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function EditorialHero({
  backgroundImage = SandraImages.editorial.laptop1,
  title,
  subtitle,
  children
}: {
  backgroundImage?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section 
      className="relative bg-cover bg-center h-[50vh] flex items-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-light text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-lg text-white opacity-90 max-w-2xl mx-auto font-light">
            {subtitle}
          </p>
        )}
        
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function MinimalHero({
  title,
  subtitle,
  ctaText,
  onCtaClick,
  backgroundColor = '#f5f5f5'
}: {
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  backgroundColor?: string;
}) {
  return (
    <section 
      className="py-24 text-center"
      style={{ backgroundColor }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-light text-[#0a0a0a] mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-xl text-[#666666] mb-8 font-light leading-relaxed">
            {subtitle}
          </p>
        )}
        
        {ctaText && onCtaClick && (
          <button
            onClick={onCtaClick}
            className="bg-[#0a0a0a] text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors"
          >
            {ctaText}
          </button>
        )}
      </div>
    </section>
  );
}