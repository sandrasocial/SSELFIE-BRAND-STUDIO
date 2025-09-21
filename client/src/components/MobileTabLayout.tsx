import React, { useState, useEffect } from 'react';
import { StudioPage } from '../pages/StudioPage';
import { GalleryScreen } from './GalleryScreen';
import SSELFIEGallery from '../pages/sselfie-gallery';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
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

// InstagramStyleProfile Component - Luxury Redesign with Real Data
const InstagramStyleProfile = ({ user }: { user: { name?: string; email?: string; image?: string } }) => {
  const [selectedPattern, setSelectedPattern] = useState('checkerboard');
  const [feedImages, setFeedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real user gallery data using correct Vercel serverless endpoint
  const { data: userImages, isLoading: imagesLoading, error } = useQuery({
    queryKey: ['/api/gallery'],
    enabled: !!user,
    retry: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });

  // Process real user images when they load
  useEffect(() => {
    if (userImages && Array.isArray(userImages)) {
      // Process real user images
      const processedImages = userImages.slice(0, 9).map((img, index) => ({
        id: img.id || index,
        url: img.url || img.image_url,
        category: img.category || ['flatlay', 'closeup', 'fullbody', 'objects', 'halfbody'][index % 5],
        likes: img.likes || Math.floor(Math.random() * 50) + 10,
        comments: img.comments || Math.floor(Math.random() * 10) + 1,
        saved: img.saved || false,
        liked: img.liked || false,
        createdAt: img.created_at || new Date().toISOString()
      }));
      
      setFeedImages(processedImages);
      setIsLoading(false);
    } else if (!imagesLoading && userImages !== undefined) {
      // No images found - show empty state
      setFeedImages([]);
      setIsLoading(false);
    }
  }, [userImages, imagesLoading]);

  const toggleLike = (imageId: string | number) => {
    setFeedImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, liked: !img.liked, likes: img.liked ? img.likes - 1 : img.likes + 1 }
        : img
    ));
    
    // Send to API using correct Vercel serverless endpoint
    fetch(`/api/gallery/${imageId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(console.error);
  };

  const toggleSave = (imageId: string | number) => {
    setFeedImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, saved: !img.saved }
        : img
    ));
    
    // Send to API using correct Vercel serverless endpoint
    fetch(`/api/gallery/${imageId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(console.error);
  };

  const getPatternClass = (index: number) => {
    const pattern = FEED_PATTERNS[selectedPattern as keyof typeof FEED_PATTERNS];
    const span = pattern[index % pattern.length];
    return span === 0.5 ? 'col-span-1 row-span-1' : 'col-span-1 row-span-2';
  };

  if (isLoading || imagesLoading) {
    return (
      <div className="luxury-loading-container">
        <div className="luxury-spinner" />
        <p className="luxury-loading-message">Loading your aesthetic feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="luxury-card text-center py-12">
        <h3 className="luxury-heading-3 mb-4">Gallery Unavailable</h3>
        <p className="luxury-text-body mb-6">
          We're having trouble loading your gallery. Please try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="luxury-button-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Luxury Profile Header */}
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          {user?.image ? (
            <img 
              src={user.image}
              alt={user?.name || 'Profile'}
              className="w-32 h-32 rounded-full object-cover border border-zinc-700/30"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/30 flex items-center justify-center">
              <User size={40} className="text-zinc-400" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="luxury-heading-2 text-center">
            {(user?.name || 'YOUR PROFILE').toUpperCase()}
          </h2>
          <p className="luxury-text-caption">CREATIVE DIRECTOR</p>
        </div>
      </div>

      {/* Luxury Stats Grid */}
      <div className="grid grid-cols-3 gap-8">
        <div className="text-center space-y-3">
          <div className="luxury-heading-3">{feedImages.length}</div>
          <div className="luxury-text-caption">Photos</div>
        </div>
        <div className="text-center space-y-3">
          <div className="luxury-heading-3">1.2K</div>
          <div className="luxury-text-caption">Followers</div>
        </div>
        <div className="text-center space-y-3">
          <div className="luxury-heading-3">89</div>
          <div className="luxury-text-caption">Following</div>
        </div>
      </div>

      {/* Pattern Selector */}
      <div className="luxury-card">
        <h3 className="luxury-heading-3 mb-4">Feed Layout</h3>
        <div className="flex gap-2">
          {Object.entries(FEED_PATTERNS).map(([key]) => (
            <button
              key={key}
              onClick={() => setSelectedPattern(key)}
              className={`luxury-button-secondary text-xs py-2 px-4 ${
                selectedPattern === key ? 'bg-zinc-700/50' : ''
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Maya's Smart Categorization Info */}
      <div className="luxury-card">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/30">
            <Sparkles size={20} className="text-zinc-300" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="luxury-text-body mb-2">Maya's Smart Categorization</h4>
            <p className="luxury-text-caption text-zinc-400 leading-relaxed">
              Your photos are automatically organized by Maya's AI into aesthetic categories: 
              flatlays, close-ups, full body, objects, and half-body shots. 
              This creates a visually balanced, magazine-quality feed.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      {feedImages.length === 0 ? (
        <div className="luxury-card text-center py-12">
          <div className="w-16 h-16 bg-zinc-800/30 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Camera size={24} className="text-zinc-500" />
          </div>
          <h3 className="luxury-heading-3 mb-4">Your Gallery Awaits</h3>
          <p className="luxury-text-body mb-6 max-w-md mx-auto">
            Start creating stunning photos with Maya to build your personal brand gallery
          </p>
          <button className="luxury-button-primary">
            Create First Photo
          </button>
        </div>
      ) : (
        /* Luxury Gallery Grid */
        <div className="grid grid-cols-2 gap-3">
          {feedImages.map((image, index) => {
            const category = MAYA_CATEGORIES[image.category as keyof typeof MAYA_CATEGORIES];
            const Icon = category?.icon || Package;
            
            return (
              <div 
                key={image.id} 
                className={`luxury-gallery-item ${getPatternClass(index)}`}
              >
                <div className="luxury-gallery-image">
                  {image.url ? (
                    <img 
                      src={image.url} 
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${category?.color || 'from-zinc-700 to-zinc-800'} rounded-lg flex items-center justify-center`}>
                      <Icon size={32} className="text-zinc-400" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="luxury-gallery-overlay"></div>
                  <div className="luxury-gallery-actions">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-xs tracking-wide uppercase">
                        {category?.name || 'PHOTO'}
                      </span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => toggleLike(image.id)}
                          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                        >
                          <Heart 
                            size={14} 
                            className={`${image.liked ? 'text-red-500 fill-current' : 'text-white'}`} 
                            strokeWidth={1.5} 
                          />
                        </button>
                        <button 
                          onClick={() => toggleSave(image.id)}
                          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
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
      )}
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
        <div className="text-center space-y-4 pt-8">
          <h1 className="luxury-heading-1">ACCOUNT</h1>
          <p className="luxury-text-caption">Manage your preferences</p>
        </div>
        
        <div className="space-y-6">
          <div className="luxury-card">
            <h3 className="luxury-heading-3 mb-4">Profile Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
                <span className="luxury-text-body">Name</span>
                <span className="luxury-text-caption">{user?.name || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
                <span className="luxury-text-body">Email</span>
                <span className="luxury-text-caption">{user?.email || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
                <span className="luxury-text-body">Member Since</span>
                <span className="luxury-text-caption">2024</span>
              </div>
            </div>
          </div>
          
          <div className="luxury-card">
            <h3 className="luxury-heading-3 mb-4">Preferences</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
                <span className="luxury-text-body">Notifications</span>
                <div className="luxury-toggle"></div>
              </div>
              <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
                <span className="luxury-text-body">Dark Mode</span>
                <div className="luxury-toggle active"></div>
              </div>
              <div className="flex items-center justify-between py-4 hover:bg-zinc-700/20 rounded-lg px-4 -mx-4 transition-all duration-300 min-h-[48px]">
                <span className="luxury-text-body">Auto-save</span>
                <div className="luxury-toggle active"></div>
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
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-black" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Luxury Breadcrumb */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/20 bg-gradient-to-r from-black/20 to-transparent sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-zinc-400 rounded-full opacity-60"></div>
          <span className="luxury-eyebrow text-zinc-500 tracking-ultra-wide">
            {currentTab?.label?.toUpperCase() || 'STUDIO'}
          </span>
        </div>
        <div className="luxury-text-caption text-zinc-600 font-serif">
          SSELFIE
        </div>
      </div>

      {/* Main Content Area */}
      <main 
        className="flex-1 pb-24 overflow-y-auto overscroll-behavior-y-contain"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          minHeight: 'calc(100vh - 120px)'
        }}
        role="main" 
        aria-label="Main content"
      >
        <div className="px-6 py-8 min-h-full">
          <div className="luxury-fade-in">
            {currentTab?.component}
          </div>
        </div>
      </main>

      {/* Luxury Floating Tab Bar */}
      <nav 
        role="navigation" 
        aria-label="Mobile navigation"
        className="fixed bottom-4 left-4 right-4 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <div className="luxury-tab-container">
          <div className="luxury-tab-grid">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`luxury-tab-button ${isActive ? 'active' : ''}`}
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
                  <div className={`luxury-tab-icon ${
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
                  <span className="luxury-tab-label">
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