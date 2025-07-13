import React from 'react';
import { SandraImages } from '@/lib/sandra-images';

export const PortfolioSection = () => {
  return (
    <section className="portfolio-section" id="portfolio">
      <div className="portfolio-container">
        <div className="portfolio-header">
          <p className="portfolio-label">THE VIBE WE&apos;RE CREATING</p>
          <h2 className="portfolio-title display-font">
            <span className="title-line-1">Confident. Unapologetic.</span>
            <span className="title-line-2">Magnetic.</span>
          </h2>
          <p className="portfolio-description">
            This is how it feels when you stop hiding. When you own your story. When you build something real.
          </p>
          <p className="portfolio-tagline">
            Your phone. Your rules. Your empire.
          </p>
        </div>

        <div className="editorial-grid">
          {/* Feature Story 1 */}
          <div className="grid-item featured">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.laptop1}
                alt="Build your brand with SSELFIE"
                className="portfolio-image object-cover w-full h-full"
              />
              <div className="overlay-content" style={{zIndex: 2}}>
                <h3 className="story-title display-font">Build your brand,</h3>
                <p className="story-subtitle">one SSELFIE at a time</p>
              </div>
            </div>
          </div>

          {/* Story 2 */}
          <div className="grid-item medium">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.laptop2}
                alt="Confidence Transformation"
                className="portfolio-image object-cover w-full h-full"
              />
              <div className="text-overlay">
                <span className="overlay-number">02</span>
                <h4 className="overlay-quote display-font">&ldquo;Stop hiding.&rdquo;</h4>
              </div>
            </div>
          </div>

          {/* Story 3 - Text Block */}
          <div className="grid-item text-block">
            <div className="text-content">
              <h3 className="block-title display-font">REAL</h3>
              <p className="block-subtitle">transformation<br/>starts here</p>
              <span className="block-label">NO FILTERS NEEDED</span>
            </div>
          </div>

          {/* Story 4 */}
          <div className="grid-item square">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.phone1}
                alt="Magnetic Energy"
                className="portfolio-image object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Story 5 - Wide */}
          <div className="grid-item wide">
            <div className="split-content">
              <div className="image-side">
                <img
                  src={SandraImages.editorial.mirror}
                  alt="Own Your Story"
                  className="portfolio-image object-cover w-full h-full"
                />
              </div>
              <div className="text-side">
                <blockquote className="client-quote">
                  <p className="quote-text display-font">
                    &ldquo;Own your story.<br/>Build something<br/>real.&rdquo;
                  </p>
                  <cite className="quote-author">— This is your moment</cite>
                </blockquote>
              </div>
            </div>
          </div>

          {/* Story 6 */}
          <div className="grid-item vertical">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.thinking}
                alt="Empire Builder"
                className="portfolio-image object-cover w-full h-full"
              />
              <div className="vertical-text">
                <span className="vertical-label">EMPIRE ENERGY</span>
              </div>
            </div>
          </div>

          {/* Story 7 - Editorial Feature */}
          <div className="grid-item editorial">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.laughing}
                alt="Sandra's Method"
                className="portfolio-image object-cover w-full h-full"
              />
              <div className="editorial-overlay" style={{zIndex: 2}}>
                <h3 className="editorial-title display-font">THE<br/>SSELFIE<br/>METHOD</h3>
                <p className="editorial-subtitle">Your phone + My strategy<br/>= Your empire</p>
              </div>
            </div>
          </div>
        </div>

        <div className="portfolio-cta">
          <a href="/transformations" className="view-more-link">
            <span className="link-text">Join The Vibe</span>
            <span className="link-arrow">→</span>
          </a>
        </div>
      </div>

    </section>
  );
};