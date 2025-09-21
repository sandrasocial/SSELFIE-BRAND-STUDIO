import React, { useState, useEffect } from 'react';
import { StudioPage } from '../pages/StudioPage';
import SSELFIEGallery from '../pages/sselfie-gallery';
import { useAuth } from '../hooks/use-auth';
import { Camera, Grid, User, Settings, Sparkles, Home, ChevronRight, Heart, MessageCircle, Share2, MoreHorizontal, Smartphone, Search, Package, Shirt, Bell, Shield, Palette, Crown } from 'lucide-react';

// Maya's Smart Aesthetic Feed Categories - Sophisticated Neutral Palette
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

// InstagramStyleProfile Component
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
        ? { ...img, likes: img.saved ? img.likes - 1 : img.likes + 1, saved: !img.saved }
        : img
    ));
  };

  const getPatternSize = (index: number) => {
    const pattern = FEED_PATTERNS[selectedPattern as keyof typeof FEED_PATTERNS];
    return pattern[index % pattern.length];
  };

  return (
    <div className="space-y-6">
      {/* Instagram-style Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 border-2 border-neutral-700/30 flex items-center justify-center">
              {user?.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || 'User'} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={32} className="text-neutral-400" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h1 className="text-xl font-light text-neutral-200 tracking-wide">
                {user?.name || 'maya_user'}
              </h1>
              <p className="text-neutral-400 text-sm">Professional Creative</p>
              <p className="text-neutral-500 text-xs mt-1">AI-Generated Aesthetic Feed</p>
            </div>
          </div>
          <button className="text-neutral-400 hover:text-neutral-300 transition-colors">
            <MoreHorizontal size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-lg font-light text-neutral-200">{feedImages.length}</div>
            <div className="text-xs text-neutral-500 tracking-wide">posts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-light text-neutral-200">1.2K</div>
            <div className="text-xs text-neutral-500 tracking-wide">followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-light text-neutral-200">89</div>
            <div className="text-xs text-neutral-500 tracking-wide">following</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 bg-neutral-200 text-black px-4 py-2 rounded-lg font-light tracking-wide transition-all duration-200 hover:bg-neutral-300">
            Edit Profile
          </button>
          <button className="flex-1 bg-neutral-800/40 text-neutral-200 px-4 py-2 rounded-lg font-light tracking-wide border border-neutral-700/30 transition-all duration-200 hover:bg-neutral-800/60">
            Share Profile
          </button>
        </div>
      </div>

      {/* Pattern Selector */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-neutral-400" strokeWidth={1.5} />
          <span className="text-sm text-neutral-400 tracking-wide">FEED PATTERN</span>
        </div>
        <div className="flex gap-2">
          {Object.entries(FEED_PATTERNS).map(([pattern]) => (
            <button
              key={pattern}
              onClick={() => setSelectedPattern(pattern)}
              className={`px-3 py-1 rounded-lg text-xs tracking-wide transition-all duration-200 ${
                selectedPattern === pattern
                  ? 'bg-neutral-200 text-black'
                  : 'bg-neutral-800/40 text-neutral-400 hover:bg-neutral-700/40'
              }`}
            >
              {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Aesthetic Feed Grid */}
      <div className="px-6">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-neutral-800/30 rounded-lg animate-pulse"
                style={{ 
                  gridColumn: getPatternSize(i) === 0.5 ? 'span 1' : 'span 2',
                  gridRow: getPatternSize(i) === 0.5 ? 'span 1' : 'span 2'
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {feedImages.map((image, index) => {
              const category = MAYA_CATEGORIES[image.category as keyof typeof MAYA_CATEGORIES];
              const size = getPatternSize(index);
              
              return (
                <div
                  key={image.id}
                  className="relative group cursor-pointer"
                  style={{ 
                    gridColumn: size === 0.5 ? 'span 1' : 'span 2',
                    gridRow: size === 0.5 ? 'span 1' : 'span 2'
                  }}
                >
                  <div className={`aspect-square relative overflow-hidden rounded-lg ${
                    size === 0.5 ? 'aspect-square' : 'aspect-[2/1]'
                  }`}>
                    <img
                      src={image.url}
                      alt={`${category.name} shot`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Category Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full bg-gradient-to-r ${category.color} backdrop-blur-sm`}>
                      <span className="text-xs text-neutral-200 font-light flex items-center gap-1">
                        <category.icon size={12} strokeWidth={1.5} />
                        {category.name}
                      </span>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(image.id);
                          }}
                          className="flex items-center gap-1 text-white"
                        >
                          <Heart 
                            size={16} 
                            className={image.saved ? 'fill-current text-red-400' : 'text-white'} 
                            strokeWidth={1.5} 
                          />
                          <span className="text-xs font-light">{image.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-white">
                          <MessageCircle size={16} strokeWidth={1.5} />
                          <span className="text-xs font-light">{image.comments}</span>
                        </button>
                        <button className="text-white">
                          <Share2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Maya's Smart Categorization Info */}
      <div className="px-6 py-4 bg-gradient-to-r from-neutral-800/20 to-neutral-900/20 rounded-lg mx-6 border border-neutral-700/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-neutral-700/30 to-neutral-800/30 rounded-full flex items-center justify-center">
            <Sparkles size={16} className="text-neutral-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-light text-neutral-200 tracking-wide">MAYA'S SMART CATEGORIZATION</h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Your images are automatically categorized and arranged using AI-powered aesthetic analysis. 
          Maya analyzes composition, lighting, and visual elements to create the perfect feed layout.
        </p>
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
    component: StudioPage,
    badge: null,
    description: 'Create & Generate'
  },
  {
    id: 'gallery', 
    label: 'Gallery',
    icon: Grid,
    component: () => <SSELFIEGallery hideMemberNav />,
    badge: null,
    description: 'Your Collection'
  },
  {
    id: 'profile',
    label: 'Profile', 
    icon: User,
    component: () => <InstagramStyleProfile user={user} />,
    badge: null,
    description: 'Your Aesthetic Feed'
  },
  {
    id: 'account',
    label: 'Account', 
    icon: Settings,
    component: () => (
      <div className="space-y-8">
        {/* Enhanced Account header */}
        <div className="text-center space-y-2 pt-4">
          <h2 className="text-2xl font-light text-neutral-200 tracking-wide">ACCOUNT</h2>
          <p className="text-neutral-500 text-sm tracking-wide">Settings & Preferences</p>
        </div>
        
        {/* User Info Card */}
        <div className="bg-gradient-to-br from-neutral-800/20 to-neutral-900/20 rounded-editorial-xl border border-neutral-700/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-700/40 to-neutral-800/40 border border-neutral-600/30 flex items-center justify-center">
              {user?.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || 'User'} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={20} className="text-neutral-400" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-light text-neutral-200 tracking-wide">
                {user?.name || 'Maya User'}
              </h3>
              <p className="text-neutral-400 text-sm">{user?.email || 'user@sselfie.com'}</p>
              <p className="text-neutral-500 text-xs tracking-wide">ELITE MEMBER</p>
            </div>
            <button className="text-neutral-400 hover:text-neutral-300 transition-colors">
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        
        {/* Enhanced Settings groups */}
        <div className="space-y-6">
          {[
            { 
              title: 'Notifications', 
              icon: Bell, 
              items: [
                { name: 'Push Notifications', status: 'Enabled', description: 'Get instant updates' },
                { name: 'Email Updates', status: 'Weekly', description: 'Weekly digest' },
                { name: 'SMS Alerts', status: 'Disabled', description: 'Text notifications' }
              ] 
            },
            { 
              title: 'Privacy & Security', 
              icon: Shield, 
              items: [
                { name: 'Profile Visibility', status: 'Public', description: 'Who can see your profile' },
                { name: 'Data Sharing', status: 'Limited', description: 'Analytics and usage data' },
                { name: 'Two-Factor Auth', status: 'Enabled', description: 'Extra security layer' }
              ] 
            },
            { 
              title: 'Appearance', 
              icon: Palette, 
              items: [
                { name: 'Theme', status: 'Dark', description: 'App appearance' },
                { name: 'Language', status: 'English', description: 'Interface language' },
                { name: 'Typography', status: 'Editorial', description: 'Font style' }
              ] 
            },
            { 
              title: 'Subscription', 
              icon: Crown, 
              items: [
                { name: 'Plan', status: 'Elite', description: '€47/month' },
                { name: 'Billing', status: 'Monthly', description: 'Next charge: Dec 15' },
                { name: 'Usage', status: '24/100', description: 'Photos this month' }
              ] 
            },
          ].map((group, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center space-x-3 pb-2 border-b border-neutral-800/30">
                <group.icon size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h3 className="text-lg font-light text-neutral-200 tracking-wide">{group.title.toUpperCase()}</h3>
              </div>
              
              <div className="space-y-2">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between py-4 hover:bg-neutral-800/20 rounded-editorial-lg px-3 transition-colors cursor-pointer group">
                    <div className="flex-1">
                      <span className="text-neutral-200 font-light block">{item.name}</span>
                      <span className="text-neutral-500 text-xs">{item.description}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-neutral-400 text-sm">{item.status}</span>
                      <ChevronRight size={14} className="text-neutral-600 group-hover:text-neutral-500 transition-colors" strokeWidth={1.5} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Sign out */}
        <div className="pt-8 border-t border-neutral-800/30">
          <button className="w-full text-neutral-400 text-sm tracking-wide hover:text-neutral-300 transition-colors py-4 flex items-center justify-center gap-2">
            <Settings size={16} strokeWidth={1.5} />
            SIGN OUT
          </button>
        </div>
      </div>
    ),
    badge: null,
    description: 'Settings'
  },
];

function MobileTabLayout() {
  const [activeTab, setActiveTab] = useState('studio');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user } = useAuth();

  const tabs = createTabs(user);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    
    setIsTransitioning(true);
    setActiveTab(tabId);
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const renderActiveTab = () => {
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return <StudioPage />;
    
    const Component = activeTabConfig.component;
    return <Component />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Breadcrumb */}
      <div className="px-8 py-4 border-b border-neutral-800/30">
        <div className="flex items-center gap-2 text-sm">
          <Home size={14} className="text-neutral-500" strokeWidth={1.5} />
          <ChevronRight size={12} className="text-neutral-600" strokeWidth={1.5} />
          <span className="text-neutral-400 tracking-wide">
            {tabs.find(tab => tab.id === activeTab)?.label || 'Studio'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto" role="main" aria-label="Main content">
        <div className={`editorial-fade-in transition-all duration-300 ${
          isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}>
          {renderActiveTab()}
        </div>
      </main>
      
      {/* Enhanced Floating Tab Bar */}
      <div className="absolute bottom-6 left-4 right-4 z-50">
        <div className="bg-neutral-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-neutral-800/40 px-2 py-3">
          <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col items-center space-y-1 px-4 py-3 rounded-xl transition-all duration-300 group min-h-[56px] touch-manipulation ${
                    isActive 
                      ? 'bg-neutral-800/60 scale-105' 
                      : 'hover:bg-neutral-800/30 hover:scale-102'
                  }`}
                  title={tab.description}
                >
                  <div className="relative">
                <Icon 
                  size={20} 
                  strokeWidth={1.5}
                      className={`transition-all duration-300 ${
                        isActive 
                          ? 'text-neutral-200 scale-110' 
                          : 'text-neutral-500 group-hover:text-neutral-400'
                      }`}
                    />
                    {tab.badge && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{tab.badge}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-light tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'text-neutral-200' 
                      : 'text-neutral-500 group-hover:text-neutral-400'
                  }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}

export { MobileTabLayout };