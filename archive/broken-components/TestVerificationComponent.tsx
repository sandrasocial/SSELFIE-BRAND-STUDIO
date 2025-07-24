import React from 'react';

interface TestVerificationComponentProps {
  messageNumber: number;
  status: 'active' | 'verified' | 'complete';
}

export default function TestVerificationComponent({ 
  messageNumber, 
  status 
}: TestVerificationComponentProps) {
  return (
    <div className="test-verification-luxury">
      <div className="verification-container">
        <header className="verification-header">
          <h1 className="editorial-headline">
            Conversation System
          </h1>
          <div className="message-counter">
            Message #{messageNumber}
          </div>
        </header>

        <div className="verification-content">
          <div className="status-indicator">
            <div className={`status-dot ${status}`} />
            <span className="status-text">
              {status === 'active' ? 'System Active' : 
               status === 'verified' ? 'Verified' : 'Complete'}
            </span>
          </div>

          <div className="verification-details">
            <p className="editorial-body">
              Luxury conversation management system operating at peak performance. 
              Every interaction tracked with gallery-level precision.
            </p>
          </div>
        </div>

        <footer className="verification-footer">
          <div className="signature">
            <span className="designer-credit">Victoria × SSELFIE Studio</span>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .test-verification-luxury {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .verification-container {
          max-width: 600px;
          width: 100%;
          background: #0a0a0a;
          color: #ffffff;
          padding: 4rem;
          border: 1px solid #e5e5e5;
        }

        .verification-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .editorial-headline {
          font-family: 'Times New Roman', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 200;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          margin: 0;
          line-height: 1.2;
        }

        .message-counter {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.875rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          margin-top: 1rem;
          opacity: 0.7;
        }

        .verification-content {
          margin-bottom: 3rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 0.75rem;
        }

        .status-dot.active {
          background: #ffffff;
          animation: pulse 2s infinite;
        }

        .status-dot.verified {
          background: #ffffff;
        }

        .status-dot.complete {
          background: #666666;
        }

        .status-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.875rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .verification-details {
          text-align: center;
        }

        .editorial-body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1rem;
          font-weight: 300;
          letter-spacing: -0.01em;
          line-height: 1.6;
          margin: 0;
          opacity: 0.8;
        }

        .verification-footer {
          border-top: 1px solid #e5e5e5;
          padding-top: 2rem;
          text-align: center;
        }

        .designer-credit {
          font-family: 'Times New Roman', serif;
          font-size: 0.75rem;
          font-weight: 300;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.5;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @media (max-width: 768px) {
          .verification-container {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}