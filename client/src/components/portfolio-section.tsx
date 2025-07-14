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
          <a href="/checkout" className="view-more-link">
            <span className="link-text">Join The Vibe</span>
            <span className="link-arrow">→</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        /* Portfolio Section */
        .portfolio-section {
          padding: 0;
          background: #ffffff;
        }
        
        .portfolio-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .portfolio-header {
          padding: 120px 60px 80px;
          text-align: center;
        }
        
        .portfolio-label {
          font-size: 11px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 48px;
          font-family: 'Inter, system-ui, sans-serif';
        }
        
        .portfolio-title {
          font-size: clamp(60px, 8vw, 120px);
          line-height: 0.9;
          font-family: 'Times New Roman, serif';
          font-weight: 300;
          color: #0a0a0a;
        }
        
        .title-line-1,
        .title-line-2,
        .title-line-3 {
          display: block;
        }
        
        .title-line-2 {
          margin-left: 15%;
        }
        
        .title-line-3 {
          margin-left: 30%;
        }
        
        .title-line-3 em {
          font-style: italic;
          font-weight: 300;
        }
        
        .portfolio-description {
          font-size: 18px;
          margin: 32px 0;
          opacity: 0.7;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          font-family: 'Inter, system-ui, sans-serif';
          color: #0a0a0a;
        }
        
        .portfolio-tagline {
          font-size: 16px;
          font-style: italic;
          opacity: 0.6;
          margin-top: 24px;
          font-family: 'Inter, system-ui, sans-serif';
          color: #0a0a0a;
        }
        
        /* Editorial Grid */
        .editorial-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: 100px;
          gap: 2px;
          padding: 0 2px;
        }
        
        .grid-item {
          position: relative;
          overflow: hidden;
          background: #f5f5f5;
        }
        
        .grid-item.featured {
          grid-column: span 8;
          grid-row: span 6;
        }
        
        .grid-item.medium {
          grid-column: span 4;
          grid-row: span 4;
        }
        
        .grid-item.text-block {
          grid-column: span 4;
          grid-row: span 2;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          color: #ffffff;
        }
        
        .grid-item.square {
          grid-column: span 4;
          grid-row: span 4;
        }
        
        .grid-item.wide {
          grid-column: span 8;
          grid-row: span 3;
        }
        
        .grid-item.vertical {
          grid-column: span 4;
          grid-row: span 5;
        }
        
        .grid-item.editorial {
          grid-column: span 12;
          grid-row: span 5;
        }
        
        .image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .portfolio-image {
          transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .grid-item:hover .portfolio-image {
          transform: scale(1.05);
        }
        
        .grid-item {
          position: relative;
          overflow: hidden;
          background: #f5f5f5;
          cursor: pointer;
          transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .grid-item:hover {
          transform: translateY(-4px);
        }
        
        .grid-item.text-block:hover {
          transform: translateY(-2px);
          background: #ffffff;
          color: #0a0a0a;
        }
        
        /* Overlay Content */
        .overlay-content {
          position: absolute;
          bottom: 40px;
          left: 40px;
          color: #ffffff;
          z-index: 2;
          transform: translateY(20px);
          opacity: 0.8;
          transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .grid-item:hover .overlay-content {
          transform: translateY(0);
          opacity: 1;
        }
        
        .story-label {
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0.8;
          display: block;
          margin-bottom: 16px;
          font-family: 'Inter, system-ui, sans-serif';
        }
        
        .story-title {
          font-size: 48px;
          margin-bottom: 8px;
          font-family: 'Times New Roman, serif';
          font-weight: 300;
        }
        
        .story-subtitle {
          font-size: 14px;
          opacity: 0.8;
          letter-spacing: 0.05em;
          font-family: 'Inter, system-ui, sans-serif';
        }
        
        /* Text Overlay */
        .text-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
          backdrop-filter: blur(10px);
        }
        
        .grid-item:hover .text-overlay {
          opacity: 1;
        }
        
        .overlay-number {
          font-size: 120px;
          font-weight: 300;
          line-height: 1;
          opacity: 0.1;
          position: absolute;
          top: 20px;
          right: 20px;
          transition: all 0.6s ease;
          font-family: 'Times New Roman, serif';
        }
        
        .grid-item:hover .overlay-number {
          opacity: 0.2;
          transform: scale(1.1);
        }
        
        .overlay-quote {
          font-size: 32px;
          text-align: center;
          line-height: 1.2;
          transform: translateY(20px);
          transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
          font-family: 'Times New Roman, serif';
          font-weight: 300;
        }
        
        .grid-item:hover .overlay-quote {
          transform: translateY(0);
        }
        
        /* Text Content */
        .text-content {
          text-align: center;
          padding: 40px;
        }
        
        .block-title {
          font-size: 72px;
          line-height: 1;
          margin-bottom: 8px;
          font-family: 'Times New Roman, serif';
          font-weight: 300;
        }
        
        .block-subtitle {
          font-size: 16px;
          margin-bottom: 16px;
          opacity: 0.8;
          font-family: 'Inter, system-ui, sans-serif';
        }
        
        .block-label {
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0.6;
          font-family: 'Inter, system-ui, sans-serif';
        }
        
        /* Split Content */
        .split-content {
          display: flex;
          height: 100%;
        }
        
        .image-side,
        .text-side {
          flex: 1;
          position: relative;
          transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .text-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #f5f5f5;
        }
        
        .grid-item.wide:hover .text-side {
          background: #ffffff;
          transform: translateX(5px);
        }
        
        .grid-item.wide:hover .image-side {
          transform: translateX(-5px);
        }
        
        .quote-text {
          font-size: 28px;
          line-height: 1.3;
          margin-bottom: 16px;
          transform: translateY(10px);
          opacity: 0.9;
          transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
          font-family: 'Times New Roman, serif';
          font-weight: 300;
        }
        
        .grid-item.wide:hover .quote-text {
          transform: translateY(0);
          opacity: 1;
        }
        
        .quote-author {
          font-size: 12px;
          letter-spacing: 0.1em;
          opacity: 0.7;
          font-family: 'Inter, system-ui, sans-serif';
        }
        
        /* Vertical Text */
        .vertical-text {
          position: absolute;
          top: 50%;
          right: 20px;
          transform: translateY(-50%) rotate(90deg);
          transform-origin: center;
        }
        
        .vertical-label {
          font-size: 12px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #ffffff;
          opacity: 0.8;
          font-family: 'Inter, system-ui, sans-serif';
        }
        
        /* Editorial Overlay */
        .editorial-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #ffffff;
          z-index: 2;
        }
        
        .editorial-title {
          font-size: 72px;
          line-height: 0.9;
          margin-bottom: 16px;
          font-family: 'Times New Roman, serif';
          font-weight: 300;
        }
        
        .editorial-subtitle {
          font-size: 16px;
          opacity: 0.8;
          font-family: 'Inter, system-ui, sans-serif';
        }
        
        /* Portfolio CTA */
        .portfolio-cta {
          text-align: center;
          padding: 80px 60px;
        }
        
        .view-more-link {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .view-more-link:hover {
          transform: translateY(-2px);
        }
        
        .link-text {
          font-size: 12px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #0a0a0a;
          border-bottom: 1px solid #0a0a0a;
          padding-bottom: 2px;
          font-family: 'Inter, system-ui, sans-serif';
          font-weight: 300;
        }
        
        .link-arrow {
          font-size: 16px;
          color: #0a0a0a;
          transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .view-more-link:hover .link-arrow {
          transform: translateX(8px);
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .editorial-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          
          .grid-item.featured {
            grid-column: span 6;
            grid-row: span 4;
          }
          
          .grid-item.medium {
            grid-column: span 6;
            grid-row: span 3;
          }
          
          .grid-item.text-block {
            grid-column: span 6;
            grid-row: span 2;
          }
          
          .grid-item.square {
            grid-column: span 3;
            grid-row: span 3;
          }
          
          .grid-item.wide {
            grid-column: span 6;
            grid-row: span 4;
          }
          
          .split-content {
            flex-direction: column;
          }
          
          .grid-item.vertical {
            grid-column: span 3;
            grid-row: span 4;
          }
          
          .grid-item.editorial {
            grid-column: span 6;
            grid-row: span 4;
          }
          
          .portfolio-header {
            padding: 80px 30px 60px;
          }
          
          .portfolio-title {
            font-size: clamp(40px, 8vw, 80px);
          }
          
          .editorial-title {
            font-size: 48px;
          }
          
          .story-title {
            font-size: 32px;
          }
          
          .overlay-quote {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
};