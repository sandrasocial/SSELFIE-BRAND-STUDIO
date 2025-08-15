import React, { useState, useEffect } from 'react';
import { WebsiteWizard } from './WebsiteWizard';
import { WebsitePreview } from './WebsitePreview';
import { VictoriaChat } from './VictoriaChat';
import { VictoriaEditorialBuilder } from './VictoriaEditorialBuilder';
import { RealImageSelection } from './components/onboarding/RealImageSelection';
import { PersonalBrandQuestionnaire, type PersonalBrandAssessment } from './components/onboarding/PersonalBrandQuestionnaire';
import { useWebsiteBuilder } from './hooks/useWebsiteBuilder';
import { Button } from './components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './hooks/use-toast';
import { apiRequest } from './lib/queryClient';

export function AIWebsiteBuilder() {
  const [currentView, setCurrentView] = useState<'checking' | 'photo-selection' | 'brand-questionnaire' | 'mode-select' | 'wizard' | 'chat' | 'preview' | 'customize'>('checking');
  const [selectedImages, setSelectedImages] = useState<any>(null);
  const [brandAssessment, setBrandAssessment] = useState<PersonalBrandAssessment>({
    personalStory: '',
    targetAudience: '',
    personalGoals: [],
    expertise: [],
    personality: '',
    uniqueValue: '',
    dreamClients: ''
  });
  const { currentWebsite, generationProgress, isGenerating, simulateProgress } = useWebsiteBuilder();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has existing brand onboarding data (admin-built system)
  const { data: existingOnboarding, isLoading: checkingOnboarding } = useQuery({
    queryKey: ['/api/brand-onboarding'],
    retry: false,
  }) as { data: any | undefined; isLoading: boolean };

  // Check if user has existing websites
  const { data: userWebsites, isLoading: checkingWebsites } = useQuery({
    queryKey: ['/api/victoria/websites'],
    retry: false,
  }) as { data: any[] | undefined; isLoading: boolean };

  useEffect(() => {
    if (isGenerating && generationProgress === 0) {
      simulateProgress();
    }
  }, [isGenerating, generationProgress, simulateProgress]);

  // Handle user flow - start with photo selection for new users
  useEffect(() => {
    if (!checkingOnboarding && !checkingWebsites) {
      console.log('🔍 BUILD Navigation:', {
        hasBrandOnboarding: !!existingOnboarding,
        websiteCount: userWebsites?.length || 0
      });
      
      // If user has completed brand onboarding and has websites, skip to website management
      if (existingOnboarding && userWebsites && userWebsites.length > 0) {
        console.log('✅ Returning user with websites, skipping to preview');
        setCurrentView('preview');
      } else if (existingOnboarding) {
        console.log('✅ Returning user with brand onboarding, showing mode selection');
        setCurrentView('mode-select');
      } else {
        console.log('🆕 New user, starting with photo selection');
        setCurrentView('photo-selection');
      }
    }
  }, [checkingOnboarding, checkingWebsites, existingOnboarding, userWebsites]);

  // Save brand assessment mutation
  const saveBrandAssessmentMutation = useMutation({
    mutationFn: async (data: PersonalBrandAssessment & { selectedImages: any }) => {
      return apiRequest('POST', '/api/save-brand-assessment', data);
    },
    onSuccess: () => {
      toast({
        title: "Personal Brand Saved",
        description: "Your brand story and photos have been saved. Let's create your website!",
      });
      setCurrentView('mode-select');
      // Refresh onboarding data
      queryClient.invalidateQueries({ queryKey: ['/api/brand-onboarding'] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save your brand information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoSelectionComplete = (images: any) => {
    setSelectedImages(images);
    setCurrentView('brand-questionnaire');
  };

  const handleBrandQuestionnaireComplete = () => {
    if (!selectedImages) return;
    
    saveBrandAssessmentMutation.mutate({
      ...brandAssessment,
      selectedImages
    });
  };

  const handleWizardComplete = (website: any) => {
    setCurrentView('preview');
  };

  const handleCustomize = () => {
    setCurrentView('customize');
  };

  const handleDeploy = () => {
    // Website deployed, stay on preview to show success
  };

  // Show loading state while checking onboarding status
  if (currentView === 'checking' || checkingOnboarding || checkingWebsites) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-normal mb-8" style={{ fontFamily: 'Times New Roman' }}>
              Loading Your Workspace
            </h1>
            <div className="max-w-md mx-auto">
              <div className="bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-black h-2 rounded-full w-1/2 animate-pulse"></div>
              </div>
              <p className="text-gray-600">
                Checking your account setup...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      {currentView === 'photo-selection' && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="text-center">
              <h1 className="text-4xl font-normal mb-2" style={{ fontFamily: 'Times New Roman' }}>
                Build Your Website
              </h1>
              <p className="text-xl text-gray-600">Step 1: Choose Your Photos</p>
            </div>
          </div>
          <RealImageSelection onSelectionComplete={handlePhotoSelectionComplete} />
        </div>
      )}

      {currentView === 'brand-questionnaire' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="text-center">
              <h1 className="text-4xl font-normal mb-2" style={{ fontFamily: 'Times New Roman' }}>
                Build Your Website
              </h1>
              <p className="text-xl text-gray-600">Step 2: Tell Us About You</p>
            </div>
          </div>
          <PersonalBrandQuestionnaire 
            assessment={brandAssessment}
            onChange={(updates) => setBrandAssessment(prev => ({ ...prev, ...updates }))}
          />
          <div className="max-w-4xl mx-auto px-8 py-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setCurrentView('photo-selection')}
                className="text-gray-600 hover:text-black transition-colors"
              >
                ← Back to Photo Selection
              </button>
              <button 
                onClick={handleBrandQuestionnaireComplete}
                disabled={!brandAssessment.personalStory || saveBrandAssessmentMutation.isPending}
                className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveBrandAssessmentMutation.isPending ? 'Saving...' : 'Continue to Website Creation'}
              </button>
            </div>
          </div>
        </div>
      )}

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
      
      {currentView === 'preview' && (currentWebsite || (userWebsites && userWebsites.length > 0)) && (
        <WebsitePreview
          website={currentWebsite || userWebsites?.[0]}
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