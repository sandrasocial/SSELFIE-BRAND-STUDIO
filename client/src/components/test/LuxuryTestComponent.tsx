import React from 'react';

/**
 * LuxuryTestComponent - Editorial Luxury Design Component
 * Created by Olga for testing the Visual Editor "View Code" functionality
 * Features luxury styling and editorial design principles
 */

interface LuxuryTestComponentProps {
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export const LuxuryTestComponent: React.FC<LuxuryTestComponentProps> = ({
  title = "Luxury Editorial Component",
  subtitle = "Editorial Design Excellence", 
  description = "This component demonstrates luxury editorial design with Times New Roman typography, elegant spacing, and sophisticated visual hierarchy.",
  className = ""
}) => {
  return (
    <div className={`luxury-editorial-container ${className}`}>
      {/* Hero Section with Editorial Typography */}
      <div className="editorial-hero bg-white py-24 px-8 text-center">
        <h1 
          className="editorial-title text-6xl font-light text-black mb-6 tracking-wide"
          style={{ fontFamily: 'Times New Roman, serif', letterSpacing: '0.05em' }}
        >
          {title}
        </h1>
        
        <h2 
          className="editorial-subtitle text-2xl font-light text-gray-600 mb-12 tracking-widest uppercase"
          style={{ fontFamily: 'Times New Roman, serif', letterSpacing: '0.3em' }}
        >
          {subtitle}
        </h2>
        
        <div className="editorial-divider w-24 h-px bg-black mx-auto mb-12"></div>
        
        <p 
          className="editorial-description text-lg leading-relaxed text-gray-800 max-w-3xl mx-auto"
          style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.8' }}
        >
          {description}
        </p>
      </div>

      {/* Editorial Image Gallery Section */}
      <div className="editorial-gallery bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gallery Item 1 */}
            <div className="editorial-card group cursor-pointer">
              <div className="aspect-w-4 aspect-h-5 bg-white mb-6 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm tracking-wider">IMAGE PLACEHOLDER</span>
                </div>
              </div>
              <h3 
                className="text-xl font-light text-black mb-2 tracking-wide group-hover:text-gray-600 transition-colors"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Editorial Excellence
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sophisticated design principles meet modern digital craftsmanship.
              </p>
            </div>

            {/* Gallery Item 2 */}
            <div className="editorial-card group cursor-pointer">
              <div className="aspect-w-4 aspect-h-5 bg-white mb-6 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm tracking-wider">IMAGE PLACEHOLDER</span>
                </div>
              </div>
              <h3 
                className="text-xl font-light text-black mb-2 tracking-wide group-hover:text-gray-600 transition-colors"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Luxury Aesthetics
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Timeless elegance through carefully considered visual hierarchy.
              </p>
            </div>

            {/* Gallery Item 3 */}
            <div className="editorial-card group cursor-pointer">
              <div className="aspect-w-4 aspect-h-5 bg-white mb-6 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm tracking-wider">IMAGE PLACEHOLDER</span>
                </div>
              </div>
              <h3 
                className="text-xl font-light text-black mb-2 tracking-wide group-hover:text-gray-600 transition-colors"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Design Philosophy
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Where minimalism meets maximum impact through thoughtful restraint.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Quote Section */}
      <div className="editorial-quote bg-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote 
            className="text-3xl font-light text-black leading-relaxed mb-8 italic"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            "True luxury lies not in ostentation, but in the perfection of simplicity and the eloquence of restraint."
          </blockquote>
          <cite className="text-sm text-gray-600 tracking-widest uppercase">
            — Editorial Design Principles
          </cite>
        </div>
      </div>

      {/* Editorial Footer */}
      <div className="editorial-footer bg-black text-white py-16 px-8 text-center">
        <h3 
          className="text-2xl font-light mb-4 tracking-wide"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Crafted with Precision
        </h3>
        <p className="text-gray-300 text-sm tracking-wider">
          Every element designed with intention, every detail considered with care.
        </p>
        
        <div className="mt-8 flex justify-center space-x-8">
          <button className="editorial-button bg-transparent border border-white text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300">
            Explore More
          </button>
          <button className="editorial-button bg-white text-black px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-200 transition-all duration-300">
            Get Started
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .luxury-editorial-container {
          font-family: 'Times New Roman', serif;
        }
        
        .editorial-card {
          transition: transform 0.3s ease;
        }
        
        .editorial-card:hover {
          transform: translateY(-4px);
        }
        
        .editorial-button {
          transition: all 0.3s ease;
          letter-spacing: 0.2em;
        }
        
        .editorial-divider {
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .editorial-title {
            font-size: 3rem;
          }
          
          .editorial-subtitle {
            font-size: 1.25rem;
            letter-spacing: 0.2em;
          }
        }
      `}</style>
    </div>
  );
};

export default LuxuryTestComponent;

/*
 * This component features:
 * - Times New Roman typography throughout
 * - Elegant letter spacing and tracking
 * - Sophisticated color palette (black, white, grays)
 * - Editorial magazine-style layout
 * - Responsive design principles
 * - Hover effects and transitions
 * - Clean visual hierarchy
 * - Luxury aesthetic principles
 * 
 * Usage:
 * <LuxuryTestComponent 
 *   title="Custom Title"
 *   subtitle="Custom Subtitle"
 *   description="Custom description..."
 *   className="additional-styles"
 * />
 */