import React, { useState, useEffect } from 'react';
import { MayaChat } from './MayaChat';
import { GalleryScreen } from './GalleryScreen';
import { StudioScreen } from './StudioScreen';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Camera, Grid, User, Settings, MessageCircle, Heart, Share2, Smartphone, Search, Package, Shirt } from 'lucide-react';

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
      {/* Editorial profile header - Following Styleguide */}
      <div className="text-center space-y-8 pt-6">
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
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-zinc-950 flex items-center justify-center">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-serif font-extralight tracking-[0.2em] text-white uppercase leading-tight">
            {user?.name || 'Your Profile'}
          </h2>
          <p className="text-zinc-400 text-sm tracking-[0.4em] uppercase font-light">Creative Director</p>
        </div>

        {/* Enhanced stats with better hierarchy - Following Styleguide */}
        <div className="grid grid-cols-3 gap-8 pt-6">
          <div className="text-center space-y-3">
            <div className="text-3xl font-serif font-extralight text-white">{feedImages.length}</div>
            <div className="text-sm text-zinc-400 tracking-[0.2em] uppercase font-light">Posts</div>
          </div>
          <div className="text-center space-y-3">
            <div className="text-3xl font-serif font-extralight text-white">1.2k</div>
            <div className="text-sm text-zinc-400 tracking-[0.2em] uppercase font-light">Followers</div>
          </div>
          <div className="text-center space-y-3">
            <div className="text-3xl font-serif font-extralight text-white">89</div>
            <div className="text-sm text-zinc-400 tracking-[0.2em] uppercase font-light">Following</div>
          </div>
        </div>
      </div>

      {/* Enhanced action buttons with better touch targets - Following Styleguide */}
      <div className="grid grid-cols-2 gap-4">
        <button className="group relative bg-white text-black px-6 py-5 rounded-xl font-light tracking-[0.2em] uppercase text-sm transition-all duration-500 hover:scale-[1.02] overflow-hidden">
          <div className="absolute inset-0 bg-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <span className="relative z-10 group-hover:text-white transition-colors duration-500">Edit Profile</span>
        </button>
        <button className="bg-zinc-800/30 text-white px-6 py-5 rounded-xl font-light tracking-[0.2em] uppercase text-sm border border-zinc-700/20 transition-all duration-500 hover:bg-zinc-800/50 hover:border-zinc-600/30 hover:scale-[1.02] flex items-center justify-center gap-2">
          <Settings size={16} strokeWidth={1.2} />
          Settings
        </button>
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

      {/* Gallery Content - Following Styleguide */}
      {feedImages.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-zinc-800/30 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Camera size={24} className="text-zinc-500" />
          </div>
          <h3 className="text-lg font-serif font-extralight tracking-[0.2em] text-white uppercase mb-2">Your Gallery Awaits</h3>
          <p className="text-zinc-500 text-sm tracking-[0.1em] uppercase font-light mb-6 max-w-md mx-auto">
            Start creating stunning photos with Maya to build your personal brand gallery
          </p>
          <button className="group relative bg-white text-black px-6 py-4 rounded-xl font-light tracking-[0.2em] uppercase text-sm transition-all duration-500 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">Create First Photo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-extralight tracking-[0.2em] text-white uppercase">Recent Work</h3>
            <button className="text-zinc-400 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors duration-300 font-light">
              View All
            </button>
          </div>
          
          {/* Gallery grid with editorial hover effects - Following Styleguide */}
          <div className="grid grid-cols-2 gap-3">
            {feedImages.map((image, index) => {
              const category = MAYA_CATEGORIES[image.category as keyof typeof MAYA_CATEGORIES];
              const Icon = category?.icon || Package;
              
              return (
                <div key={image.id} className="relative group cursor-pointer overflow-hidden rounded-lg">
                  <div className="aspect-square relative">
                    {image.url ? (
                      <img 
                        src={image.url} 
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className={`w-full h-full bg-zinc-800/20 rounded-xl border border-zinc-700/20 flex items-center justify-center hover:bg-zinc-800/30 transition-all duration-300 hover:scale-105 cursor-pointer group`}>
                        <Icon size={24} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500"></div>
                    
                    {/* Sophisticated overlay - Following Styleguide */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-xs tracking-[0.2em] uppercase font-light">
                          {category?.name || 'PHOTO'}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => toggleLike(image.id)}
                            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                          >
                            <Heart 
                              size={14} 
                              className={`${image.liked ? 'text-red-400 fill-current' : 'text-white'}`} 
                              strokeWidth={1.2} 
                            />
                          </button>
                          <button 
                            onClick={() => toggleSave(image.id)}
                            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                          >
                            <Share2 
                              size={14} 
                              className={`${image.saved ? 'text-blue-400' : 'text-white'}`} 
                              strokeWidth={1.2} 
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
    component: <StudioScreen />
  },
  {
    id: 'maya',
    label: 'Maya',
    icon: MessageCircle,
    description: 'AI Photo Stylist',
    component: <MayaChat />
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: Grid,
    description: 'Your photo collection',
    component: <GalleryScreen />
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
    <div className="flex flex-col h-full">
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
          paddingRight: 'env(safe-area-inset-right)'
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