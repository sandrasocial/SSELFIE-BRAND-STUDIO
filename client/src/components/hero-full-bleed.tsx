import React from 'react';
import { SandraImages } from '../lib/sandra-images';

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
      className={`relative w-screen ${fullHeight ? 'h-screen' : 'min-h-[500px] sm:min-h-[600px] md:min-h-[700px]'} flex items-center overflow-hidden`}
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
          className="w-full h-full object-cover editorial-hover"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10 bg-black"
        style={{ opacity: overlay }}
      />
      
      {/* Content Container - positioned lower with responsive spacing */}
      <div className="relative z-20 w-full h-full flex items-end justify-center">
        <div className={`max-w-6xl mx-auto px-6 sm:px-8 md:px-12 ${alignment === 'center' ? 'text-center' : 'text-left-desktop'} pb-12 sm:pb-16 md:pb-24 lg:pb-32`}>
          
          {/* Top Tagline */}
          {tagline && (
            <p className="eyebrow-responsive text-white/60 mb-4 sm:mb-6 font-light font-inter">
              {tagline}
            </p>
          )}
          
          {/* Main Title - HUGE & STRETCHED with responsive scaling */}
          <h1 className="font-times text-[clamp(2.2rem,9vw,9rem)] leading-[0.9] font-extralight tracking-[0.05em] sm:tracking-[0.2em] md:tracking-[0.4em] uppercase text-white mb-2 sm:mb-4 break-words px-2">
            {title}
          </h1>
          
          {/* Subtitle - Responsive scaling */}
          {subtitle && (
            <h2 className="font-times text-[clamp(1rem,3vw,2.5rem)] leading-none font-extralight tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase text-white mb-8 sm:mb-10 lg:mb-12 px-2">
              {subtitle}
            </h2>
          )}
          
          {/* CTA - Responsive button styling */}
          {ctaText && (ctaLink || onCtaClick) && (
            <button 
              onClick={handleCtaClick}
              className="cta-button-responsive border-none bg-transparent text-white/90 border-b border-white/30 transition-all duration-300 hover:border-white hover:tracking-[0.35em] cursor-pointer"
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