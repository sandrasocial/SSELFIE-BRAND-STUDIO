import React from 'react';

interface EditorialShowcaseProps {
  title?: string;
  subtitle?: string;
  imageAlt?: string;
}

const EditorialShowcase: React.FC<EditorialShowcaseProps> = ({
  title = "FROM ROCK BOTTOM TO EMPIRE",
  subtitle = "The SSELFIE Story",
  imageAlt = "Sandra's transformation journey"
}) => {
  return (
    <div className="editorial-showcase">
      <style jsx>{`
        .editorial-showcase {
          background: #ffffff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .hero-section {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 80vh;
          background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
        }

        .content-panel {
          padding: 8rem 4rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #ffffff;
          position: relative;
        }

        .image-panel {
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }

        .hero-title {
          font-family: 'Times New Roman', serif;
          font-size: 4.5rem;
          font-weight: 700;
          line-height: 0.9;
          color: #0a0a0a;
          margin-bottom: 2rem;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-family: 'Times New Roman', serif;
          font-size: 1.5rem;
          color: #666;
          margin-bottom: 3rem;
          font-style: italic;
        }

        .editorial-quote {
          font-family: 'Times New Roman', serif;
          font-size: 1.25rem;
          line-height: 1.6;
          color: #0a0a0a;
          border-left: 4px solid #0a0a0a;
          padding-left: 2rem;
          margin: 3rem 0;
          max-width: 400px;
        }

        .signature {
          font-family: 'Times New Roman', serif;
          font-size: 1rem;
          color: #666;
          font-style: italic;
          margin-top: 2rem;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.3) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-text {
          color: #ffffff;
          font-family: 'Times New Roman', serif;
          font-size: 2rem;
          text-align: center;
          font-style: italic;
        }

        .luxury-accent {
          position: absolute;
          top: 2rem;
          right: 2rem;
          width: 100px;
          height: 2px;
          background: #0a0a0a;
        }

        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          
          .content-panel {
            padding: 4rem 2rem;
          }
          
          .hero-title {
            font-size: 3rem;
          }
          
          .image-panel {
            min-height: 50vh;
          }
        }
      `}</style>

      <div className="hero-section">
        <div className="content-panel">
          <div className="luxury-accent"></div>
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          
          <blockquote className="editorial-quote">
            "Every transformation begins with a single, brave decision to see yourself differently."
          </blockquote>
          
          <p className="signature">— Sandra's Editorial Philosophy</p>
        </div>
        
        <div className="image-panel">
          <div className="image-overlay">
            <div className="image-text">
              Visual Excellence<br />
              Editorial Mastery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorialShowcase;