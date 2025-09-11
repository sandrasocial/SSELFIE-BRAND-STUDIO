import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { MemberNavigation } from '../components/member-navigation';
import { PhotoStudio } from '../components/brand-studio/PhotoStudio';
import { StoryStudio } from '../components/brand-studio/StoryStudio';
import { BrandStudioProvider, useBrandStudio } from '../contexts/BrandStudioContext';

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
];

// Get random flatlay image for background texture
const getRandomFlatlayImage = () => {
  return FLATLAY_IMAGES[Math.floor(Math.random() * FLATLAY_IMAGES.length)];
};

// Brand Studio main component content
function BrandStudioPageContent() {
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useBrandStudio();
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

        /* Desktop Layout */
        @media (min-width: 769px) {
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

      <div className="brand-studio-container">
        <MemberNavigation darkText={true} />
        
        {/* Mobile Layout */}
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
              
              {/* SINGLE STUDIO INSTANCE - No more duplicates! */}
              <div className="px-4">
                {activeTab === 'photo' ? (
                  <PhotoStudio />
                ) : (
                  <StoryStudio />
                )}
              </div>
            </div>
            
            <div className="mobile-tab-bar">
              <button
                className={`mobile-tab-button ${activeTab === 'photo' ? 'active' : ''}`}
                onClick={() => setActiveTab('photo')}
                data-testid="button-photo-studio"
              >
                📸 Studio
              </button>
              <button
                className={`mobile-tab-button ${activeTab === 'story' ? 'active' : ''}`}
                onClick={() => setActiveTab('story')}
                data-testid="button-story-studio"
              >
                🎬 Stories
              </button>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
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
                  data-testid="button-photo-studio-desktop"
                >
                  Photo Studio
                </button>
                <button
                  className={`desktop-tab-button ${activeTab === 'story' ? 'active' : ''}`}
                  onClick={() => setActiveTab('story')}
                  data-testid="button-story-studio-desktop"
                >
                  Story Studio
                </button>
              </div>
            </div>

            {/* SINGLE STUDIO INSTANCE - No more panel duplication! */}
            <div className="p-8">
              {activeTab === 'photo' ? (
                <PhotoStudio />
              ) : (
                <StoryStudio />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Main wrapper with provider
export default function BrandStudioPage() {
  return (
    <BrandStudioProvider>
      <BrandStudioPageContent />
    </BrandStudioProvider>
  );
}