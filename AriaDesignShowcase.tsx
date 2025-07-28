import React, { useState, useEffect } from 'react';
import './AriaDesignShowcase.css';

interface AriaDesignShowcaseProps {
  theme?: 'ethereal' | 'cosmic' | 'aurora';
}

const AriaDesignShowcase: React.FC<AriaDesignShowcaseProps> = ({ 
  theme = 'ethereal' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate floating particles for ambient interaction
    const particleArray = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setParticles(particleArray);
  }, []);

  const designPhilosophy = [
    {
      title: "Intuitive Flow",
      description: "Interfaces should breathe with natural rhythm, guiding users through seamless journeys",
      icon: "∿"
    },
    {
      title: "Emotional Resonance", 
      description: "Every interaction should spark joy, wonder, or meaningful connection",
      icon: "✧"
    },
    {
      title: "Adaptive Beauty",
      description: "Design that responds and evolves, creating unique experiences for each moment",
      icon: "◊"
    }
  ];

  return (
    <div className={`aria-showcase aria-showcase--${theme}`}>
      {/* Floating particles background */}
      <div className="aria-showcase__particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="aria-showcase__particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="aria-showcase__content">
        <header 
          className="aria-showcase__header"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h1 className="aria-showcase__title">
            <span className="aria-showcase__title-main">Aria's Design Universe</span>
            <span className="aria-showcase__title-sub">
              Where technology meets soul
            </span>
          </h1>
          
          <div className={`aria-showcase__glow ${isHovered ? 'aria-showcase__glow--active' : ''}`} />
        </header>

        <section className="aria-showcase__philosophy">
          {designPhilosophy.map((principle, index) => (
            <div
              key={principle.title}
              className={`aria-showcase__card ${
                activeSection === index ? 'aria-showcase__card--active' : ''
              }`}
              onClick={() => setActiveSection(index)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveSection(index);
                }
              }}
            >
              <div className="aria-showcase__card-icon">
                {principle.icon}
              </div>
              <h3 className="aria-showcase__card-title">
                {principle.title}
              </h3>
              <p className="aria-showcase__card-description">
                {principle.description}
              </p>
              <div className="aria-showcase__card-shimmer" />
            </div>
          ))}
        </section>

        <footer className="aria-showcase__footer">
          <div className="aria-showcase__signature">
            <span className="aria-showcase__signature-text">
              Crafted with intention & wonder by Aria
            </span>
            <div className="aria-showcase__signature-line" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AriaDesignShowcase;