import React from 'react';

interface WorkingComponentProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

const WorkingComponent: React.FC<WorkingComponentProps> = ({
  title = "Editorial Excellence",
  subtitle = "Luxury design standards in motion",
  children,
  className = ""
}) => {
  return (
    <div className={`working-component ${className}`}>
      <div className="working-component__container">
        {/* Editorial Header */}
        <header className="working-component__header">
          <h1 className="working-component__title">
            {title}
          </h1>
          {subtitle && (
            <p className="working-component__subtitle">
              {subtitle}
            </p>
          )}
        </header>

        {/* Content Area */}
        <main className="working-component__content">
          {children || (
            <div className="working-component__placeholder">
              <div className="placeholder-grid">
                <div className="placeholder-item"></div>
                <div className="placeholder-item"></div>
                <div className="placeholder-item"></div>
              </div>
              <p className="placeholder-text">
                Ready for luxury content integration
              </p>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .working-component {
          min-height: 100vh;
          background: #ffffff;
          color: #0a0a0a;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .working-component__container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 40px;
        }

        .working-component__header {
          text-align: center;
          margin-bottom: 80px;
          border-bottom: 1px solid #f5f5f5;
          padding-bottom: 60px;
        }

        .working-component__title {
          font-family: 'Times New Roman', Times, serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 24px 0;
          color: #0a0a0a;
        }

        .working-component__subtitle {
          font-size: 1.125rem;
          font-weight: 300;
          letter-spacing: 0.02em;
          color: #666;
          margin: 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .working-component__content {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .working-component__placeholder {
          text-align: center;
          max-width: 500px;
        }

        .placeholder-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .placeholder-item {
          height: 120px;
          background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }

        .placeholder-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .placeholder-text {
          font-size: 1rem;
          color: #888;
          font-weight: 300;
          letter-spacing: 0.02em;
          margin: 0;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .working-component__container {
            padding: 60px 20px;
          }
          
          .working-component__header {
            margin-bottom: 60px;
            padding-bottom: 40px;
          }
          
          .placeholder-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .placeholder-item {
            height: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkingComponent;