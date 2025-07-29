import { SandraImages } from "@/lib/sandra-images";

interface HeroFullBleedProps {
  variant: 'homepage' | 'about' | 'pricing' | 'method' | 'contact' | 'ai' | 'dashboard' | 'agents';
  title: string;
  subtitle?: string;
  tagline?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  customImage?: string;
}

export function HeroFullBleed({ 
  variant, 
  title, 
  subtitle, 
  tagline = "The Icelandic Selfie Queen",
  description,
  ctaText,
  ctaLink,
  customImage 
}: HeroFullBleedProps) {
  const heroImage = customImage || SandraImages.hero[variant];

  return (
    <section className="relative w-full h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background Image - Full Bleed */}
      <div className="absolute inset-0 opacity-40">
        <img 
          src={heroImage}
          alt=""
          className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
        />
      </div>
      
      {/* Content - Editorial Typography matching uploaded template */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-8 flex flex-col justify-end min-h-screen pb-20">
        {/* Tagline - Exactly like uploaded template */}
        <p className="text-xs tracking-[0.4em] uppercase text-white/60 mb-8 font-light">
          {tagline}
        </p>
        
        {/* Main Title - Times New Roman with letter spacing from template */}
        <div className="mb-8">
          {subtitle ? (
            // Two-line format like "SANDRA / SIGURJONSDOTTIR"
            <div className="hero-name-stacked">
              <h1 className="font-serif text-[clamp(4rem,10vw,9rem)] leading-[1] font-light text-white tracking-[0.5em] mb-[-10px]">
                {title.toUpperCase()}
              </h1>
              <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[1] font-light text-white tracking-[0.3em]">
                {subtitle.toUpperCase()}
              </h1>
            </div>
          ) : (
            // Single line format
            <h1 className="font-serif text-[clamp(4rem,12vw,10rem)] leading-[0.8] font-light text-white tracking-[0.5em]">
              {title.toUpperCase().split(' ').map((word, index) => (
                <span key={index}>
                  {word}
                  {index < title.split(' ').length - 1 && <br />}
                </span>
              ))}
            </h1>
          )}
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-lg max-w-2xl mx-auto text-white/80 font-light leading-relaxed mb-12">
            {description}
          </p>
        )}
        
        {/* CTA - Minimal style from template */}
        {ctaText && (
          <a 
            href={ctaLink || '#'} 
            className="inline-block text-white text-xs tracking-[0.3em] uppercase font-light pb-2 border-b border-white/30 hover:border-white/60 transition-all duration-300"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}