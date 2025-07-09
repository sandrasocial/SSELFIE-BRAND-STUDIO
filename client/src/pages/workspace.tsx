import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { MoodboardCollections } from '@/lib/moodboard-collections';
import { PaymentVerification } from '@/components/payment-verification';

// Import the new STUDIO components
import { StudioThemeSelector, studioThemes } from '@/components/studio-theme-selector';
import { StudioWorkspaceWidgets } from '@/components/studio-workspace-widgets';
import { UserProgressTracker } from '@/components/user-progress-tracker';

export default function Workspace() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTheme, setSelectedTheme] = useState('luxury-minimal');
  const [heroBackground, setHeroBackground] = useState<'theme' | 'ai'>('theme');

  // Fetch user's AI images and model status
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    toast({
      title: "Theme Updated",
      description: "Your STUDIO theme has been changed successfully.",
    });
  };

  const currentTheme = studioThemes.find(theme => theme.id === selectedTheme);
  
  // Get hero background image
  const getHeroImage = () => {
    if (heroBackground === 'ai' && aiImages.length > 0) {
      return aiImages[0].imageUrl;
    }
    return currentTheme?.previewImage || SandraImages.editorial.flatlay1;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be signed in to access your STUDIO.
          </p>
          <a
            href="/api/login"
            className="text-xs uppercase tracking-wider text-black hover:underline"
          >
            SIGN IN
          </a>
        </div>
      </div>
    );
  }

  return (
    <PaymentVerification>
      <div className="min-h-screen bg-white">
        <Navigation />
      
      <HeroFullBleed
        backgroundImage={getHeroImage()}
        tagline="Your business command center"
        title="STUDIO" 
        ctaText={heroBackground === 'theme' ? 'Use My AI Portrait' : 'Use Theme Background'}
        onCtaClick={() => setHeroBackground(heroBackground === 'theme' ? 'ai' : 'theme')}
        fullHeight={false}
      />

      {/* STUDIO Tabs - Simplified */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'ai-photoshoot', label: 'AI Photoshoot' },
              { id: 'gallery', label: 'Gallery' }, 
              { id: 'landing-builder', label: 'Landing Builder' },
              { id: 'sandra-ai', label: 'Sandra AI' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 transition-colors text-sm uppercase tracking-wider ${
                  activeTab === tab.id
                    ? 'border-[#0a0a0a] text-[#0a0a0a]'
                    : 'border-transparent text-[#666666] hover:text-[#0a0a0a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {activeTab === 'overview' && (
          <section>
            <div className="mb-16">
              <h1 className="text-5xl md:text-6xl font-light text-[#0a0a0a] mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Your SSELFIE STUDIO
              </h1>
              <p className="text-xl text-[#666666] max-w-3xl font-light">
                Build your personal brand in 20 minutes. Everything you need is here, gorgeous.
              </p>
            </div>
            
            {/* Progress Tracker */}
            <div className="mb-16">
              <UserProgressTracker />
            </div>
            
            {/* STUDIO Widgets */}
            <StudioWorkspaceWidgets 
              themeImages={currentTheme?.backgroundImages || []}
              userAiImages={aiImages.map(img => img.imageUrl)}
            />
          </section>
        )}

        {activeTab === 'ai-photoshoot' && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                AI Photoshoot
              </h2>
              <p className="text-lg text-[#666666] max-w-3xl font-light">
                Generate 300 professional AI photos monthly. Each photo costs us $0.038 to create for you.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 max-w-2xl">
              <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Your Monthly Allowance
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Plan</span>
                  <span>SSELFIE STUDIO</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Generations</span>
                  <span>300</span>
                </div>
                <div className="flex justify-between">
                  <span>Used This Month</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining</span>
                  <span>300</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href="/ai-generator" className="bg-black text-white px-6 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors">
                  GENERATE PHOTOS
                </Link>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'gallery' && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Your Gallery
              </h2>
              <p className="text-lg text-[#666666] max-w-3xl font-light">
                Your saved AI photos are automatically stored here. Download, share, or use them in your landing pages.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiImages.length > 0 ? (
                aiImages.map((image, index) => (
                  <div key={index} className="bg-white border border-[#e5e5e5] overflow-hidden group">
                    <img 
                      src={image.imageUrl} 
                      alt={`AI generated image ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-[#666666] mb-2">{image.prompt}</p>
                      <p className="text-xs text-[#999999]">
                        Generated: {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <button className="text-xs uppercase tracking-wider text-black hover:underline mr-4">
                          Download
                        </button>
                        <button className="text-xs uppercase tracking-wider text-black hover:underline">
                          Use in Landing Page
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <p className="text-[#666666] mb-4">No saved photos yet</p>
                  <Link href="/ai-generator" className="text-sm uppercase tracking-wider text-black hover:underline">
                    Generate Your First Photos
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'landing-builder' && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Landing Page Builder
              </h2>
              <p className="text-lg text-[#666666] max-w-3xl font-light">
                Chat with Sandra AI to build conversion-optimized landing pages using your onboarding data and AI photos.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8">
                <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Available Templates
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Service Provider Page</span>
                    <button className="text-xs uppercase tracking-wider text-black hover:underline">
                      Create
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Coach/Consultant Page</span>
                    <button className="text-xs uppercase tracking-wider text-black hover:underline">
                      Create
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Portfolio Page</span>
                    <button className="text-xs uppercase tracking-wider text-black hover:underline">
                      Create
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 p-8">
                <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Sandra AI Builder
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Sandra AI knows your brand story, goals, and style from onboarding. Just tell her what you want to build.
                </p>
                <Link href="/landing-builder" className="bg-black text-white px-6 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors">
                  Chat with Sandra AI
                </Link>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'sandra-ai' && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Sandra AI
              </h2>
              <p className="text-lg text-[#666666] max-w-3xl font-light">
                Your personal AI assistant that knows your brand story, goals, and style. Chat with Sandra about anything related to your business.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 p-8 max-w-4xl">
              <div className="mb-6">
                <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  What Sandra AI Knows About You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="font-medium mb-2">Your Brand Story</div>
                    <div className="text-gray-600">Your personal journey and mission</div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Business Goals</div>
                    <div className="text-gray-600">Your objectives and target audience</div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Brand Voice</div>
                    <div className="text-gray-600">Your communication style and tone</div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Style Preferences</div>
                    <div className="text-gray-600">Your visual aesthetic and brand direction</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Chat with Sandra
                </h3>
                <div className="bg-gray-50 p-4 rounded-none min-h-[300px] mb-4">
                  <p className="text-gray-500 text-sm">
                    Sandra AI chat interface will be available here. Ask about content creation, marketing strategies, or anything else related to your personal brand.
                  </p>
                </div>
                <div className="flex space-x-4">
                  <input 
                    type="text"
                    placeholder="Ask Sandra anything about your brand..."
                    className="flex-1 p-3 border border-gray-300 rounded-none focus:outline-none focus:border-black"
                  />
                  <button className="bg-black text-white px-6 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                STUDIO Settings
              </h2>
              <p className="text-lg text-[#666666] max-w-3xl font-light">
                Customize your STUDIO experience and manage your preferences.
              </p>
            </div>
            
            <div className="bg-white border border-[#e5e5e5] p-8 max-w-2xl">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-light mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Hero Background
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="heroBackground" 
                        value="theme"
                        checked={heroBackground === 'theme'}
                        onChange={() => setHeroBackground('theme')}
                        className="mr-3"
                      />
                      <span className="text-sm">Use current theme image</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="heroBackground" 
                        value="ai"
                        checked={heroBackground === 'ai'}
                        onChange={() => setHeroBackground('ai')}
                        className="mr-3"
                        disabled={aiImages.length === 0}
                      />
                      <span className={`text-sm ${aiImages.length === 0 ? 'text-gray-400' : ''}`}>
                        Use my AI SSELFIE portrait {aiImages.length === 0 ? '(train model first)' : ''}
                      </span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-light mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Current Theme
                  </h3>
                  <p className="text-sm text-[#666666] mb-3">
                    Currently using: <strong>{currentTheme?.name}</strong>
                  </p>
                  <button 
                    onClick={() => setActiveTab('themes')}
                    className="text-xs uppercase tracking-wider text-[#0a0a0a] border-b border-[#0a0a0a] pb-1"
                  >
                    Change Theme
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
    </PaymentVerification>
  );
}