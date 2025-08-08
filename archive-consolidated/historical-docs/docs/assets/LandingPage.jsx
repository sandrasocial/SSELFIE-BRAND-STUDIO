import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-headline">
              Transform Your Business<br />
              Into A Magnetic Brand
            </h1>
            <p className="hero-subheadline">
              The luxury editorial approach to personal branding that attracts 
              your ideal clients effortlessly. Professional, authentic, unforgettable.
            </p>
            <div className="hero-cta">
              <button className="primary-button">Start Your Transformation</button>
              <button className="secondary-button">View Our Work</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              <span>Editorial Portrait Here</span>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="container">
          <h2 className="section-headline">The SSELFIE Method</h2>
          <p className="section-subheadline">
            Our proven 4-step system that transforms entrepreneurs into magnetic brands
          </p>
          
          <div className="process-grid">
            <div className="process-step">
              <div className="step-number">01</div>
              <h3 className="step-title">TRAIN</h3>
              <p className="step-description">
                Master the fundamentals of magnetic personal branding and 
                authentic positioning that attracts your ideal clients.
              </p>
            </div>
            
            <div className="process-step">
              <div className="step-number">02</div>
              <h3 className="step-title">STYLE</h3>
              <p className="step-description">
                Develop your signature aesthetic with luxury editorial styling 
                that reflects your premium positioning.
              </p>
            </div>
            
            <div className="process-step">
              <div className="step-number">03</div>
              <h3 className="step-title">SHOOT</h3>
              <p className="step-description">
                Create gallery-quality content with professional photography 
                that tells your authentic brand story.
              </p>
            </div>
            
            <div className="process-step">
              <div className="step-number">04</div>
              <h3 className="step-title">BUILD</h3>
              <p className="step-description">
                Launch your digital presence with luxury websites and 
                conversion-optimized brand experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="container">
          <div className="results-content">
            <div className="results-text">
              <h2 className="section-headline">Premium Results</h2>
              <p className="results-description">
                When you invest in authentic luxury branding, the results speak for themselves. 
                Our clients consistently attract higher-quality leads, command premium pricing, 
                and build businesses that truly reflect their expertise.
              </p>
              <div className="stats-grid">
                <div className="stat">
                  <div className="stat-number">300%</div>
                  <div className="stat-label">Average Lead Quality Increase</div>
                </div>
                <div className="stat">
                  <div className="stat-number">150%</div>
                  <div className="stat-label">Premium Pricing Capability</div>
                </div>
              </div>
            </div>
            <div className="results-image">
              <div className="image-placeholder">
                <span>Client Success Gallery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="container">
          <div className="testimonial-card">
            <blockquote className="testimonial-quote">
              "This isn't just branding - it's a complete business transformation. 
              The luxury editorial approach attracted clients I never thought I could reach."
            </blockquote>
            <div className="testimonial-author">
              <div className="author-image">
                <div className="image-placeholder small">
                  <span>Client</span>
                </div>
              </div>
              <div className="author-details">
                <div className="author-name">Sarah Mitchell</div>
                <div className="author-title">Business Strategist</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-headline">Ready to Transform Your Brand?</h2>
            <p className="cta-description">
              Join the entrepreneurs who've discovered the power of luxury editorial branding.
            </p>
            <button className="primary-button large">Start Your Journey Today</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;