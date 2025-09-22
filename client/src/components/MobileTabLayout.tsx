import React, { useState, useEffect } from 'react';
import { StudioPage } from '../pages/StudioPage';
import { GalleryScreen } from './GalleryScreen';
import SSELFIEGallery from '../pages/sselfie-gallery';
import { useAuth } from '../hooks/use-auth';
import { Camera, Grid, User, Settings, Sparkles, Heart, Share2, Smartphone, Search, Package, Shirt } from 'lucide-react';

// Maya's Smart Aesthetic Feed Categories - Editorial Neutral Palette
const MAYA_CATEGORIES = {
  'flatlay': { name: 'Flatlay', icon: Smartphone, color: 'from-neutral-700/30 to-neutral-800/30' },
  'closeup': { name: 'Close-up', icon: Search, color: 'from-neutral-600/30 to-neutral-700/30' },
  'fullbody': { name: 'Full Body', icon: User, color: 'from-neutral-800/30 to-neutral-900/30' },
  'objects': { name: 'Objects', icon: Package, color: 'from-neutral-500/30 to-neutral-600/30' },
  'halfbody': { name: 'Half Body', icon: Shirt, color: 'from-neutral-600/30 to-neutral-800/30' }
};

// Smart Feed Layout Patterns
const FEED_PATTERNS = {
  checkerboard: [1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1],
  alternating: [1, 1, 0.5, 1, 1, 0.5, 1, 1, 0.5],
  diagonal: [1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1],
  uniform: [1, 1, 1, 1, 1, 1, 1, 1, 1]
};

// InstagramStyleProfile Component - Editorial Luxury Redesign
const InstagramStyleProfile = ({ user }: { user: { name?: string; email?: string; image?: string } }) => {
  const [selectedPattern, setSelectedPattern] = useState('checkerboard');
  const [feedImages, setFeedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - in real app, this would come from Maya's AI categorization
  useEffect(() => {
    const mockImages = [
      { id: 1, url: '/gallery-luxury-workspace.jpg', category: 'flatlay', likes: 42, comments: 8, saved: false },
      { id: 2, url: '/flatlay-luxury-planning.jpg', category: 'closeup', likes: 38, comments: 5, saved: true },
      { id: 3, url: '/gallery-luxury-workspace.jpg', category: 'fullbody', likes: 67, comments: 12, saved: false },
      { id: 4, url: '/flatlay-luxury-planning.jpg', category: 'objects', likes: 29, comments: 3, saved: true },
      { id: 5, url: '/gallery-luxury-workspace.jpg', category: 'halfbody', likes: 51, comments: 7, saved: false },
      { id: 6, url: '/flatlay-luxury-planning.jpg', category: 'flatlay', likes: 33, comments: 4, saved: false },
      { id: 7, url: '/gallery-luxury-workspace.jpg', category: 'closeup', likes: 45, comments: 9, saved: true },
      { id: 8, url: '/flatlay-luxury-planning.jpg', category: 'fullbody', likes: 58, comments: 11, saved: false },
      { id: 9, url: '/gallery-luxury-workspace.jpg', category: 'objects', likes: 41, comments: 6, saved: false }
    ];
    
    setTimeout(() => {
      setFeedImages(mockImages);
      setIsLoading(false);
    }, 1000);
  }, []);

  const toggleLike = (imageId: number) => {
    setFeedImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, liked: !img.liked, likes: img.liked ? img.likes - 1 : img.likes + 1 }
        : img
    ));
  };

  const toggleSave = (imageId: number) => {
    setFeedImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, saved: !img.saved }
        : img
    ));
  };

  const getPatternClass = (index: number) => {
    const pattern = FEED_PATTERNS[selectedPattern as keyof typeof FEED_PATTERNS];
    const span = pattern[index % pattern.length];
    return span === 0.5 ? 'col-span-1 row-span-1' : 'col-span-1 row-span-2';
  };

  if (isLoading) {
    return (
      <div className="editorial-loading-container">
        <div className="editorial-spinner w-12 h-12 mb-4"></div>
        <p className="editorial-loading-message">Loading your aesthetic feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Editorial Profile Header */}
      <div className="editorial-profile-header">
        <div className="editorial-profile-avatar w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full border-2 border-neutral-700/30 flex items-center justify-center">
          <User size={32} className="text-neutral-400" strokeWidth={1.5} />
        </div>
        <h1 className="editorial-profile-name text-center mb-2">
          {user?.name?.toUpperCase() || 'YOUR PROFILE'}
        </h1>
        <p className="editorial-profile-tier text-center">
          {user?.email || 'CREATIVE DIRECTOR'}
        </p>
      </div>

      {/* Editorial Stats Grid */}
      <div className="editorial-stats-grid">
        <div className="text-center">
          <div className="editorial-stat-value">247</div>
          <div className="editorial-stat-label">PHOTOS</div>
        </div>
        <div className="text-center">
          <div className="editorial-stat-value">1.2K</div>
          <div className="editorial-stat-label">FOLLOWERS</div>
        </div>
        <div className="text-center">
          <div className="editorial-stat-value">89</div>
          <div className="editorial-stat-label">FOLLOWING</div>
        </div>
      </div>

      {/* Pattern Selector */}
      <div className="editorial-card p-6">
        <h3 className="editorial-heading-3 mb-4">Feed Layout</h3>
        <div className="flex gap-2">
          {Object.entries(FEED_PATTERNS).map(([key]) => (
            <button
              key={key}
              onClick={() => setSelectedPattern(key)}
              className={`editorial-button-secondary px-4 py-2 text-sm ${
                selectedPattern === key ? 'bg-neutral-700/50' : ''
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Maya's Smart Categorization Info */}
      <div className="editorial-card p-6">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-700/30">
            <Sparkles size={20} className="text-neutral-300" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="editorial-text-header mb-2">Maya's Smart Categorization</h4>
            <p className="editorial-text-body text-neutral-400 leading-relaxed">
              Your photos are automatically organized by Maya's AI into aesthetic categories: 
              flatlays, close-ups, full body, objects, and half-body shots. 
              This creates a visually balanced, magazine-quality feed.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial Feed Grid */}
      <div className="grid grid-cols-2 gap-3">
        {feedImages.map((image, index) => {
          const category = MAYA_CATEGORIES[image.category as keyof typeof MAYA_CATEGORIES];
          const Icon = category?.icon || Package;
          
          return (
            <div 
              key={image.id} 
              className={`editorial-gallery-item ${getPatternClass(index)}`}
            >
              <div className="editorial-gallery-image">
                <div className={`w-full h-full bg-gradient-to-br ${category?.color || 'from-neutral-700 to-neutral-800'} rounded-lg flex items-center justify-center`}>
                  <Icon size={32} className="text-neutral-400" strokeWidth={1.5} />
                </div>
                <div className="editorial-gallery-overlay"></div>
                <div className="editorial-gallery-actions">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-xs tracking-wide">
                      {category?.name || 'PHOTO'}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleLike(image.id)}
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded transition-colors hover:bg-white/30"
                      >
                        <Heart 
                          size={14} 
                          className={`${image.liked ? 'text-red-500 fill-current' : 'text-white'}`} 
                          strokeWidth={1.5} 
                        />
                      </button>
                      <button 
                        onClick={() => toggleSave(image.id)}
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded transition-colors hover:bg-white/30"
                      >
                        <Share2 
                          size={14} 
                          className={`${image.saved ? 'text-blue-400' : 'text-white'}`} 
                          strokeWidth={1.5} 
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Editorial Tab Configuration - Enhanced with User Context
const createTabs = (user: { name?: string; email?: string; image?: string }) => [
  {
    id: 'studio',
    label: 'Studio',
    icon: Camera,
    description: 'Create with Maya AI',
    component: <StudioPage />
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: Grid,
    description: 'Your photo collection',
    component: <SSELFIEGallery hideMemberNav />
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Your aesthetic feed',
    component: <InstagramStyleProfile user={user} />
  },
  {
    id: 'account',
    label: 'Account',
    icon: Settings,
    description: 'Settings & preferences',
    component: (
      <div className="space-y-8">
        <div className="editorial-profile-header">
          <h1 className="editorial-heading-1 text-center">ACCOUNT</h1>
          <p className="editorial-text-caption text-center">Manage your preferences</p>
        </div>
        
        <div className="space-y-4">
          <div className="editorial-card p-6">
            <h3 className="editorial-heading-3 mb-4">Profile Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-neutral-800/30">
                <span className="editorial-text-body">Name</span>
                <span className="editorial-text-caption">{user?.name || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-neutral-800/30">
                <span className="editorial-text-body">Email</span>
                <span className="editorial-text-caption">{user?.email || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="editorial-text-body">Member Since</span>
                <span className="editorial-text-caption">2024</span>
              </div>
            </div>
          </div>
          
          <div className="editorial-card p-6">
            <h3 className="editorial-heading-3 mb-4">Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-neutral-800/30">
                <span className="editorial-text-body">Notifications</span>
                <div className="w-12 h-6 bg-neutral-700 rounded-full relative">
                  <div className="w-5 h-5 bg-neutral-200 rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-neutral-800/30">
                <span className="editorial-text-body">Dark Mode</span>
                <div className="w-12 h-6 bg-neutral-200 rounded-full relative">
                  <div className="w-5 h-5 bg-neutral-800 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="editorial-text-body">Auto-save</span>
                <div className="w-12 h-6 bg-neutral-200 rounded-full relative">
                  <div className="w-5 h-5 bg-neutral-800 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

// Main MobileTabLayout Component - Editorial Luxury Redesign
function MobileTabLayout() {
  const [activeTab, setActiveTab] = useState('studio');
  const { user } = useAuth();
  
  const tabs = createTabs(user || {});
  const currentTab = tabs.find(tab => tab.id === activeTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-neutral-950" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Enhanced Editorial Breadcrumb with Luxury Styling */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/20 bg-gradient-to-r from-neutral-950/20 to-transparent sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-neutral-400 rounded-full opacity-60"></div>
          <span className="editorial-eyebrow text-neutral-500 tracking-ultra-wide">
            {currentTab?.label?.toUpperCase() || 'STUDIO'}
          </span>
        </div>
        <div className="editorial-text-header text-neutral-600 text-sm tracking-extra-wide font-serif">
          SSELFIE
        </div>
      </div>

      {/* Enhanced Main Content Area with Semantic Spacing */}
      <main 
        className="flex-1 pb-navigation-bottom-margin pt-header-offset overflow-y-auto overscroll-behavior-y-contain"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          minHeight: 'calc(100vh - var(--navigation-bottom-margin))'
        }}
        role="main" 
        aria-label="Main content"
      >
        <div className="px-6 py-8 min-h-full">
          <div className="animate-editorial-fade-in">
            {currentTab?.component}
          </div>
        </div>
      </main>

      {/* Editorial Luxury Floating Tab Bar */}
      <nav 
        role="navigation" 
        aria-label="Mobile navigation"
        className="fixed bottom-floating-navigation-bottom left-floating-navigation-horizontal right-floating-navigation-horizontal z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <div className="editorial-floating-tab p-3">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 p-4 rounded-xl transition-all duration-300 ease-sophisticated min-h-[56px] flex flex-col items-center justify-center editorial-headline ${
                    isActive 
                      ? 'bg-neutral-800/60 text-neutral-200' 
                      : 'text-neutral-500 hover:bg-neutral-800/30 hover:text-neutral-300'
                  }`}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                  title={tab.description}
                  aria-label={`Switch to ${tab.label}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-pressed={isActive}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                >
                  <div className={`p-2 rounded-xl transition-all duration-500 ${
                    isActive 
                      ? 'transform scale-105' 
                      : ''
                  }`}>
                    <Icon 
                      size={20} 
                      strokeWidth={1.2} 
                      className="transition-all duration-500" 
                    />
                  </div>
                  <span className={`text-xs font-light tracking-wide transition-all duration-500 uppercase mt-1`}
                    style={{ 
                      fontSize: '10px',
                      letterSpacing: '0.2em'
                    }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default MobileTabLayout;
export { MobileTabLayout };