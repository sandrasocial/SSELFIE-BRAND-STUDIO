import React from 'react';

interface LuxuryHeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundImage?: string;
  onCtaClick: () => void;
}

export const LuxuryHero: React.FC<LuxuryHeroProps> = ({
  headline,
  subheadline,
  ctaText,
  backgroundImage,
  onCtaClick
}) => {
  return (
    <section className="luxury-hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-headline">
            {headline}
          </h1>
          <p className="hero-subheadline">
            {subheadline}
          </p>
          <button 
            className="hero-cta"
            onClick={onCtaClick}
            aria-label={ctaText}
          >
            {ctaText}
          </button>
        </div>
        {backgroundImage && (
          <div className="hero-image">
            <img 
              src={backgroundImage} 
              alt="SSELFIE luxury branding"
              loading="eager"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .luxury-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: #ffffff;
          overflow: hidden;
        }

        .hero-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          width: 100%;
        }

        .hero-content {
          z-index: 2;
        }

        .hero-headline {
          font-family: 'Times New Roman', serif;
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 400;
          line-height: 1.1;
          color: #0a0a0a;
          margin: 0 0 1.5rem 0;
          letter-spacing: -0.02em;
        }

        .hero-subheadline {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          font-size: 1.125rem;
          line-height: 1.6;
          color: #666666;
          margin: 0 0 2.5rem 0;
          max-width: 500px;
        }

        .hero-cta {
          background: #0a0a0a;
          color: #ffffff;
          border: none;
          padding: 1rem 2.5rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .hero-cta:hover {
          background: #333333;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .hero-image {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
          border-radius: 4px;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        @media (max-width: 768px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .hero-image {
            order: -1;
            aspect-ratio: 16/10;
          }

          .hero-headline {
            font-size: clamp(2.5rem, 8vw, 3.5rem);
          }

          .hero-subheadline {
            margin: 0 auto 2rem auto;
          }
        }

        @media (max-width: 480px) {
          .luxury-hero {
            min-height: 90vh;
          }

          .hero-container {
            padding: 0 1rem;
          }

          .hero-cta {
            padding: 0.875rem 2rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </section>
  );
};

export default LuxuryHero;