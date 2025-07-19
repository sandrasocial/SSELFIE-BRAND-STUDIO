import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { BuildOnboarding } from '@/components/build/BuildOnboarding';
import { BrandStyleOnboarding } from '@/components/build/BrandStyleOnboarding';
import { VictoriaWebsiteChat } from '@/components/build/VictoriaWebsiteChat';
import { Link } from 'wouter';

export default function Build() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentStage, setCurrentStage] = useState<'onboarding' | 'style' | 'chat' | 'editor'>('onboarding');
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [websiteData, setWebsiteData] = useState<any>(null);

  // Check if user has existing BUILD onboarding
  const { data: existingOnboarding } = useQuery({
    queryKey: ['/api/build/onboarding', user?.id],
    enabled: !!user?.id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading BUILD...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Please sign in to access BUILD</h1>
          <Link href="/api/login">
            <button className="bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Determine current stage based on existing data
  React.useEffect(() => {
    console.log('🔍 existingOnboarding:', existingOnboarding);
    if (existingOnboarding?.onboarding?.isCompleted) {
      console.log('✅ Setting onboarding data:', existingOnboarding.onboarding);
      setOnboardingData(existingOnboarding.onboarding);
      
      // Check if style preferences are saved - if not, go to style stage
      const hasStyleData = existingOnboarding.onboarding.colorPreferences && 
        Object.keys(existingOnboarding.onboarding.colorPreferences).length > 0;
      
      if (hasStyleData) {
        console.log('✅ Style data found, moving to chat');
        setCurrentStage('chat');
      } else {
        console.log('🎨 No style data, moving to style selection');
        setCurrentStage('style');
      }
    }
  }, [existingOnboarding]);

  const handleOnboardingComplete = (data: any) => {
    console.log('🔍 Onboarding complete, moving to style stage:', data);
    setOnboardingData(data);
    setCurrentStage('style');
  };

  const handleStyleComplete = (styleData: any) => {
    console.log('🔍 Style complete, moving to chat stage:', styleData);
    setOnboardingData({
      ...onboardingData,
      ...styleData
    });
    setCurrentStage('chat');
  };

  const handleWebsiteGenerated = (data: any) => {
    setWebsiteData(data);
    setCurrentStage('editor');
  };

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header - Show different content based on stage */}
        {currentStage === 'onboarding' && (
          <div className="text-center mb-16">
            <h1 className="text-4xl font-serif font-normal mb-6">
              Build Your Website
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create your complete business website with Victoria as your design consultant. 
              Transform your personal brand into a professional web presence.
            </p>
          </div>
        )}

        {currentStage === 'chat' && (
          <div className="text-center mb-12">
            <h1 className="text-3xl font-serif font-normal mb-4">
              Website Builder
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
              Victoria is ready to help you create your perfect website based on your story and goals.
            </p>
          </div>
        )}

        {currentStage === 'editor' && (
          <div className="text-center mb-12">
            <h1 className="text-3xl font-serif font-normal mb-4">
              Website Editor
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
              Customize your website and get ready to publish it live.
            </p>
          </div>
        )}

        {/* Stage-based Content */}
        {currentStage === 'onboarding' && (
          <BuildOnboarding 
            userId={user.id}
            onComplete={handleOnboardingComplete}
          />
        )}

        {currentStage === 'style' && (
          <BrandStyleOnboarding 
            onComplete={handleStyleComplete}
          />
        )}

        {currentStage === 'chat' && onboardingData && (
          <VictoriaWebsiteChat
            onboardingData={onboardingData}
            onWebsiteGenerated={handleWebsiteGenerated}
          />
        )}

        {currentStage === 'editor' && websiteData && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-serif font-normal mb-4">
              Website Editor Coming Soon
            </h2>
            <p className="text-gray-600 mb-8">
              Your website has been generated! The visual editor is being developed.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentStage('chat')}
                className="bg-gray-100 text-black px-6 py-3 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Victoria
              </button>
              <Link href="/workspace">
                <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                  Return to Workspace
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Navigation breadcrumbs */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span className={currentStage === 'onboarding' ? 'text-black font-medium' : ''}>
              Tell Your Story
            </span>
            <span>→</span>
            <span className={currentStage === 'style' ? 'text-black font-medium' : ''}>
              Choose Your Style
            </span>
            <span>→</span>
            <span className={currentStage === 'chat' ? 'text-black font-medium' : ''}>
              Design with Victoria
            </span>
            <span>→</span>
            <span className={currentStage === 'editor' ? 'text-black font-medium' : ''}>
              Customize & Publish
            </span>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
}