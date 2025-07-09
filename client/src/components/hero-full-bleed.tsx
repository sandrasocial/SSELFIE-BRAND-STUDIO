import React from 'react';
import { SandraImages } from '@/lib/sandra-images';

interface HeroFullBleedProps {
  backgroundImage: string;
  tagline?: string; // The small top text
  title: string | React.ReactNode;
  subtitle?: string; // For long last names or secondary text
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  overlay?: number;
  alignment?: 'left' | 'center';
  fullHeight?: boolean;
}

export const HeroFullBleed: React.FC<HeroFullBleedProps> = ({
  backgroundImage,
  tagline,
  title,
  subtitle,
  ctaText,
  ctaLink,
  onCtaClick,
  overlay = 0.6,
  alignment = 'center',
  fullHeight = true
}) => {
  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else if (ctaLink) {
      window.location.href = ctaLink;
    }
  };

  return (
    <section 
      className={`relative w-screen ${fullHeight ? 'h-screen' : 'min-h-[600px]'} flex items-center overflow-hidden`}
      style={{ 
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        maxWidth: '100vw'
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-black/50" />
      
      {/* Content Container - positioned lower */}
      <div className="relative z-20 w-full h-full flex items-end justify-center">
        <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 ${alignment === 'center' ? 'text-center' : ''} pb-16 md:pb-24 lg:pb-32`}>
          
          {/* Top Tagline */}
          {tagline && (
            <p className="text-[11px] md:text-xs tracking-[0.4em] uppercase text-white mb-6 font-light font-inter">
              {tagline}
            </p>
          )}
          
          {/* Main Title - HUGE & STRETCHED */}
          <h1 className="text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] font-light text-white mb-4 tracking-[0.3em] md:tracking-[0.4em] break-words" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
            {title}
          </h1>
          
          {/* Subtitle - Bigger and more prominent */}
          {subtitle && (
            <h2 className="text-[clamp(2rem,6vw,4rem)] leading-[0.9] font-light text-white mb-10 tracking-[0.2em] md:tracking-[0.3em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
              {subtitle}
            </h2>
          )}
          
          {/* CTA - Minimal Line Style */}
          {ctaText && (ctaLink || onCtaClick) && (
            <button 
              onClick={handleCtaClick}
              className="inline-block font-inter text-xs tracking-[0.3em] uppercase text-white/90 pb-2 border-b border-white/30 transition-all duration-300 hover:border-white hover:tracking-[0.35em] bg-transparent cursor-pointer"
            >
              {ctaText}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

// Usage Examples Component
export const HeroExamples = () => {
  return (
    <>
      {/* Homepage - Power Pose */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.laptop1}
        tagline="Turn your selfies into a CEO shot"
        title="SSELFIE"
        subtitle="STUDIO"
        ctaText="START YOUR JOURNEY"
        ctaLink="/pricing"
      />
      
      {/* About Page - Vulnerable but Strong */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.mirror}
        tagline="The Icelandic Selfie Queen"
        title="SANDRA"
        subtitle="SIGURJONSDOTTIR"
        ctaText="MY STORY"
        ctaLink="#story"
      />
      
      {/* Course Page - Teaching Mode */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.thinking}
        tagline="90 days to your first 100K"
        title="SSELFIE"
        subtitle="METHOD"
        ctaText="ENROLL NOW"
        ctaLink="/pricing"
      />
      
      {/* Stories Page - Contemplative Editorial Shot */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.laughing}
        tagline="From real women who did it"
        title="STORIES"
        ctaText="READ MORE"
        ctaLink="#stories"
      />
      
      {/* Contact - Approachable */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.phone1}
        tagline="Let's build something real together"
        title="CONTACT"
      />
      
      {/* Transformation Page - Current Sandra */}
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.laptop2}
        tagline="Your journey starts here"
        title="TRANSFORMATION"
        subtitle="ACADEMY"
        ctaText="GET STARTED"
        ctaLink="/academy"
      />
    </>
  );
};