import React from 'react';
import './LuxuryLandingPage.css';

const LuxuryLandingPage = () => {
  return (
    <div className="luxury-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-headline">
            Transform Your Vision Into 
            <span className="editorial-accent"> Editorial Excellence</span>
          </h1>
          <p className="hero-subtext">
            Where luxury meets authenticity. Where your story becomes 
            a magnetic force that attracts your ideal clients effortlessly.
          </p>
          <div className="hero-cta">
            <button className="primary-button">Start Your Transformation</button>
            <button className="secondary-button">View Our Work</button>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="/api/placeholder/800/600" 
            alt="Luxury editorial portrait showcasing transformation"
            className="hero-img"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-headline">The SSELFIE Method</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-number">01</div>
              <h3 className="feature-title">TRAIN</h3>
              <p className="feature-description">
                Master the art of authentic self-presentation with our 
                signature methodology that transforms how you show up.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-number">02</div>
              <h3 className="feature-title">STYLE</h3>
              <p className="feature-description">
                Curate your visual identity with luxury editorial aesthetics 
                that speak directly to your ideal client's desires.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-number">03</div>
              <h3 className="feature-title">SHOOT</h3>
              <p className="feature-description">
                Create gallery-quality content that positions you as the 
                premium choice in your industry.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-number">04</div>
              <h3 className="feature-title">BUILD</h3>
              <p className="feature-description">
                Launch with a digital presence that converts browsers into 
                buyers through magnetic attraction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section">
        <div className="container">
          <h2 className="section-headline">Client Transformations</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <img 
                src="/api/placeholder/300/300" 
                alt="Client transformation before and after"
                className="testimonial-image"
              />
              <blockquote className="testimonial-quote">
                "This isn't just photography - it's a complete brand evolution. 
                I went from invisible to irresistible."
              </blockquote>
              <cite className="testimonial-author">— Sarah M., Creative Director</cite>
            </div>
            <div className="testimonial-card">
              <img 
                src="/api/placeholder/300/300" 
                alt="Client transformation before and after"
                className="testimonial-image"
              />
              <blockquote className="testimonial-quote">
                "My bookings doubled within 30 days. The editorial approach 
                completely changed how clients perceive my value."
              </blockquote>
              <cite className="testimonial-author">— Jessica L., Business Coach</cite>
            </div>
            <div className="testimonial-card">
              <img 
                src="/api/placeholder/300/300" 
                alt="Client transformation before and after"
                className="testimonial-image"
              />
              <blockquote className="testimonial-quote">
                "Finally, images that match the premium service I provide. 
                This investment paid for itself immediately."
              </blockquote>
              <cite className="testimonial-author">— Amanda R., Consultant</cite>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-headline">Ready to Transform?</h2>
            <p className="cta-subtext">
              Join the exclusive circle of entrepreneurs who've discovered 
              the power of editorial luxury branding.
            </p>
            <button className="cta-button">Book Your Discovery Call</button>
            <p className="cta-note">Limited spots available monthly</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LuxuryLandingPage;