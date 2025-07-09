import React, { useState, useRef } from 'react';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { SandraImages } from '@/lib/sandra-images';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { useToast } from '@/hooks/use-toast';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface OnboardingFormData {
  // Step 1: Brand Story
  brandStory: string;
  personalMission: string;
  
  // Step 2: Business Goals
  businessGoals: string;
  targetAudience: string;
  businessType: string;
  
  // Step 3: Voice & Style
  brandVoice: string;
  stylePreferences: string;
  
  // Step 4: AI Training
  selfieUploadStatus: string;
  aiTrainingStatus: string;
  
  // Progress tracking
  currentStep: number;
  completed: boolean;
}

export default function OnboardingNew() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    brandStory: '',
    personalMission: '',
    businessGoals: '',
    targetAudience: '',
    businessType: '',
    brandVoice: '',
    stylePreferences: '',
    selfieUploadStatus: 'pending',
    aiTrainingStatus: 'not_started',
    currentStep: 1,
    completed: false
  });

  const totalSteps = 6;

  // Load existing onboarding data
  const { data: existingData } = useQuery({
    queryKey: ['/api/onboarding'],
    retry: false,
  });

  // Load existing data into form when available
  React.useEffect(() => {
    if (existingData) {
      console.log('Loading existing data:', existingData);
      
      // Pre-populate form with your saved data
      const savedFormData = {
        brandStory: existingData.brandStory || '',
        personalMission: existingData.personalMission || '',
        businessGoals: existingData.businessGoals || '',
        targetAudience: existingData.targetAudience || '',
        businessType: existingData.businessType || '',
        brandVoice: existingData.brandVoice || '',
        stylePreferences: existingData.stylePreferences || '',
        selfieUploadStatus: existingData.selfieUploadStatus || 'pending',
        aiTrainingStatus: existingData.aiTrainingStatus || 'not_started',
        currentStep: existingData.currentStep || 1,
        completed: existingData.completed || false
      };
      
      console.log('Setting form data:', savedFormData);
      setFormData(savedFormData);
      setCurrentStep(existingData.currentStep || 1);
    }
    setIsLoading(false);
  }, [existingData]);

  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: Partial<OnboardingFormData>) => {
      return apiRequest('POST', '/api/onboarding', data);
    },
    onSuccess: () => {
      console.log('Onboarding data saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save onboarding data:', error);
      toast({
        title: "Save failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Auto-save function with debouncing
  const autoSave = React.useCallback(
    debounce((data: OnboardingFormData) => {
      saveOnboardingMutation.mutate(data);
    }, 1000),
    [saveOnboardingMutation]
  );

  // Auto-save whenever form data changes
  React.useEffect(() => {
    if (!isLoading && existingData && (formData.brandStory || formData.personalMission)) { 
      console.log('Auto-saving form data:', formData);
      autoSave(formData);
    }
  }, [formData, isLoading, autoSave, existingData]);

  const startModelTrainingMutation = useMutation({
    mutationFn: async (selfieImages: string[]) => {
      return apiRequest('POST', '/api/start-model-training', { selfieImages });
    },
    onSuccess: () => {
      setFormData(prev => ({ ...prev, aiTrainingStatus: 'in_progress' }));
      toast({
        title: "AI Training Started",
        description: "Your SSELFIE AI model training has begun. This will take 24-48 hours.",
      });
    },
    onError: (error) => {
      console.error('Failed to start model training:', error);
      toast({
        title: "Training failed",
        description: "Failed to start AI training. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleNext = async () => {
    // Save current step data
    await saveOnboardingMutation.mutateAsync({
      ...formData,
      currentStep
    });

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setFormData(prev => ({ ...prev, currentStep: currentStep + 1 }));
    } else {
      // Complete onboarding
      await saveOnboardingMutation.mutateAsync({
        ...formData,
        completed: true
      });
      setLocation('/workspace');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setFormData(prev => ({ ...prev, currentStep: currentStep - 1 }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    if (files.length >= 10) {
      setFormData(prev => ({ ...prev, selfieUploadStatus: 'completed' }));
    }
  };

  const startAITraining = async () => {
    if (uploadedFiles.length >= 10) {
      // Convert files to base64 for API
      const selfieImages = await Promise.all(
        uploadedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      await startModelTrainingMutation.mutateAsync(selfieImages);
      setFormData(prev => ({ ...prev, aiTrainingStatus: 'in_progress' }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Your Brand Story
              </h2>
              <p className="text-gray-600 mb-8">
                Let's start with who you are and what drives you
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tell me your story in 2-3 sentences
                </label>
                <textarea
                  value={formData.brandStory}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandStory: e.target.value }))}
                  placeholder="What brought you here? What's your journey been like?"
                  className="w-full p-4 border border-gray-300 rounded-lg h-32 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  What's your personal mission?
                </label>
                <textarea
                  value={formData.personalMission}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalMission: e.target.value }))}
                  placeholder="What impact do you want to make? What drives you?"
                  className="w-full p-4 border border-gray-300 rounded-lg h-32 resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Business Goals
              </h2>
              <p className="text-gray-600 mb-8">
                Help Sandra AI understand your business vision
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What are your main business goals?
                </label>
                <textarea
                  value={formData.businessGoals}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessGoals: e.target.value }))}
                  placeholder="Revenue targets, client goals, impact you want to make..."
                  className="w-full p-4 border border-gray-300 rounded-lg h-32 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Who is your target audience?
                </label>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="Describe your ideal client or customer..."
                  className="w-full p-4 border border-gray-300 rounded-lg h-32 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                  className="w-full p-4 border border-gray-300 rounded-lg"
                >
                  <option value="">Select your business type</option>
                  <option value="coach">Coach/Consultant</option>
                  <option value="service-provider">Service Provider</option>
                  <option value="creative">Creative/Artist</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="influencer">Influencer/Creator</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Voice & Style
              </h2>
              <p className="text-gray-600 mb-8">
                Define your brand personality
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  How would you describe your brand voice?
                </label>
                <textarea
                  value={formData.brandVoice}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandVoice: e.target.value }))}
                  placeholder="Professional, casual, authoritative, warm, edgy..."
                  className="w-full p-4 border border-gray-300 rounded-lg h-32 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Style Preferences
                </label>
                <select
                  value={formData.stylePreferences}
                  onChange={(e) => setFormData(prev => ({ ...prev, stylePreferences: e.target.value }))}
                  className="w-full p-4 border border-gray-300 rounded-lg"
                >
                  <option value="">Select your style preference</option>
                  <option value="minimal">Minimal & Clean</option>
                  <option value="luxury">Luxury & Sophisticated</option>
                  <option value="creative">Creative & Artistic</option>
                  <option value="bold">Bold & Modern</option>
                  <option value="feminine">Feminine & Elegant</option>
                  <option value="professional">Professional & Corporate</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Train Your SSELFIE AI
              </h2>
              <p className="text-gray-600 mb-8">
                Upload 10+ selfies to create your personal AI model
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Choose Selfies ({uploadedFiles.length}/10+)
                </button>
                <p className="text-gray-500 mt-4">
                  Upload high-quality selfies with good lighting
                </p>
              </div>
              
              {uploadedFiles.length >= 10 && (
                <button
                  onClick={startAITraining}
                  disabled={startModelTrainingMutation.isPending}
                  className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {startModelTrainingMutation.isPending ? 'Starting Training...' : 'Start AI Training'}
                </button>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                AI Training in Progress
              </h2>
              <p className="text-gray-600 mb-8">
                Your personal SSELFIE AI model is being created
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
              <p className="text-lg">Training will complete in 24-48 hours</p>
              <p className="text-gray-600">
                You'll receive an email when your AI model is ready
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Welcome to SSELFIE Studio
              </h2>
              <p className="text-gray-600 mb-8">
                Your personal branding platform is ready
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <p className="text-lg">
                Sandra AI has learned about your brand and is ready to help you create amazing content
              </p>
              <button
                onClick={() => setLocation('/workspace')}
                className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg"
              >
                Enter Your Studio
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Please log in to continue</h2>
          <button
            onClick={() => setLocation('/login')}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-2xl mx-auto py-16 px-6">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
            <div className="flex items-center space-x-4">
              {saveOnboardingMutation.isPending && (
                <span className="text-sm text-gray-500 flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </span>
              )}
              <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={saveOnboardingMutation.isPending}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saveOnboardingMutation.isPending ? 'Saving...' : 
             currentStep === totalSteps ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}