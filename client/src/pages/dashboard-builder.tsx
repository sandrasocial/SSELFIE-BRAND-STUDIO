import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { SandraAiChat } from '@/components/sandra-ai-chat';
import { SandraImages } from '@/lib/sandra-images';
import { DashboardPreview, TemplateSelector, dashboardTemplates } from '@/components/dashboard/DashboardTemplates';
import { WidgetSelector, PhotoUpload, availableWidgets } from '@/components/dashboard/DashboardWidgets';
import { useAuth } from '@/hooks/use-auth';

interface DashboardBuilderProps {}

export default function DashboardBuilder({}: DashboardBuilderProps) {
  const [, setLocation] = useLocation();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [dashboardConfig, setDashboardConfig] = useState({
    templateType: 'minimal-executive',
    layout: 'grid-3',
    widgets: ['analytics', 'revenue-tracker', 'brandbook-preview', 'quick-links', 'recent-activity'],
    theme: 'luxury'
  });
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(['analytics', 'revenue-tracker', 'brandbook-preview']);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const { user } = useAuth();

  const handleWidgetToggle = (widgetId: string) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
    
    // Update dashboard config
    setDashboardConfig(prev => ({
      ...prev,
      widgets: selectedWidgets.includes(widgetId) 
        ? prev.widgets.filter(id => id !== widgetId)
        : [...prev.widgets, widgetId]
    }));
  };

  const handlePhotoUpload = (file: File) => {
    // Handle photo upload logic
    console.log('Photo uploaded:', file);
    setShowPhotoUpload(false);
  };

  useEffect(() => {
    // Load onboarding data
    const savedData = localStorage.getItem('brandbookOnboardingData');
    if (savedData) {
      setOnboardingData(JSON.parse(savedData));
    }
    
    // Fetch from database as backup
    fetch('/api/onboarding')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setOnboardingData(data);
        }
      })
      .catch(err => console.error('Error loading onboarding data:', err));
  }, []);

  const handleDashboardUpdate = (updates: any) => {
    setDashboardConfig(prev => ({ ...prev, ...updates }));
  };

  const handleTemplateChange = (templateId: string) => {
    const template = dashboardTemplates.find(t => t.id === templateId);
    if (template) {
      setDashboardConfig(prev => ({
        ...prev,
        templateType: templateId,
        layout: template.layout,
        widgets: template.widgets,
        theme: template.theme
      }));
    }
  };

  const handleSaveDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: dashboardConfig, onboardingData })
      });
      
      if (response.ok) {
        setLocation('/workspace');
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroFullBleed 
        title="DASHBOARD"
        subtitle="BUILDER"
        tagline="Create Your Personal Workspace"
        ctaText="Design Dashboard"
        backgroundImage={SandraImages.editorial.laptop1}
      />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[800px]">
          
          {/* Sandra AI Designer Chat */}
          <div className="border border-[#e5e5e5] bg-white flex flex-col">
            <div className="bg-[#f5f5f5] p-4 border-b border-[#e5e5e5]">
              <h3 className="text-lg font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                Sandra AI Designer
              </h3>
              <p className="text-sm text-[#666] mt-1">
                Design your personalized dashboard
              </p>
            </div>
            
            <div className="p-6 border-b border-[#e5e5e5]">
              <TemplateSelector 
                selectedTemplate={dashboardConfig.templateType}
                onTemplateChange={handleTemplateChange}
              />
            </div>
            
            <div className="flex-1 flex flex-col">
              <SandraAiChat 
                context="dashboard-builder"
                userContext={onboardingData}
                dashboardConfig={dashboardConfig}
                onUpdate={handleDashboardUpdate}
                placeholder="Tell Sandra what you want in your dashboard..."
              />
              
              {/* Widget Selection Actions */}
              <div className="mt-4 p-4 border-t border-[#e5e5e5]">
                <div className="text-xs uppercase tracking-[0.2em] text-[#666] mb-3">
                  Dashboard Tools
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setShowWidgetSelector(true)}
                    className="w-full text-left p-3 border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors"
                  >
                    <div className="text-sm text-[#0a0a0a]">Select Widgets</div>
                    <div className="text-xs text-[#666]">Choose which widgets to display</div>
                  </button>
                  
                  <button
                    onClick={() => setShowPhotoUpload(true)}
                    className="w-full text-left p-3 border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors"
                  >
                    <div className="text-sm text-[#0a0a0a]">Upload Photos</div>
                    <div className="text-xs text-[#666]">Add your own images</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Dashboard Preview */}
          <div className="border border-[#e5e5e5] bg-white overflow-hidden">
            <div className="bg-[#f5f5f5] p-4 border-b border-[#e5e5e5] flex justify-between items-center">
              <h3 className="text-lg font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                Live Preview
              </h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-white border border-[#e5e5e5] text-[#666] hover:bg-[#f5f5f5]">
                  Desktop
                </button>
                <button className="px-3 py-1 text-xs bg-[#f5f5f5] border border-[#e5e5e5] text-[#0a0a0a]">
                  Mobile
                </button>
              </div>
            </div>
            
            <div className="p-6 h-full overflow-y-auto bg-[#fafafa]">
              <DashboardPreview 
                config={dashboardConfig}
                onboardingData={onboardingData}
                user={user}
              />
            </div>
          </div>

        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <div className="space-x-4">
            <button 
              onClick={() => setLocation('/workspace')}
              className="px-8 py-3 border border-[#e5e5e5] text-[#666] hover:text-[#0a0a0a] hover:border-[#0a0a0a] text-sm uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveDashboard}
              className="px-8 py-3 bg-[#0a0a0a] text-white text-sm uppercase tracking-wider hover:bg-[#333] transition-colors"
            >
              Save Dashboard
            </button>
          </div>
        </div>
      </div>
      
      {/* Widget Selection Modal */}
      {showWidgetSelector && (
        <div className="fixed inset-0 bg-[#0a0a0a]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5e5] max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-[#f5f5f5] p-4 border-b border-[#e5e5e5] flex justify-between items-center">
              <h3 className="text-lg font-light text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                Select Dashboard Widgets
              </h3>
              <button 
                onClick={() => setShowWidgetSelector(false)}
                className="text-[#666] hover:text-[#0a0a0a] text-xl"
              >
                ×
              </button>
            </div>

            {/* Widget Selection */}
            <div className="flex-1 p-4 overflow-y-auto">
              <WidgetSelector
                availableWidgets={availableWidgets}
                selectedWidgets={selectedWidgets}
                onWidgetToggle={handleWidgetToggle}
              />
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-[#e5e5e5] bg-[#f5f5f5]">
              <button
                onClick={() => setShowWidgetSelector(false)}
                className="w-full bg-[#0a0a0a] text-white py-3 px-6 text-sm uppercase tracking-wider hover:bg-[#333] transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUpload
          onPhotoUpload={handlePhotoUpload}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}
    </div>
  );
}