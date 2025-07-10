import React from 'react';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { EditorialImageBreak } from '@/components/editorial-image-break';
import { MoodboardGallery } from '@/components/moodboard-gallery';
import { WorkspaceInterface } from '@/components/workspace-interface';
import { PricingCard } from '@/components/pricing-card';
import { SandraImages } from '@/components/sandra-image-library';
import { Navigation } from '@/components/navigation';
import { EditorialStory } from '@/components/editorial-story';
import { useLocation } from 'wouter';

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    // Direct users to pricing/checkout first (payment-first journey)
    setLocation('/pricing');
  };

  const handlePricing = (plan: string) => {
    setLocation(`/checkout?plan=sselfie-studio`);
  };

  const moodboardItems = [
    { src: SandraImages.journey.rockBottom, alt: "Sandra's journey - Before", span: 4, aspectRatio: "square" },
    { src: SandraImages.journey.building, alt: "Sandra building", span: 4, aspectRatio: "square" },
    { src: SandraImages.journey.today, alt: "Sandra today", span: 4, aspectRatio: "square" },
  ] as const;

  const aiGalleryItems = [
    { src: SandraImages.aiGallery[0], alt: "AI transformation result", span: 3, aspectRatio: "tall" },
    { 
      src: SandraImages.aiGallery[1], 
      alt: "AI transformation result", 
      span: 6, 
      aspectRatio: "wide",
      overlayTitle: "94+ AI Images",
      overlayText: "Available in your gallery"
    },
    { src: SandraImages.aiGallery[2], alt: "AI transformation result", span: 3, aspectRatio: "tall" },
    { src: SandraImages.aiGallery[3], alt: "AI transformation result", span: 4, aspectRatio: "square" },
    { src: SandraImages.aiGallery[4], alt: "AI transformation result", span: 4, aspectRatio: "square" },
    { src: SandraImages.aiGallery[5], alt: "AI transformation result", span: 4, aspectRatio: "square" },
  ] as const;

  return (
    <div className="bg-[var(--mid-gray)] text-[var(--luxury-black)]">
      <Navigation />
      {/* Hero Section */}
      <HeroFullBleed
        backgroundImage={SandraImages.hero.homepage}
        tagline="IT STARTS WITH YOUR SELFIES"
        title="SSELFIE"
        subtitle="STUDIO"
        ctaText="Let's do this"
        onCtaClick={handleGetStarted}
        alignment="center"
        fullHeight={true}
      />

      {/* Sandra's Origin Story - Editorial Layout */}
      <EditorialStory
        headline="Okay, here's what actually happened..."
        paragraphs={[]} // Content is now handled within the component
        imageSrc={SandraImages.editorial.laptop1}
        imageAlt="Sandra working, not posed"
        backgroundColor="#ffffff"
        reversed={true}
      />

      {/* Editorial Moodboard Break */}
      <MoodboardGallery items={moodboardItems} />

      {/* How It Works Section */}
      <section className="bg-[var(--mid-gray)] section-padding-responsive">
        <div className="container-editorial">
          <div className="text-center mb-12 lg:mb-20">
            <p className="eyebrow-responsive text-[var(--soft-gray)] mb-6 lg:mb-8">
              HERE'S THE THING
            </p>
            <h2 className="editorial-headline-responsive text-[var(--luxury-black)] mb-6 lg:mb-8">
              No fancy equipment.<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>No design degree.
            </h2>
            <p className="body-text-responsive text-[var(--soft-gray)] container-cta font-light">
              Just strategy that actually works.
            </p>
          </div>
          
          <WorkspaceInterface onLaunch={() => setLocation('/pricing')} />
        </div>
      </section>

      {/* Editorial Image Break 2 */}
      <EditorialImageBreak
        src={SandraImages.editorial.mirror}
        alt="AI transformation in progress"
        height="large"
      />

      {/* Simple Process Section */}
      <section className="bg-white section-padding-responsive">
        <div className="container-moodboard">
          <div className="text-center mb-12 lg:mb-20">
            <p className="eyebrow-responsive text-[var(--soft-gray)] mb-6 lg:mb-8">
              HOW IT WORKS
            </p>
            <h2 className="editorial-headline-responsive text-[var(--luxury-black)] mb-8 lg:mb-12">
              You don't need a plan.<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>You need one brave post.
            </h2>
          </div>
          
          <div className="feature-grid-responsive lg:grid-cols-3 gap-8 lg:gap-16">
            {/* Step 1 */}
            <div className="text-center-mobile">
              <div className="aspect-editorial-responsive mb-6 lg:mb-8 overflow-hidden">
                <img 
                  src={SandraImages.editorial.phone2}
                  alt="Just your phone" 
                  className="w-full h-full object-cover editorial-hover"
                />
              </div>
              <h3 className="editorial-subhead-responsive text-[var(--luxury-black)] mb-3 lg:mb-4">
                Just your phone
              </h3>
              <p className="body-text-responsive text-[var(--soft-gray)] font-light leading-relaxed">
                Upload 10-15 selfies. AI creates 30 editorial images that actually look like you.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center-mobile">
              <div className="aspect-editorial-responsive mb-6 lg:mb-8 overflow-hidden">
                <img 
                  src={SandraImages.editorial.laptop2}
                  alt="Your story matters" 
                  className="w-full h-full object-cover editorial-hover"
                />
              </div>
              <h3 className="editorial-subhead-responsive text-[var(--luxury-black)] mb-3 lg:mb-4">
                Your story matters
              </h3>
              <p className="body-text-responsive text-[var(--soft-gray)] font-light leading-relaxed">
                Pick a template. Add your story. Everything else is handled.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center-mobile">
              <div className="aspect-editorial-responsive mb-6 lg:mb-8 overflow-hidden">
                <img 
                  src={SandraImages.editorial.laughing}
                  alt="Show up as her" 
                  className="w-full h-full object-cover editorial-hover"
                />
              </div>
              <h3 className="editorial-subhead-responsive text-[var(--luxury-black)] mb-3 lg:mb-4">
                Show up as her
              </h3>
              <p className="body-text-responsive text-[var(--soft-gray)] font-light leading-relaxed">
                Your business is live. You focus on what you do best - being yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Gallery Showcase */}
      <MoodboardGallery items={aiGalleryItems} />

      {/* Pricing Section */}
      <section className="bg-[var(--luxury-black)] section-padding-responsive">
        <div className="container-moodboard">
          <div className="text-center mb-12 lg:mb-20">
            <p className="eyebrow-responsive text-white/60 mb-6 lg:mb-8">
              START HERE
            </p>
            <h2 className="editorial-headline-responsive text-white mb-8 lg:mb-12">
              Your mess is your message.<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Let's turn it into money.
            </h2>
          </div>
          
          <div className="feature-grid-responsive lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="flex justify-center">
              <PricingCard
                title="SSELFIE STUDIO"
                price="€97"
                period="per month"
                description="The world's first AI selfie personal branding system. Train your AI, generate 300 photos monthly, build your brand with Sandra AI. Everything you need in one place."
                imageUrl={SandraImages.editorial.laptop1}
                ctaText="START YOUR TRANSFORMATION"
                onCtaClick={() => handlePricing('sselfie-studio')}
                isPopular={true}
                badge="Complete System"
                className="bg-[var(--editorial-gray)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Quote Break */}
      <section className="bg-white section-padding">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <blockquote className="editorial-headline text-5xl md:text-7xl text-[var(--luxury-black)] leading-tight" style={{ fontWeight: 300, letterSpacing: '-0.01em' }}>
            "This didn't start as a business.<br />
            It started as survival."
          </blockquote>
          <p className="eyebrow-text text-[var(--soft-gray)] mt-12 system-text">
            SANDRA SIGURJONSDOTTIR
          </p>
        </div>
      </section>

      {/* Final Editorial Break */}
      <EditorialImageBreak
        src={SandraImages.journey.today}
        alt="Sandra today - The revolution"
        height="large"
      />

      {/* Call to Action Section */}
      <section className="bg-[var(--luxury-black)] section-padding">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="editorial-headline text-6xl md:text-8xl font-light text-white mb-8">
            Ready to build<br />the revolution?
          </h2>
          <p className="text-xl text-white/70 mb-16 max-w-2xl mx-auto leading-relaxed system-text font-light">
            This isn't just a business. This is the future of how women build brands and businesses.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={() => handlePricing('sselfie-studio')}
              className="bg-white text-[var(--luxury-black)] px-8 py-4 eyebrow-text hover:bg-white/90 transition-all duration-300 system-text"
            >
              Start Your Transformation (€97)
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--mid-gray)] py-16 border-t border-[var(--accent-line)]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center">
            <h3 className="editorial-headline text-3xl font-light text-[var(--luxury-black)] mb-4">
              SSELFIE Studio
            </h3>
            <p className="text-sm text-[var(--soft-gray)] system-text font-light mb-8">
              Revolutionary AI Personal Brand Platform
            </p>
            <p className="eyebrow-text text-[var(--soft-gray)] system-text">
              Let's build something real together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
