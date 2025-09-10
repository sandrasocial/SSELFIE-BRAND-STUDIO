import React, { useState, createContext, useContext } from 'react';
import { useAuth } from '../hooks/use-auth';
import { MemberNavigation } from '../components/member-navigation';
import { DirectorPanel } from '../components/brand-studio/DirectorPanel';
import { CanvasPanel } from '../components/brand-studio/CanvasPanel';
import { ToolkitPanel } from '../components/brand-studio/ToolkitPanel';
import { PhotoStudio } from '../components/brand-studio/PhotoStudio';
import { StoryStudio } from '../components/brand-studio/StoryStudio';

// Luxury flatlay background images for editorial aesthetic
const FLATLAY_IMAGES = [
  'https://i.postimg.cc/VLCFmXVr/1.png',
  'https://i.postimg.cc/WpDyqFyj/10.png',
  'https://i.postimg.cc/SRz1B39j/100.png',
  'https://i.postimg.cc/bJ5FFpsK/101.png',
  'https://i.postimg.cc/F15CNpbp/102.png',
  'https://i.postimg.cc/pVh2VdY5/103.png',
  'https://i.postimg.cc/tRK9sH2S/104.png',
  'https://i.postimg.cc/2Smmx7pn/105.png',
  'https://i.postimg.cc/YqQMgyPp/106.png',
  'https://i.postimg.cc/Bng37Psk/107.png',
  'https://i.postimg.cc/zf2r8myk/108.png',
  'https://i.postimg.cc/4dKT38tR/109.png',
  'https://i.postimg.cc/dQzx2QMC/11.png',
  'https://i.postimg.cc/4drRHzb7/110.png',
  'https://i.postimg.cc/ryrkXPMS/111.png',
  'https://i.postimg.cc/PrnktQ50/112.png',
  'https://i.postimg.cc/3JjQW0yN/113.png',
  'https://i.postimg.cc/wj68NxJV/114.png'
];

// Get random flatlay image for background texture
const getRandomFlatlayImage = () => {
  return FLATLAY_IMAGES[Math.floor(Math.random() * FLATLAY_IMAGES.length)];
};

// Context for sharing data between panels
interface BrandStudioContextType {
  activeTab: 'photo' | 'story';
  setActiveTab: (tab: 'photo' | 'story') => void;
  selectedItem: any | null;
  setSelectedItem: (item: any | null) => void;
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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [handoffData, setHandoffData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [backgroundImage] = useState(getRandomFlatlayImage());

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
    selectedItem,
    setSelectedItem,
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

        /* Mobile-First Creative Studio Design */
        @media (max-width: 768px) {
          .brand-studio-mobile {
            position: fixed;
            inset: 0;
            background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${backgroundImage}');
            background-size: cover;
            background-position: center;
            display: flex;
            flex-direction: column;
          }

          .mobile-tab-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            border-top: 1px solid var(--accent-line);
            display: flex;
            z-index: 100;
            backdrop-filter: blur(20px);
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
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
            background: rgba(249, 249, 249, 0.9);
          }

          .mobile-content {
            flex: 1;
            overflow-y: auto;
            padding-bottom: 80px;
            backdrop-filter: blur(5px);
          }
        }

        /* Three-Panel Maya Creative Workspace */
        .three-panel-workspace {
          padding: var(--space-xl) var(--space-lg);
          max-width: 1600px;
          margin: 0 auto;
          position: relative;
        }

        .three-panel-workspace::before {
          content: '';
          position: absolute;
          top: -40px;
          left: -40px;
          right: -40px;
          bottom: -40px;
          background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${backgroundImage}') center/cover;
          opacity: 0.25;
          border-radius: 20px;
          z-index: -1;
        }

        .workspace-panels {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: var(--space-lg);
          min-height: calc(100vh - 400px);
        }

        .director-panel, .canvas-panel, .toolkit-panel {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid var(--accent-line);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .director-panel {
          position: relative;
        }

        .director-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(135deg, #000000 0%, #333333 100%);
          z-index: 1;
        }

        .canvas-panel {
          position: relative;
          overflow: visible;
        }

        .canvas-panel::before {
          content: '';
          position: absolute;
          top: -20px;
          left: -20px;
          right: -20px;
          bottom: -20px;
          background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${backgroundImage}') center/cover;
          opacity: 0.2;
          border-radius: 12px;
          z-index: -1;
        }

        .toolkit-panel {
          position: relative;
        }

        .toolkit-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          z-index: 1;
        }

        /* Desktop Layout */
        @media (min-width: 769px) {
          .desktop-panel {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid var(--accent-line);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }

          .desktop-tab-bar {
            display: flex;
            background: rgba(249, 249, 249, 0.9);
            border-bottom: 1px solid var(--accent-line);
            backdrop-filter: blur(10px);
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
            background: rgba(255, 255, 255, 0.95);
          }
        }
      `}</style>

      <BrandStudioContext.Provider value={contextValue}>
        <div className="brand-studio-container">
          <MemberNavigation darkText={true} />
          
          {/* Mobile Layout - Layered Creative Studio */}
          {isMobile ? (
            <div className="brand-studio-mobile" style={{ paddingTop: '80px' }}>
              <div className="mobile-content">
                {/* Mobile Header */}
                <div className="text-center py-8 px-4">
                  <div className="luxury-eyebrow">Maya's Creative Studio</div>
                  <h1 className="section-title text-3xl">BRAND WORKSPACE</h1>
                  <p className="body-elegant text-sm mt-4">
                    {activeTab === 'photo' 
                      ? 'Create professional photos with Maya\'s strategic guidance'
                      : 'Craft compelling video stories for your brand'
                    }
                  </p>
                </div>
                
                {/* Mobile Canvas View */}
                <div className="px-4">
                  {activeTab === 'photo' ? <PhotoStudio isMobile={true} /> : <StoryStudio isMobile={true} />}
                </div>
              </div>
              
              <div className="mobile-tab-bar">
                <button
                  className={`mobile-tab-button ${activeTab === 'photo' ? 'active' : ''}`}
                  onClick={() => setActiveTab('photo')}
                >
                  📸 Studio
                </button>
                <button
                  className={`mobile-tab-button ${activeTab === 'story' ? 'active' : ''}`}
                  onClick={() => setActiveTab('story')}
                >
                  🎬 Stories
                </button>
              </div>
            </div>
          ) : (
            /* Desktop Layout - Three-Panel Maya Creative Workspace */
            <div 
              className="min-h-screen" 
              style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
              }}
            >
              {/* Luxury Header */}
              <div className="text-center py-16 border-b border-gray-100" style={{ paddingTop: '120px' }}>
                <div className="luxury-eyebrow">AI PERSONAL BRAND STRATEGIST</div>
                <h1 className="section-title">MAYA'S CREATIVE WORKSPACE</h1>
                <p className="body-large mx-auto">
                  The Strategic Conversation • The Editorial Lookbook • Action & Assets
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

              {/* Three-Panel Creative Workspace */}
              <div className="three-panel-workspace">
                {activeTab === 'photo' ? (
                  <div className="workspace-panels">
                    {/* Left Panel: The Director (Strategic Conversation) */}
                    <div className="director-panel">
                      <PhotoStudio panelMode="director" />
                    </div>
                    
                    {/* Center Panel: The Canvas (Editorial Lookbook) */}
                    <div className="canvas-panel">
                      <PhotoStudio panelMode="canvas" />
                    </div>
                    
                    {/* Right Panel: The Toolkit & Gallery (Action and Assets) */}
                    <div className="toolkit-panel">
                      <PhotoStudio panelMode="toolkit" />
                    </div>
                  </div>
                ) : (
                  <div className="workspace-panels">
                    {/* Left Panel: The Director (Strategic Conversation) */}
                    <div className="director-panel">
                      <StoryStudio panelMode="director" />
                    </div>
                    
                    {/* Center Panel: The Canvas (Editorial Lookbook) */}
                    <div className="canvas-panel">
                      <StoryStudio panelMode="canvas" />
                    </div>
                    
                    {/* Right Panel: The Toolkit & Gallery (Action and Assets) */}
                    <div className="toolkit-panel">
                      <StoryStudio panelMode="toolkit" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </BrandStudioContext.Provider>
    </>
  );
}