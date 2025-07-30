import React, { useState, useEffect } from 'react';
import { WebsiteWizard } from './WebsiteWizard';
import { WebsitePreview } from './WebsitePreview';
import { VictoriaChat } from './VictoriaChat';
import { VictoriaEditorialBuilder } from './VictoriaEditorialBuilder';
import { useWebsiteBuilder } from '@/hooks/useWebsiteBuilder';
import { Button } from '@/components/ui/button';

export function AIWebsiteBuilder() {
  const [currentView, setCurrentView] = useState<'mode-select' | 'wizard' | 'chat' | 'preview' | 'customize'>('mode-select');
  const { currentWebsite, generationProgress, isGenerating, simulateProgress } = useWebsiteBuilder();

  useEffect(() => {
    if (isGenerating && generationProgress === 0) {
      simulateProgress();
    }
  }, [isGenerating, generationProgress, simulateProgress]);

  const handleWizardComplete = (website: any) => {
    setCurrentView('preview');
  };

  const handleCustomize = () => {
    setCurrentView('customize');
  };

  const handleDeploy = () => {
    // Website deployed, stay on preview to show success
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-normal mb-8" style={{ fontFamily: 'Times New Roman' }}>
              Generating Your Website
            </h1>
            <div className="max-w-md mx-auto">
              <div className="bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-600 mb-8">
                {generationProgress < 30 
                  ? 'Analyzing your business requirements...'
                  : generationProgress < 60
                  ? 'Selecting optimal template and design...'
                  : generationProgress < 90
                  ? 'Generating content and customizing layout...'
                  : 'Finalizing your website...'
                }
              </p>
              <div className="text-sm text-gray-500">
                Estimated time remaining: {Math.max(0, Math.ceil((100 - generationProgress) / 4))} seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {currentView === 'mode-select' && (
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-12">
            <h1 className="text-5xl font-normal mb-6" style={{ fontFamily: 'Times New Roman' }}>
              Victoria AI Website Builder
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Choose how you'd like to work with Victoria to create your website.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 p-8 hover:border-gray-400 transition-colors">
              <h3 className="text-2xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
                Editorial Website Builder
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Use your gallery images and editorial components to create a luxury website. Victoria will guide you through the process using your personal brand assets.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                <li>Your gallery images as hero content</li>
                <li>Editorial components (HeroFullBleed, MoodboardGallery)</li>
                <li>Flatlay library styling integration</li>
                <li>Conversational customization</li>
              </ul>
              <Button
                onClick={() => setCurrentView('chat')}
                className="w-full bg-black text-white hover:bg-gray-800 py-3"
              >
                Create Editorial Website
              </Button>
            </div>

            <div className="bg-white border border-gray-200 p-8 hover:border-gray-400 transition-colors">
              <h3 className="text-2xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
                Guided Form Builder
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Complete a structured form with your business details and let Victoria generate your website from the information.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                <li>Step-by-step form process</li>
                <li>Structured information gathering</li>
                <li>Quick completion</li>
                <li>Comprehensive requirements</li>
              </ul>
              <Button
                onClick={() => setCurrentView('wizard')}
                variant="outline"
                className="w-full border-black text-black hover:bg-black hover:text-white py-3"
              >
                Use Form Builder
              </Button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'wizard' && (
        <WebsiteWizard onComplete={handleWizardComplete} />
      )}

      {currentView === 'chat' && (
        <VictoriaEditorialBuilder onWebsiteGenerated={handleWizardComplete} />
      )}
      
      {currentView === 'preview' && currentWebsite && (
        <WebsitePreview
          website={currentWebsite}
          onCustomize={handleCustomize}
          onDeploy={handleDeploy}
        />
      )}
      
      {currentView === 'customize' && currentWebsite && (
        <WebsiteCustomizer
          website={currentWebsite}
          onSave={() => setCurrentView('preview')}
        />
      )}
    </div>
  );
}

// Website Customizer Component
function WebsiteCustomizer({ website, onSave }: { website: any; onSave: () => void }) {
  const [customizations, setCustomizations] = useState({
    colors: {
      primary: '#1a1a1a',
      secondary: '#f5f5f5',
      accent: '#666666'
    },
    typography: {
      headingFont: 'Times New Roman',
      bodyFont: 'Georgia'
    }
  });

  const { customizeWebsite, isCustomizing } = useWebsiteBuilder();

  const handleSave = async () => {
    try {
      await customizeWebsite.mutateAsync({
        siteId: website.id,
        modifications: customizations
      });
      onSave();
    } catch (error) {
      console.error('Customization failed:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
          Customize Your Website
        </h1>
        <p className="text-gray-600">
          Adjust colors, typography, and content to match your brand perfectly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-lg font-medium mb-4">Color Scheme</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={customizations.colors.primary}
                  onChange={(e) => setCustomizations(prev => ({
                    ...prev,
                    colors: { ...prev.colors, primary: e.target.value }
                  }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <input
                  type="color"
                  value={customizations.colors.secondary}
                  onChange={(e) => setCustomizations(prev => ({
                    ...prev,
                    colors: { ...prev.colors, secondary: e.target.value }
                  }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-lg font-medium mb-4">Typography</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading Font
                </label>
                <select
                  value={customizations.typography.headingFont}
                  onChange={(e) => setCustomizations(prev => ({
                    ...prev,
                    typography: { ...prev.typography, headingFont: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isCustomizing}
            className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {isCustomizing ? 'Saving Changes...' : 'Save Customizations'}
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="border border-gray-300 bg-gray-50 p-4">
            <iframe
              src={`data:text/html;charset=utf-8,${encodeURIComponent(website.preview)}`}
              className="w-full h-[600px] bg-white border border-gray-200"
              title="Website Customization Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}