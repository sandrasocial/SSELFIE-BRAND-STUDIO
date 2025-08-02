import React from 'react';

interface TestClaudeAccessProps {
  className?: string;
}

const TestClaudeAccess: React.FC<TestClaudeAccessProps> = ({ className = '' }) => {
  return (
    <div className={`luxury-test-container ${className}`}>
      {/* Hero Section */}
      <section className="luxury-hero">
        <h1 className="luxury-headline">
          Claude Access
        </h1>
        <p className="luxury-subtitle">
          Editorial Luxury Design System
        </p>
      </section>

      {/* Content Grid */}
      <section className="luxury-grid">
        <div className="luxury-card">
          <h2 className="luxury-card-title">
            Component Architecture
          </h2>
          <p className="luxury-body-text">
            Sophisticated TypeScript implementation with complete type safety and editorial design principles.
          </p>
        </div>

        <div className="luxury-card">
          <h2 className="luxury-card-title">
            Typography Excellence
          </h2>
          <p className="luxury-body-text">
            Times New Roman typography hierarchy creating visual sophistication and readability perfection.
          </p>
        </div>

        <div className="luxury-card">
          <h2 className="luxury-card-title">
            Color Sophistication
          </h2>
          <p className="luxury-body-text">
            Curated palette of black, white, and editorial gray creating timeless luxury aesthetics.
          </p>
        </div>
      </section>

      {/* Status Section */}
      <section className="luxury-status">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span className="status-text">System Operational</span>
        </div>
        <p className="luxury-caption">
          Claude AI integration successfully established with full workspace access
        </p>
      </section>

      <style jsx>{`
        .luxury-test-container {
          min-height: 100vh;
          background-color: #ffffff;
          padding: 80px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .luxury-hero {
          text-align: center;
          margin-bottom: 120px;
          padding-bottom: 60px;
          border-bottom: 1px solid #f5f5f5;
        }

        .luxury-headline {
          font-family: 'Times New Roman', serif;
          font-size: 64px;
          font-weight: 400;
          color: #0a0a0a;
          margin: 0 0 24px 0;
          letter-spacing: -1px;
          line-height: 1.1;
        }

        .luxury-subtitle {
          font-family: 'Times New Roman', serif;
          font-size: 24px;
          font-weight: 300;
          color: #666666;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .luxury-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 60px;
          margin-bottom: 120px;
        }

        .luxury-card {
          background-color: #ffffff;
          border: 1px solid #f5f5f5;
          padding: 60px 40px;
          transition: all 0.3s ease;
        }

        .luxury-card:hover {
          border-color: #0a0a0a;
          transform: translateY(-2px);
        }

        .luxury-card-title {
          font-family: 'Times New Roman', serif;
          font-size: 28px;
          font-weight: 400;
          color: #0a0a0a;
          margin: 0 0 24px 0;
          letter-spacing: -0.5px;
        }

        .luxury-body-text {
          font-family: 'Times New Roman', serif;
          font-size: 18px;
          font-weight: 300;
          color: #333333;
          line-height: 1.6;
          margin: 0;
        }

        .luxury-status {
          text-align: center;
          padding-top: 60px;
          border-top: 1px solid #f5f5f5;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          background-color: #28a745;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-text {
          font-family: 'Times New Roman', serif;
          font-size: 18px;
          font-weight: 400;
          color: #0a0a0a;
          letter-spacing: 0.5px;
        }

        .luxury-caption {
          font-family: 'Times New Roman', serif;
          font-size: 16px;
          font-weight: 300;
          color: #666666;
          margin: 0;
          font-style: italic;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .luxury-test-container {
            padding: 60px 20px;
          }

          .luxury-headline {
            font-size: 48px;
          }

          .luxury-subtitle {
            font-size: 20px;
          }

          .luxury-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .luxury-card {
            padding: 40px 30px;
          }

          .luxury-card-title {
            font-size: 24px;
          }

          .luxury-body-text {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default TestClaudeAccess;