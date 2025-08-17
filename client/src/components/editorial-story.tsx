import React from 'react';

interface EditorialStoryProps {
  headline: string;
  paragraphs: string[];
  imageSrc: string;
  imageAlt: string;
  backgroundColor?: string;
  textColor?: string;
  reversed?: boolean;
  button?: {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary';
  };
}

export const EditorialStory: React.FC<EditorialStoryProps> = ({
  headline,
  paragraphs,
  imageSrc,
  imageAlt,
  backgroundColor = '#f5f5f5',
  textColor = '#0a0a0a',
  reversed = false,
  button
}) => {
  return (
    <section className="section-padding" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center ${reversed ? 'lg:grid-flow-col-dense' : ''}`}>
          
          {/* Text Content - Editorial Hierarchy */}
          <div className={`${reversed ? 'lg:col-start-2' : ''} editorial-text-layout`}>
            
            {/* Main Headline */}
            <h2 
              className="editorial-headline"
              style={{ 
                fontWeight: 300, 
                letterSpacing: '-0.01em',
                color: textColor,
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                lineHeight: 1.1,
                marginBottom: '2rem'
              }}
            >
              {headline}
            </h2>
            
            {/* Subheadline */}
            <h3 
              className="editorial-subheadline system-text"
              style={{ 
                fontSize: '1.5rem',
                lineHeight: 1.4,
                fontWeight: 300,
                color: textColor,
                marginBottom: '3rem'
              }}
            >
              One year ago my marriage ended. Single mom, three kids, zero plan.
            </h3>

            {/* Tagline with divider */}
            <div className="editorial-tagline" style={{ marginBottom: '3rem' }}>
              <p 
                className="system-text"
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 300,
                  color: textColor === '#0a0a0a' ? '#666666' : textColor,
                  marginBottom: '1.5rem'
                }}
              >
                But I had a phone. And I figured out that was all I needed.
              </p>
              
              {/* Horizontal divider line */}
              <div 
                style={{
                  width: '80px',
                  height: '1px',
                  backgroundColor: '#e5e5e5',
                  margin: '2rem 0'
                }}
              />
            </div>

            {/* Conclusion in italic */}
            <div className="editorial-conclusion">
              <p 
                className="system-text"
                style={{
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: textColor === '#0a0a0a' ? '#666666' : textColor,
                  lineHeight: 1.6
                }}
              >
                Today: A business that actually works.<br />
                Now: Teaching you exactly how I did it.
              </p>
            </div>

            {button && (
              <div className="mt-12 magazine-cta">
                <a
                  href={button.href}
                  className="editorial-link"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: textColor,
                    textDecoration: 'none',
                    borderBottom: '1px solid currentColor',
                    paddingBottom: '2px',
                    fontWeight: 300
                  }}
                >
                  {button.text}
                </a>
              </div>
            )}
          </div>

          {/* Image */}
          <div className={`${reversed ? 'lg:col-start-1' : ''}`}>
            <div className="aspect-[4/5] lg:aspect-[3/4] overflow-hidden">
              <img 
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover editorial-hover"
                loading="lazy"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default EditorialStory;