import React, { useState, createContext, useContext } from 'react';
import { useAuth } from '../hooks/use-auth';
import { MemberNavigation } from '../components/member-navigation';
import { PhotoStudio } from '../components/brand-studio/PhotoStudio';
import { StoryStudio } from '../components/brand-studio/StoryStudio';

// Context for sharing data between Photo and Story studios
interface BrandStudioContextType {
  activeTab: 'photo' | 'story';
  setActiveTab: (tab: 'photo' | 'story') => void;
  handoffData: {
    conceptCard?: any;
    fromPhoto?: boolean;
  } | null;
  setHandoffData: (data: any) => void;
  clearHandoffData: () => void;
}

const BrandStudioContext = createContext<BrandStudioContextType | null>(null);

export const useBrandStudio = () => {
  const context = useContext(BrandStudioContext);
  if (!context) {
    throw new Error('useBrandStudio must be used within BrandStudioProvider');
  }
  return context;
};

export default function BrandStudioPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'photo' | 'story'>('photo');
  const [handoffData, setHandoffData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive monitoring
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const clearHandoffData = () => setHandoffData(null);

  const contextValue: BrandStudioContextType = {
    activeTab,
    setActiveTab,
    handoffData,
    setHandoffData,
    clearHandoffData
  };

  return (
    <>
      {/* Luxury Brand Studio CSS */}
      <style jsx global>{`
        :root {
          --luxury-black: #000000;
          --pure-white: #ffffff;
          --editorial-gray: #f9f9f9;
          --body-gray: #666666;
          --accent-line: #e0e0e0;
          --overlay-black: rgba(0, 0, 0, 0.6);
          --space-sm: 16px;
          --space-md: 24px;
          --space-lg: 32px;
          --space-xl: 48px;
          --text-base: 16px;
          --text-lg: 18px;
          --text-xl: 20px;
          --text-2xl: 24px;
          --text-4xl: 36px;
          --text-6xl: 60px;
        }

        .brand-studio-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          font-weight: 300;
          color: var(--luxury-black);
          line-height: 1.7;
          font-size: var(--text-base);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .luxury-eyebrow {
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: var(--body-gray);
          margin-bottom: var(--space-lg);
        }

        .section-title {
          font-family: 'Times New Roman', serif;
          font-weight: 200;
          line-height: 0.9;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: var(--space-md);
          font-size: clamp(var(--text-4xl), 6vw, var(--text-6xl));
        }

        .spaced-title {
          font-family: 'Times New Roman', serif;
          font-weight: 200;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: var(--space-md);
          font-size: clamp(var(--text-lg), 3vw, var(--text-xl));
          display: block;
        }

        .body-large {
          font-size: clamp(var(--text-lg), 2.5vw, var(--text-xl));
          line-height: 1.6;
          font-weight: 300;
          max-width: 700px;
          color: var(--body-gray);
        }

        .body-elegant {
          font-size: clamp(var(--text-base), 2vw, var(--text-lg));
          line-height: 1.8;
          font-weight: 300;
          max-width: 600px;
          color: var(--body-gray);
        }

        .luxury-btn {
          display: inline-block;
          padding: var(--space-md) var(--space-lg);
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid var(--luxury-black);
          color: var(--luxury-black);
          background: transparent;
          transition: all 400ms ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          z-index: 1;
          border-radius: 4px;
        }

        .luxury-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: var(--luxury-black);
          transition: left 400ms ease;
          z-index: -1;
        }

        .luxury-btn:hover::before {
          left: 0;
        }

        .luxury-btn:hover {
          color: var(--pure-white);
        }

        .luxury-btn:disabled {
          border-color: var(--accent-line);
          color: var(--accent-line);
          cursor: not-allowed;
          background: var(--editorial-gray);
        }

        .luxury-btn:disabled:hover {
          color: var(--accent-line);
        }

        .luxury-btn:disabled:hover::before {
          left: -100%;
        }

        .luxury-btn.secondary {
          border-color: var(--accent-line);
          color: var(--body-gray);
        }

        .luxury-btn.secondary:hover {
          border-color: var(--luxury-black);
          color: var(--pure-white);
        }

        .form-input {
          width: 100%;
          padding: var(--space-md);
          border: 1px solid var(--accent-line);
          font-size: var(--text-base);
          font-weight: 300;
          background: var(--pure-white);
          transition: all 300ms ease;
          font-family: inherit;
          color: var(--luxury-black);
          border-radius: 4px;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--luxury-black);
          background: var(--pure-white);
          box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
        }

        textarea.form-input {
          min-height: 120px;
          resize: vertical;
        }

        /* Mobile-First Design */
        @media (max-width: 768px) {
          .brand-studio-mobile {
            position: fixed;
            inset: 0;
            background: var(--pure-white);
            display: flex;
            flex-direction: column;
          }

          .mobile-tab-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--pure-white);
            border-top: 1px solid var(--accent-line);
            display: flex;
            z-index: 100;
          }

          .mobile-tab-button {
            flex: 1;
            padding: var(--space-md);
            text-align: center;
            background: transparent;
            border: none;
            font-size: 11px;
            font-weight: 300;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: var(--body-gray);
            transition: all 300ms ease;
          }

          .mobile-tab-button.active {
            color: var(--luxury-black);
            background: var(--editorial-gray);
          }

          .mobile-content {
            flex: 1;
            overflow-y: auto;
            padding-bottom: 80px; /* Space for tab bar */
          }
        }

        /* Desktop Layout */
        @media (min-width: 769px) {
          .desktop-layout {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            gap: var(--space-lg);
            height: calc(100vh - 80px);
            max-width: 1400px;
            margin: 0 auto;
            padding: var(--space-lg);
          }

          .desktop-panel {
            background: var(--pure-white);
            border: 1px solid var(--accent-line);
            border-radius: 4px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .desktop-tab-bar {
            display: flex;
            background: var(--editorial-gray);
            border-bottom: 1px solid var(--accent-line);
          }

          .desktop-tab-button {
            flex: 1;
            padding: var(--space-md);
            text-align: center;
            background: transparent;
            border: none;
            font-size: 12px;
            font-weight: 300;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: var(--body-gray);
            transition: all 300ms ease;
          }

          .desktop-tab-button.active {
            color: var(--luxury-black);
            background: var(--pure-white);
          }
        }
      `}</style>

      <BrandStudioContext.Provider value={contextValue}>
        <div className="brand-studio-container">
          <MemberNavigation darkText={true} />
          
          {/* Mobile Layout */}
          {isMobile ? (
            <div className="brand-studio-mobile" style={{ paddingTop: '80px' }}>
              <div className="mobile-content">
                {activeTab === 'photo' ? <PhotoStudio /> : <StoryStudio />}
              </div>
              
              <div className="mobile-tab-bar">
                <button
                  className={`mobile-tab-button ${activeTab === 'photo' ? 'active' : ''}`}
                  onClick={() => setActiveTab('photo')}
                >
                  Photo Studio
                </button>
                <button
                  className={`mobile-tab-button ${activeTab === 'story' ? 'active' : ''}`}
                  onClick={() => setActiveTab('story')}
                >
                  Story Studio
                </button>
              </div>
            </div>
          ) : (
            /* Desktop Layout */
            <div style={{ paddingTop: '80px' }}>
              {/* Luxury Header */}
              <div className="text-center py-12 border-b border-gray-100">
                <div className="luxury-eyebrow">AI PERSONAL BRAND STRATEGIST</div>
                <h1 className="section-title">MAYA'S BRAND STUDIO</h1>
                <p className="body-large mx-auto">
                  Create professional photos and compelling video stories for your brand
                </p>
                
                <div className="desktop-tab-bar mt-8 max-w-md mx-auto border border-gray-200 rounded">
                  <button
                    className={`desktop-tab-button ${activeTab === 'photo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('photo')}
                  >
                    Photo Studio
                  </button>
                  <button
                    className={`desktop-tab-button ${activeTab === 'story' ? 'active' : ''}`}
                    onClick={() => setActiveTab('story')}
                  >
                    Story Studio
                  </button>
                </div>
              </div>

              <div className="desktop-layout">
                {activeTab === 'photo' ? <PhotoStudio /> : <StoryStudio />}
              </div>
            </div>
          )}
        </div>
      </BrandStudioContext.Provider>
    </>
  );
}