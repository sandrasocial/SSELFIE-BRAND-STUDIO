import React from 'react';
import { SandraImages } from '../lib/sandra-images';

export const PortfolioSection = () => {
  return (
    <section className="portfolio-section" id="portfolio">
      <div className="portfolio-container">
        <div className="portfolio-header">
          <p className="portfolio-label">THIS IS WHAT WE'RE BUILDING</p>
          <h2 className="portfolio-title display-font">
            <span className="title-line-1">Stop hiding.</span>
            <span className="title-line-2">Start showing up</span>
            <span className="title-line-3"><em>as her.</em></span>
          </h2>
          <p className="portfolio-description">
            The woman you're becoming doesn't wait for permission. She doesn't need a photographer. 
            She just needs her phone and my strategy.
          </p>
          <p className="portfolio-tagline">
            Your mess. Your message. Your empire.
          </p>
        </div>

        <div className="editorial-grid">
          {/* Feature Story 1 */}
          <div className="grid-item featured">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.laptop1}
                alt="Build your empire with SSELFIE"
                className="portfolio-image object-cover w-full h-full"
              />
              <div className="overlay-content" style={{zIndex: 2}}>
                <h3 className="story-title display-font">Future you</h3>
                <p className="story-subtitle">is waiting</p>
              </div>
            </div>
          </div>

          {/* Story 2 */}
          <div className="grid-item medium">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.laptop2}
                alt="CEO Energy"
                className="portfolio-image object-cover w-full h-full"
              />
              <div className="text-overlay">
                <span className="overlay-number">01</span>
                <h4 className="overlay-quote display-font">"CEO energy"</h4>
              </div>
            </div>
          </div>

          {/* Story 3 - Text Block */}
          <div className="grid-item text-block">
            <div className="text-content">
              <h3 className="block-title display-font">120K</h3>
              <p className="block-subtitle">followers<br/>90 days</p>
              <span className="block-label">MY ACTUAL RESULTS</span>
            </div>
          </div>

          {/* Story 4 */}
          <div className="grid-item square">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.phone1}
                alt="Professional brand photos"
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
                  alt="Transform your brand"
                  className="portfolio-image object-cover w-full h-full"
                />
              </div>
              <div className="text-side">
                <blockquote className="client-quote">
                  <p className="quote-text display-font">
                    "No plan.<br/>Just one<br/>brave post."
                  </p>
                  <cite className="quote-author">— How it started</cite>
                </blockquote>
              </div>
            </div>
          </div>

          {/* Story 6 */}
          <div className="grid-item vertical">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.thinking}
                alt="Build something real"
                className="portfolio-image object-cover w-full h-full"
              />
              <div className="vertical-text">
                <span className="vertical-label">SINGLE MOM ENERGY</span>
              </div>
            </div>
          </div>

          {/* Story 7 - Editorial Feature */}
          <div className="grid-item editorial">
            <div className="image-wrapper">
              <img
                src={SandraImages.editorial.laughing}
                alt="The SSELFIE Method"
                className="portfolio-image object-cover w-full h-full"
              />
              <div className="editorial-overlay" style={{zIndex: 2}}>
                <h3 className="editorial-title display-font">YOUR<br/>PHONE<br/>YOUR RULES</h3>
                <p className="editorial-subtitle">AI that knows your angles<br/>= Photos that build empires</p>
              </div>
            </div>
          </div>
        </div>

        <div className="portfolio-cta">
          <a href="#" onClick={(e) => { e.preventDefault(); window.handleGetStarted && window.handleGetStarted(); }} className="view-more-link">
            <span className="link-text">Ready? Let's go</span>
            <span className="link-arrow">→</span>
          </a>
        </div>
      </div>

      <style jsx="true">{`
        /* Portfolio Section */
        .portfolio-section {
          padding: 0;
          background: #ffffff;
        }

        .portfolio-container {
          max-width: 1600px;
          margin: 0 auto;
        }

        .portfolio-header {
          padding: 100px 40px 80px;
          text-align: center;
        }

        .portfolio-label {
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 48px;
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 300;
        }

        .portfolio-title {
          font-size: clamp(48px, 7vw, 100px);
          line-height: 0.85;
          font-family: 'Times New Roman', serif;
          font-weight: 200;
          color: #0a0a0a;
        }

        .title-line-1,
        .title-line-2,
        .title-line-3 {
          display: block;
        }

        .title-line-2 {
          margin-left: 10%;
        }

        .title-line-3 {
          margin-left: 25%;
          opacity: 0.6;
        }

        .title-line-3 em {
          font-style: italic;
          font-weight: 200;
        }

        .portfolio-description {
          font-size: 17px;
          margin: 40px auto;
          opacity: 0.8;
          max-width: 650px;
          font-family: 'Inter', system-ui, sans-serif;
          color: #0a0a0a;
          font-weight: 300;
          line-height: 1.6;
        }

        .portfolio-tagline {
          font-size: 14px;
          font-style: italic;
          opacity: 0.5;
          margin-top: 24px;
          font-family: 'Times New Roman', serif;
          color: #0a0a0a;
        }

        /* Editorial Grid */
        .editorial-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: 100px;
          gap: 1px;
          background: #f0f0f0;
        }

        .grid-item {
          position: relative;
          overflow: hidden;
          background: #ffffff;
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
          transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .grid-item:hover .portfolio-image {
          transform: scale(1.07);
        }

        .grid-item {
          cursor: pointer;
          transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .grid-item:hover {
          z-index: 10;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        /* Overlay Content */
        .overlay-content {
          position: absolute;
          bottom: 40px;
          left: 40px;
          color: #ffffff;
          z-index: 2;
        }

        .story-title {
          font-size: 56px;
          margin-bottom: 8px;
          font-family: 'Times New Roman', serif;
          font-weight: 200;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }

        .story-subtitle {
          font-size: 14px;
          opacity: 0.9;
          letter-spacing: 0.1em;
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 300;
        }

        /* Text Overlay */
        .text-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: rgba(255, 255, 255, 0.97);
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .grid-item:hover .text-overlay {
          opacity: 1;
        }

        .overlay-number {
          font-size: 140px;
          font-weight: 100;
          line-height: 1;
          opacity: 0.08;
          position: absolute;
          top: 20px;
          right: 30px;
          font-family: 'Times New Roman', serif;
        }

        .overlay-quote {
          font-size: 36px;
          text-align: center;
          line-height: 1.2;
          font-family: 'Times New Roman', serif;
          font-weight: 200;
        }

        /* Text Content */
        .text-content {
          text-align: center;
          padding: 30px;
        }

        .block-title {
          font-size: 64px;
          line-height: 1;
          margin-bottom: 8px;
          font-family: 'Times New Roman', serif;
          font-weight: 200;
        }

        .block-subtitle {
          font-size: 15px;
          margin-bottom: 16px;
          opacity: 0.7;
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 300;
        }

        .block-label {
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          opacity: 0.5;
          font-family: 'Inter', system-ui, sans-serif;
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
        }

        .text-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #fafafa;
        }

        .quote-text {
          font-size: 32px;
          line-height: 1.2;
          margin-bottom: 16px;
          font-family: 'Times New Roman', serif;
          font-weight: 200;
        }

        .quote-author {
          font-size: 11px;
          letter-spacing: 0.2em;
          opacity: 0.6;
          font-family: 'Inter', system-ui, sans-serif;
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
          font-size: 11px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #ffffff;
          opacity: 0.9;
          font-family: 'Inter', system-ui, sans-serif;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
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
          font-size: 80px;
          line-height: 0.85;
          margin-bottom: 20px;
          font-family: 'Times New Roman', serif;
          font-weight: 200;
          text-shadow: 0 4px 30px rgba(0,0,0,0.5);
        }

        .editorial-subtitle {
          font-size: 15px;
          opacity: 0.9;
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 300;
          letter-spacing: 0.05em;
        }

        /* Portfolio CTA */
        .portfolio-cta {
          text-align: center;
          padding: 80px 40px;
        }

        .view-more-link {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .view-more-link:hover {
          transform: translateY(-3px);
        }

        .link-text {
          font-size: 11px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #0a0a0a;
          border-bottom: 1px solid #0a0a0a;
          padding-bottom: 3px;
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 300;
        }

        .link-arrow {
          font-size: 18px;
          color: #0a0a0a;
          transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .view-more-link:hover .link-arrow {
          transform: translateX(10px);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .editorial-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 1px;
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
            padding: 60px 24px 50px;
          }

          .portfolio-title {
            font-size: clamp(36px, 8vw, 72px);
          }

          .editorial-title {
            font-size: 48px;
          }

          .story-title {
            font-size: 36px;
          }

          .overlay-quote {
            font-size: 28px;
          }
        }
      `}</style>
    </section>
  );
};