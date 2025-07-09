import React from 'react';
import { 
  BrandbookPreviewWidget, 
  AIImagesWidget, 
  AnalyticsWidget,
  RevenueTrackerWidget,
  QuickLinksWidget,
  SocialStatsWidget,
  BookingCalendarWidget,
  RecentActivityWidget,
  ImageOverlayWidget
} from './DashboardWidgets';
import { SandraImages } from '@/lib/sandra-images';

// Dashboard Template Interface
export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  layout: 'grid-2' | 'grid-3' | 'masonry' | 'hero-focus';
  theme: 'minimal' | 'executive' | 'creative' | 'luxury';
  widgets: string[];
}

// Dashboard Templates
export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'minimal-executive',
    name: 'Executive Dashboard',
    description: 'Clean, professional layout for business leaders',
    layout: 'grid-3',
    theme: 'minimal',
    widgets: ['analytics', 'revenue-tracker', 'brandbook-preview', 'quick-links', 'recent-activity']
  },
  {
    id: 'creative-entrepreneur',
    name: 'Creative Entrepreneur',
    description: 'Inspiring layout for creative professionals',
    layout: 'masonry',
    theme: 'creative',
    widgets: ['ai-images', 'social-stats', 'brandbook-preview', 'booking-calendar', 'recent-activity']
  },
  {
    id: 'service-provider',
    name: 'Service Provider',
    description: 'Service-focused with booking and client management',
    layout: 'grid-2',
    theme: 'executive',
    widgets: ['booking-calendar', 'revenue-tracker', 'social-stats', 'quick-links', 'recent-activity']
  },
  {
    id: 'luxury-brand',
    name: 'Luxury Brand',
    description: 'Premium aesthetic with editorial focus',
    layout: 'hero-focus',
    theme: 'luxury',
    widgets: ['analytics', 'ai-images', 'brandbook-preview', 'social-stats', 'revenue-tracker']
  }
];

// Dashboard Template Renderer
export function DashboardTemplateRenderer({ 
  template, 
  data, 
  onboardingData 
}: { 
  template: DashboardTemplate;
  data?: any;
  onboardingData?: any;
}) {
  const renderWidget = (widgetType: string, index: number) => {
    const widgetProps = { data, onboardingData };
    
    switch (widgetType) {
      case 'brandbook-preview':
        return <BrandbookPreviewWidget key={widgetType + index} {...widgetProps} />;
      case 'ai-images':
        return <AIImagesWidget key={widgetType + index} {...widgetProps} />;
      case 'analytics':
        return <AnalyticsWidget key={widgetType + index} {...widgetProps} />;
      case 'revenue-tracker':
        return <RevenueTrackerWidget key={widgetType + index} {...widgetProps} />;
      case 'quick-links':
        return <QuickLinksWidget key={widgetType + index} {...widgetProps} />;
      case 'social-stats':
        return <SocialStatsWidget key={widgetType + index} {...widgetProps} />;
      case 'booking-calendar':
        return <BookingCalendarWidget key={widgetType + index} {...widgetProps} />;
      case 'recent-activity':
        return <RecentActivityWidget key={widgetType + index} {...widgetProps} />;
      default:
        return null;
    }
  };

  const getLayoutClasses = () => {
    switch (template.layout) {
      case 'grid-2':
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
      case 'grid-3':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'masonry':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'hero-focus':
        return 'space-y-6';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  // Hero Focus Layout (Analytics takes full width at top)
  if (template.layout === 'hero-focus') {
    const heroWidget = template.widgets.find(w => w === 'analytics');
    const otherWidgets = template.widgets.filter(w => w !== 'analytics');
    
    return (
      <div className="space-y-6">
        {heroWidget && renderWidget(heroWidget, 0)}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherWidgets.map((widget, index) => renderWidget(widget, index + 1))}
        </div>
      </div>
    );
  }

  return (
    <div className={getLayoutClasses()}>
      {template.widgets.map((widget, index) => renderWidget(widget, index))}
    </div>
  );
}

// Template Selector Component
export function TemplateSelector({ 
  selectedTemplate, 
  onTemplateChange 
}: { 
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-xs uppercase tracking-[0.2em] text-[#666] mb-4">
        CHOOSE TEMPLATE
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboardTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`border p-4 text-left transition-colors ${
              selectedTemplate === template.id
                ? 'border-[#0a0a0a] bg-[#f5f5f5]'
                : 'border-[#e5e5e5] hover:border-[#0a0a0a]'
            }`}
          >
            <div className="text-lg font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
              {template.name}
            </div>
            <div className="text-sm text-[#666] mb-3">
              {template.description}
            </div>
            <div className="text-xs uppercase tracking-wider text-[#666]">
              {template.theme} • {template.layout}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Dashboard Hero Section
export function DashboardHeroSection({ 
  user, 
  onboardingData 
}: { 
  user?: any;
  onboardingData?: any;
}) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const firstName = user?.firstName || onboardingData?.firstName || 'Sandra';
  const businessName = onboardingData?.businessName || 'Your Business';

  return (
    <div className="relative h-[50vh] overflow-hidden mb-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={SandraImages.editorial.laptop1} 
          alt="Dashboard hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/70 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-white/80 mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              YOUR DASHBOARD
            </div>
            <h1 className="text-6xl font-light text-white mb-4 leading-none" style={{ fontFamily: 'Times New Roman, serif' }}>
              W E L C O M E
            </h1>
            <h2 className="text-5xl font-light text-white mb-8 leading-none" style={{ fontFamily: 'Times New Roman, serif' }}>
              {firstName.toUpperCase()}
            </h2>
            <p className="text-xl text-white/90 mb-6 font-light">
              {today}
            </p>
            <p className="text-lg text-white/80 italic mb-12 font-light">
              "{businessName} - Building your empire, one selfie at a time."
            </p>
            <button className="border border-white text-white px-8 py-4 text-sm uppercase tracking-wider hover:bg-white hover:text-[#0a0a0a] transition-all duration-300">
              Ready to create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Complete Dashboard Preview Component
export function DashboardPreview({ 
  config, 
  onboardingData, 
  user 
}: { 
  config: any;
  onboardingData?: any;
  user?: any;
}) {
  const selectedTemplate = dashboardTemplates.find(t => t.id === config.templateType) || dashboardTemplates[0];
  
  if (!onboardingData) {
    return (
      <div className="flex items-center justify-center h-full text-[#666]">
        Loading your brand data...
      </div>
    );
  }

  // Mock data for preview
  const mockData = {
    analytics: {
      totalViews: 89234,
      growth: 34.2
    },
    revenue: {
      total: 12750,
      growth: 15.8
    },
    socialStats: {
      followers: 120000,
      engagement: 12.4,
      newFollowers: 1856,
      reach: 89234
    },
    aiImages: [
      { id: 1, style: 'editorial', isSelected: true },
      { id: 2, style: 'business', isSelected: true },
      { id: 3, style: 'luxury', isSelected: false }
    ],
    brandbook: {
      template: 'Executive Essence'
    },
    bookings: {
      todayBookings: 3,
      weekBookings: 12,
      monthRevenue: 4500
    },
    quickLinks: [
      { name: 'Instagram', url: 'https://instagram.com/sandra.social', icon: '01' },
      { name: 'Website', url: '#', icon: '02' },
      { name: 'Booking', url: '#', icon: '03' },
      { name: 'Analytics', url: '#', icon: '04' }
    ],
    recentActivity: [
      { action: "New AI images generated", timestamp: "2 hours ago", amount: "4 images" },
      { action: "Brandbook updated", timestamp: "1 day ago", amount: "Luxury" },
      { action: "Dashboard customized", timestamp: "2 days ago", amount: "Complete" }
    ]
  };

  return (
    <div className="space-y-8">
      <DashboardHeroSection user={user} onboardingData={onboardingData} />
      <DashboardTemplateRenderer 
        template={selectedTemplate}
        data={mockData}
        onboardingData={onboardingData}
      />
    </div>
  );
}