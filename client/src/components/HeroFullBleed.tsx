interface HeroFullBleedProps {
  backgroundImage: string;
  tagline?: string;
  title: string | React.ReactNode;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
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
  overlay = 0.4,
  alignment = 'center',
  fullHeight = true
}) => {
  const handleCTAClick = (e: React.MouseEvent) => {
    if (ctaLink?.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(ctaLink);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className={`relative w-full ${fullHeight ? 'h-screen' : 'min-h-[600px]'} flex items-center overflow-hidden bg-luxury-black`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt=""
          className="w-full h-full object-cover editorial-hover"
        />
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlay }}
        />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className={`max-w-6xl mx-auto px-8 ${alignment === 'center' ? 'text-center' : ''}`}>
          
          {/* Top Tagline */}
          {tagline && (
            <p className="text-xs tracking-ultra-wide uppercase text-white/60 mb-8 system-font font-light">
              {tagline}
            </p>
          )}
          
          {/* Main Title - Ultra-Stretched */}
          <h1 className="hero-title text-white text-[clamp(4rem,12vw,10rem)] mb-8">
            {title}
          </h1>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-2xl tracking-ultra-wide uppercase text-white/80 mb-12 system-font font-light">
              {subtitle}
            </p>
          )}
          
          {/* CTA */}
          {ctaText && ctaLink && (
            <a 
              href={ctaLink}
              onClick={handleCTAClick}
              className="editorial-cta"
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
