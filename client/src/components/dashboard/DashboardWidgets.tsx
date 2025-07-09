import React, { useState } from 'react';
import { SandraImages } from '@/lib/sandra-images';
import { MoodboardCollections, getMoodboardCollection } from '@/lib/moodboard-collections';

// Widget Interface
interface DashboardWidget {
  id: string;
  type: 'brandbook-preview' | 'ai-images' | 'analytics' | 'booking-calendar' | 'quick-links' | 'revenue-tracker' | 'social-stats';
  title: string;
  size: 'small' | 'medium' | 'large' | 'hero';
  config: any;
  isSelected?: boolean;
}

// Widget Selection Interface
interface WidgetSelectorProps {
  availableWidgets: DashboardWidget[];
  selectedWidgets: string[];
  onWidgetToggle: (widgetId: string) => void;
}

// Photo Upload Interface
interface PhotoUploadProps {
  onPhotoUpload: (file: File) => void;
  onClose: () => void;
}

// Image Selector Component
interface ImageSelectorProps {
  selectedImage: string;
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
}

// Photo Upload Component
function PhotoUpload({ onPhotoUpload, onClose }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPhotoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPhotoUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#e5e5e5] max-w-md w-full">
        
        {/* Header */}
        <div className="bg-[#f5f5f5] p-4 border-b border-[#e5e5e5] flex justify-between items-center">
          <h3 className="text-lg font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Upload Your Photo
          </h3>
          <button 
            onClick={onClose}
            className="text-[#666] hover:text-[#0a0a0a] text-xl"
          >
            ×
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-8">
          <div
            className={`border-2 border-dashed ${dragActive ? 'border-[#0a0a0a] bg-[#f5f5f5]' : 'border-[#e5e5e5]'} p-8 text-center transition-colors`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mb-4">
              <div className="text-6xl text-[#666] mb-4 font-light">+</div>
              <div className="text-lg text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                Drop your photo here
              </div>
              <div className="text-sm text-[#666] mb-4">
                or click to browse
              </div>
            </div>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            
            <label
              htmlFor="photo-upload"
              className="inline-block bg-[#0a0a0a] text-white px-6 py-3 text-sm uppercase tracking-wider cursor-pointer hover:bg-[#333] transition-colors"
            >
              Choose Photo
            </label>
          </div>
          
          <div className="text-xs text-[#666] mt-4">
            Supports JPG, PNG, GIF up to 10MB
          </div>
        </div>
      </div>
    </div>
  );
}

// Widget Selector Component
function WidgetSelector({ availableWidgets, selectedWidgets, onWidgetToggle }: WidgetSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-xs uppercase tracking-[0.2em] text-[#666] mb-4">
        Choose Widgets for Your Dashboard
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {availableWidgets.map((widget) => (
          <button
            key={widget.id}
            onClick={() => onWidgetToggle(widget.id)}
            className={`p-4 border text-left transition-colors ${
              selectedWidgets.includes(widget.id)
                ? 'border-[#0a0a0a] bg-[#f5f5f5]'
                : 'border-[#e5e5e5] hover:border-[#0a0a0a]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[#0a0a0a] mb-1">
                  {widget.title}
                </div>
                <div className="text-xs text-[#666]">
                  {widget.type.replace('-', ' ')}
                </div>
              </div>
              <div className={`w-4 h-4 border ${
                selectedWidgets.includes(widget.id)
                  ? 'bg-[#0a0a0a] border-[#0a0a0a]'
                  : 'border-[#e5e5e5]'
              }`}>
                {selectedWidgets.includes(widget.id) && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-xs">✓</div>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageSelector({ selectedImage, onImageSelect, onClose }: ImageSelectorProps) {
  const [selectedCollection, setSelectedCollection] = useState('luxury-minimal');
  
  const collections = [
    { id: 'luxury-minimal', name: 'Luxury Minimal', count: 200 },
    { id: 'editorial-magazine', name: 'Editorial Magazine', count: 471 },
    { id: 'feminine-soft', name: 'Feminine Soft', count: 200 },
    { id: 'business-professional', name: 'Business Professional', count: 200 },
    { id: 'bohemian-creative', name: 'Bohemian Creative', count: 200 },
    { id: 'modern-tech', name: 'Modern Tech', count: 100 },
    { id: 'wellness-reiki', name: 'Wellness & Reiki', count: 100 },
    { id: 'fashion-beauty', name: 'Fashion Beauty', count: 75 }
  ];

  const selectedCollectionData = getMoodboardCollection(selectedCollection);
  
  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#e5e5e5] max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#f5f5f5] p-4 border-b border-[#e5e5e5] flex justify-between items-center">
          <h3 className="text-lg font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Choose Background Image
          </h3>
          <button 
            onClick={onClose}
            className="text-[#666] hover:text-[#0a0a0a] text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex h-[70vh]">
          
          {/* Collection Sidebar */}
          <div className="w-64 border-r border-[#e5e5e5] p-4 overflow-y-auto">
            <div className="text-xs uppercase tracking-[0.2em] text-[#666] mb-4">
              IMAGE SOURCES
            </div>
            
            {/* Upload Your Photo Option */}
            <button
              onClick={() => {
                // Handle photo upload
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const imageUrl = e.target?.result as string;
                      onImageSelect(imageUrl);
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
              className="w-full text-left p-3 border border-[#0a0a0a] bg-[#0a0a0a] text-white hover:bg-[#333] transition-colors mb-4"
            >
              <div className="text-sm mb-1">
                Upload Your Photo
              </div>
              <div className="text-xs text-white/70">
                Use your own image
              </div>
            </button>
            
            <div className="text-xs uppercase tracking-[0.2em] text-[#666] mb-4">
              MOODBOARD COLLECTIONS
            </div>
            
            <div className="space-y-2">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection.id)}
                  className={`w-full text-left p-3 border transition-colors ${
                    selectedCollection === collection.id
                      ? 'border-[#0a0a0a] bg-[#f5f5f5]'
                      : 'border-[#e5e5e5] hover:border-[#0a0a0a]'
                  }`}
                >
                  <div className="text-sm text-[#0a0a0a] mb-1">
                    {collection.name}
                  </div>
                  <div className="text-xs text-[#666]">
                    {collection.count} images
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Image Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {selectedCollectionData?.images.slice(0, 50).map((image, index) => (
                <button
                  key={index}
                  onClick={() => onImageSelect(image)}
                  className={`aspect-square overflow-hidden border-2 transition-all ${
                    selectedImage === image
                      ? 'border-[#0a0a0a]'
                      : 'border-[#e5e5e5] hover:border-[#0a0a0a]'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${selectedCollectionData.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f5f5f5] p-4 border-t border-[#e5e5e5] flex justify-between">
          <div className="text-sm text-[#666]">
            Select an image for your widget background
          </div>
          <div className="space-x-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-[#e5e5e5] text-[#666] hover:text-[#0a0a0a] hover:border-[#0a0a0a] text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-[#0a0a0a] text-white text-sm hover:bg-[#333] transition-colors"
            >
              Use Selected Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Image Overlay Base Widget Component
interface ImageOverlayWidgetProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
  value: string;
  growth?: string;
  size?: 'small' | 'medium' | 'large' | 'hero';
  theme?: 'dark' | 'light';
  onClick?: () => void;
}

export function ImageOverlayWidget({ 
  backgroundImage, 
  title, 
  subtitle, 
  value, 
  growth, 
  size = 'medium',
  theme = 'dark',
  onClick
}: ImageOverlayWidgetProps) {
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState(backgroundImage);

  const sizeClasses = {
    small: 'aspect-square',
    medium: 'aspect-[4/3]',
    large: 'aspect-[16/9]',
    hero: 'aspect-[21/9]'
  };

  const handleImageSelect = (imageUrl: string) => {
    setCurrentBackgroundImage(imageUrl);
  };

  return (
    <>
      <div 
        className={`relative overflow-hidden cursor-pointer group ${sizeClasses[size]}`}
        onClick={onClick}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={currentBackgroundImage} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className={`absolute inset-0 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-[#0a0a0a]/90 via-[#0a0a0a]/70 to-[#0a0a0a]/30' 
              : 'bg-gradient-to-br from-white/90 via-white/70 to-white/30'
          }`}></div>
        </div>

        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowImageSelector(true);
          }}
          className="absolute top-4 right-4 bg-white/20 text-white border border-white/30 px-3 py-1 text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
        >
          Change Image
        </button>
        
        {/* Content Overlay */}
        <div className="relative z-10 p-8 h-full flex flex-col justify-between">
          <div className="text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
            {subtitle}
          </div>
          
          <div>
            <h3 className="text-4xl font-light text-white mb-2 leading-none" style={{ fontFamily: 'Times New Roman, serif' }}>
              {value}
            </h3>
            <div className="text-xl font-light text-white" style={{ fontFamily: 'Times New Roman, serif' }}>
              {title}
            </div>
            {growth && (
              <div className="text-sm text-white/80 mt-2">
                +{growth}% growth
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Selector Modal */}
      {showImageSelector && (
        <ImageSelector
          selectedImage={currentBackgroundImage}
          onImageSelect={handleImageSelect}
          onClose={() => setShowImageSelector(false)}
        />
      )}
    </>
  );
}

// Brandbook Preview Widget
export function BrandbookPreviewWidget({ 
  data, 
  onboardingData 
}: { 
  data?: any; 
  onboardingData?: any; 
}) {
  const brandbook = data?.brandbook || {};
  const businessName = onboardingData?.businessName || 'Your Business';
  
  return (
    <ImageOverlayWidget
      backgroundImage={SandraImages.editorial.laptop1}
      title="Your Brandbook"
      subtitle="BRAND IDENTITY"
      value={brandbook.template || 'Ready'}
      onClick={() => window.location.href = '/brandbook-designer'}
    />
  );
}

// AI Images Gallery Widget
export function AIImagesWidget({ 
  data, 
  onboardingData 
}: { 
  data?: any; 
  onboardingData?: any; 
}) {
  const aiImages = data?.aiImages || [];
  const totalImages = aiImages.length || 0;
  
  return (
    <ImageOverlayWidget
      backgroundImage={SandraImages.editorial.selfie1}
      title="AI Images"
      subtitle="GENERATED"
      value={totalImages.toString()}
      onClick={() => window.location.href = '/ai-generator'}
    />
  );
}

// Analytics Widget
export function AnalyticsWidget({ 
  data, 
  onboardingData 
}: { 
  data?: any; 
  onboardingData?: any; 
}) {
  const analytics = data?.analytics || {};
  const totalViews = analytics.totalViews || 0;
  const growth = analytics.growth || 0;
  
  return (
    <ImageOverlayWidget
      backgroundImage={SandraImages.editorial.magazine1}
      title="Total Reach"
      subtitle="ANALYTICS"
      value={totalViews.toLocaleString()}
      growth={growth.toString()}
      size="hero"
    />
  );
}

// Revenue Tracker Widget
export function RevenueTrackerWidget({ 
  data, 
  onboardingData 
}: { 
  data?: any; 
  onboardingData?: any; 
}) {
  const revenue = data?.revenue || {};
  const totalRevenue = revenue.total || 0;
  const growth = revenue.growth || 0;
  
  return (
    <ImageOverlayWidget
      backgroundImage={SandraImages.editorial.luxury1}
      title="Revenue"
      subtitle="EARNINGS"
      value={`€${totalRevenue.toLocaleString()}`}
      growth={growth.toString()}
    />
  );
}

// Quick Links Widget
export function QuickLinksWidget({ 
  data, 
  onboardingData 
}: { 
  data?: any; 
  onboardingData?: any; 
}) {
  const quickLinks = data?.quickLinks || [
    { name: 'Instagram', url: 'https://instagram.com', icon: '01' },
    { name: 'Website', url: '#', icon: '02' },
    { name: 'Booking', url: '#', icon: '03' },
    { name: 'Analytics', url: '#', icon: '04' }
  ];

  return (
    <div className="bg-white border border-[#e5e5e5] p-8 h-full">
      <div className="text-xs uppercase tracking-[0.2em] text-[#666] mb-6">
        QUICK LINKS
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => window.open(link.url, '_blank')}
            className="aspect-square border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors group"
          >
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div className="text-2xl font-light text-[#666] group-hover:text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                {link.icon}
              </div>
              <div className="text-xs uppercase tracking-wider text-[#666] group-hover:text-[#0a0a0a] text-center">
                {link.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Social Stats Widget
export function SocialStatsWidget({ 
  data, 
  onboardingData 
}: { 
  data?: any; 
  onboardingData?: any; 
}) {
  const socialStats = data?.socialStats || {
    followers: 120000,
    engagement: 12.4,
    newFollowers: 1856,
    reach: 89234
  };

  const stats = [
    { 
      label: 'Followers', 
      value: socialStats.followers.toLocaleString(),
      sublabel: 'Instagram',
      image: SandraImages.editorial.selfie2
    },
    { 
      label: 'Engagement', 
      value: `${socialStats.engagement}%`,
      sublabel: 'Rate',
      image: SandraImages.editorial.magazine2
    },
    { 
      label: 'New Followers', 
      value: `+${socialStats.newFollowers}`,
      sublabel: 'This Week',
      image: SandraImages.editorial.luxury2
    },
    { 
      label: 'Reach', 
      value: socialStats.reach.toLocaleString(),
      sublabel: 'This Month',
      image: SandraImages.editorial.laptop2
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="relative aspect-square overflow-hidden group cursor-pointer">
          <div className="absolute inset-0">
            <img 
              src={stat.image} 
              alt={stat.label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-6 h-full flex flex-col justify-end text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
              {stat.sublabel}
            </div>
            <div className="text-2xl font-light text-white mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
              {stat.value}
            </div>
            <div className="text-sm text-white/90 font-light">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Booking Calendar Widget
export function BookingCalendarWidget({ 
  data, 
  onboardingData 
}: { 
  data?: any; 
  onboardingData?: any; 
}) {
  const bookings = data?.bookings || {
    todayBookings: 3,
    weekBookings: 12,
    monthRevenue: 4500
  };
  
  return (
    <div className="bg-white border border-[#e5e5e5] p-8 h-full">
      <div className="text-xs uppercase tracking-[0.2em] text-[#666] mb-6">
        BOOKING CALENDAR
      </div>
      
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
            {bookings.todayBookings}
          </div>
          <div className="text-sm text-[#666] uppercase tracking-wider">Today's Bookings</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#f5f5f5]">
          <div className="text-center">
            <div className="text-2xl font-light text-[#0a0a0a] mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
              {bookings.weekBookings}
            </div>
            <div className="text-xs text-[#666] uppercase tracking-wider">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-[#0a0a0a] mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
              €{bookings.monthRevenue}
            </div>
            <div className="text-xs text-[#666] uppercase tracking-wider">Monthly Revenue</div>
          </div>
        </div>
        
        <button className="w-full border border-[#e5e5e5] py-3 text-xs uppercase tracking-wider text-[#666] hover:text-[#0a0a0a] hover:border-[#0a0a0a] transition-colors">
          View Calendar
        </button>
      </div>
    </div>
  );
}

// Recent Activity Widget
export function RecentActivityWidget({ 
  data, 
  onboardingData 
}: { 
  data?: any; 
  onboardingData?: any; 
}) {
  const activities = data?.recentActivity || [
    { action: "New AI images generated", timestamp: "2 hours ago", amount: "4 images" },
    { action: "Brandbook template updated", timestamp: "4 hours ago", amount: "Luxury theme" },
    { action: "Dashboard customized", timestamp: "1 day ago", amount: "5 widgets" }
  ];

  return (
    <div className="bg-white border border-[#e5e5e5] p-8 h-full">
      <div className="text-xs uppercase tracking-[0.2em] text-[#666] mb-6">
        RECENT ACTIVITY
      </div>
      
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={index} className="flex justify-between items-start border-b border-[#f5f5f5] pb-4 last:border-0">
            <div className="flex items-start space-x-4">
              <div className="text-xs text-[#666] mt-1">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="text-sm text-[#0a0a0a] mb-1">
                  {activity.action}
                </div>
                <div className="text-xs text-[#666]">
                  {activity.timestamp}
                </div>
              </div>
            </div>
            <div className="text-lg font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
              {activity.amount}
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 border border-[#e5e5e5] py-3 text-xs uppercase tracking-wider text-[#666] hover:text-[#0a0a0a] hover:border-[#0a0a0a] transition-colors">
        View All Activity
      </button>
    </div>
  );
}

// Export components for use in dashboard builder
export { WidgetSelector, PhotoUpload };

// Available widgets configuration
export const availableWidgets: DashboardWidget[] = [
  {
    id: 'analytics',
    type: 'analytics',
    title: 'Analytics Overview',
    size: 'medium',
    config: { theme: 'dark' }
  },
  {
    id: 'revenue-tracker',
    type: 'revenue-tracker', 
    title: 'Revenue Tracker',
    size: 'medium',
    config: { theme: 'dark' }
  },
  {
    id: 'brandbook-preview',
    type: 'brandbook-preview',
    title: 'Brandbook Preview',
    size: 'large',
    config: { theme: 'light' }
  },
  {
    id: 'ai-images',
    type: 'ai-images',
    title: 'AI Images Gallery',
    size: 'medium',
    config: { theme: 'light' }
  },
  {
    id: 'quick-links',
    type: 'quick-links',
    title: 'Quick Actions',
    size: 'small',
    config: { theme: 'light' }
  },
  {
    id: 'social-stats',
    type: 'social-stats',
    title: 'Social Media Stats',
    size: 'medium',
    config: { theme: 'dark' }
  },
  {
    id: 'booking-calendar',
    type: 'booking-calendar',
    title: 'Booking Calendar',
    size: 'large',
    config: { theme: 'light' }
  }
];