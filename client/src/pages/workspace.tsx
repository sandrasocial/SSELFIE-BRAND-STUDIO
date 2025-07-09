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

      {/* STUDIO Tabs */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {['overview', 'themes', 'images', 'moodboard', 'tools', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition-colors text-sm uppercase tracking-wider ${
                  activeTab === tab
                    ? 'border-[#0a0a0a] text-[#0a0a0a]'
                    : 'border-transparent text-[#666666] hover:text-[#0a0a0a]'
                }`}
              >
                {tab}
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

        {activeTab === 'themes' && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                STUDIO Themes
              </h2>
              <p className="text-lg text-[#666666] max-w-3xl font-light">
                Choose your aesthetic. Switch anytime. Each theme uses different moodboard collections for that perfect vibe.
              </p>
            </div>
            
            <StudioThemeSelector 
              currentTheme={selectedTheme}
              onThemeChange={handleThemeChange}
            />
          </section>
        )}

        {activeTab === 'images' && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Your AI Images
              </h2>
              <p className="text-lg text-[#666666] max-w-3xl font-light">
                Your personalized AI SSELFIE collection. Use these for your hero backgrounds, brandbooks, and landing pages.
              </p>
            </div>
            
            {aiImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiImages.map((image: any) => (
                  <div key={image.id} className="relative aspect-[4/3] overflow-hidden border border-[#e5e5e5] group cursor-pointer">
                    <img 
                      src={image.imageUrl}
                      alt="Your AI SSELFIE"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-[#0a0a0a]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setHeroBackground('ai')}
                        className="bg-white text-[#0a0a0a] px-4 py-2 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors"
                      >
                        Use as Hero
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-[#666666] mb-8">No AI images yet. Train your model first.</p>
                <Link href="/model-training">
                  <button className="bg-[#0a0a0a] text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors">
                    Train AI Model
                  </button>
                </Link>
              </div>
            )}
          </section>
        )}

        {activeTab === 'moodboard' && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Moodboard Collections
              </h2>
              <p className="text-lg text-[#666666] max-w-3xl font-light">
                Professional curated images that complement your AI SSELFIES. Perfect for landing pages and brandbooks.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MoodboardCollections.slice(0, 4).map((collection) => (
                <div key={collection.id} className="bg-white border border-[#e5e5e5] p-6">
                  <h3 className="text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {collection.name}
                  </h3>
                  <p className="text-sm text-[#666666] mb-4">
                    {collection.description}
                  </p>
                  <div className="text-xs text-[#999] uppercase tracking-wider">
                    {collection.images.length} Images
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'tools' && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Business Tools
              </h2>
              <p className="text-lg text-[#666666] max-w-3xl font-light">
                Everything you need to build and launch your personal brand business.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link href="/ai-generator">
                <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors">
                  <h3 className="text-lg font-light mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                    AI Generator
                  </h3>
                  <p className="text-sm text-[#666666] mb-4">
                    Generate professional AI images for your brand
                  </p>
                  <div className="text-xs uppercase tracking-wider text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 inline-block">
                    Open Tool
                  </div>
                </div>
              </Link>
              
              <Link href="/brandbook-onboarding">
                <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors">
                  <h3 className="text-lg font-light mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Brandbook Designer
                  </h3>
                  <p className="text-sm text-[#666666] mb-4">
                    Create your luxury brand identity system
                  </p>
                  <div className="text-xs uppercase tracking-wider text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 inline-block">
                    Open Tool
                  </div>
                </div>
              </Link>
              
              <Link href="/landing-builder">
                <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors">
                  <h3 className="text-lg font-light mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Landing Pages
                  </h3>
                  <p className="text-sm text-[#666666] mb-4">
                    Build conversion-optimized landing pages
                  </p>
                  <div className="text-xs uppercase tracking-wider text-[#0a0a0a] border-b border-[#0a0a0a] pb-1 inline-block">
                    Open Tool
                  </div>
                </div>
              </Link>
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