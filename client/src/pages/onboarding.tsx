import React, { useState, useRef, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link, useLocation } from 'wouter';
import { SandraImages } from '@/lib/sandra-images';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  currentStep: string;
  brandVibe: string;
  targetClient: string;
  businessGoal: string;
  photoSourceType?: string;
  ownPhotosUploaded?: string[];
  brandedPhotosDetails?: string;
  completedSteps: string[];
  planType?: string;
  triggerWord?: string;
}

export default function Onboarding() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [planType, setPlanType] = useState<string>('ai-pack');
  const [data, setData] = useState<OnboardingData>({
    currentStep: 'welcome',
    brandVibe: '',
    targetClient: '',
    businessGoal: '',
    photoSourceType: '',
    ownPhotosUploaded: [],
    brandedPhotosDetails: '',
    completedSteps: [],
    triggerWord: ''
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: string}>({});

  const totalSteps = 6;

  const getPlanTitle = (plan: string) => {
    switch (plan) {
      case 'ai-pack':
        return 'SSELFIE AI';
      case 'studio-monthly':
        return 'SSELFIE Studio';
      case 'studio-annual':
        return 'SSELFIE Studio Pro';
      default:
        return 'SSELFIE AI';
    }
  };

  // For now, skip authentication-dependent queries since users come from payment flow
  // These will be implemented when full authentication system is ready
  const existingOnboarding = null;
  const subscription = null;

  useEffect(() => {
    // Get plan from URL parameters (coming from payment success)
    const urlParams = new URLSearchParams(window.location.search);
    const planFromUrl = urlParams.get('plan');
    const userPlan = planFromUrl || subscription?.plan || 'ai-pack';
    setPlanType(userPlan);

    // Show welcome message for new users
    toast({
      title: "Welcome to SSELFIE Studio!",
      description: "Let's build your personal brand together.",
    });

    // Set existing data if available
    if (existingOnboarding) {
      setData({
        ...existingOnboarding,
        completedSteps: existingOnboarding.completedSteps || []
      });
      // Set current step based on progress
      const stepMap = {
        'welcome': 1,
        'brand-questionnaire': 2,
        'photo-source-selection': 3,
        'photo-upload': 4,
        'ai-generation': 5,
        'completion': 6
      };
      setCurrentStep(stepMap[existingOnboarding.currentStep as keyof typeof stepMap] || 1);
    }
  }, [existingOnboarding, subscription, setLocation, toast]);

  const saveOnboardingMutation = useMutation({
    mutationFn: async (onboardingData: any) => {
      return apiRequest('POST', '/api/onboarding', {
        ...onboardingData,
        planType
      });
    },
    onSuccess: () => {
      toast({
        title: "Progress saved!",
        description: "Your onboarding progress has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  });

  const uploadSelfiesMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('POST', '/api/selfie-upload', formData);
    },
    onSuccess: () => {
      toast({
        title: "Selfies uploaded!",
        description: "Starting AI model training...",
      });
      // Start AI model training
      startModelTraining();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: "Failed to upload selfies. Please try again.",
        variant: "destructive",
      });
    }
  });

  const startModelTrainingMutation = useMutation({
    mutationFn: async (selfieImages: string[]) => {
      return apiRequest('POST', '/api/start-model-training', {
        selfieImages
      });
    },
    onSuccess: () => {
      toast({
        title: "AI training started!",
        description: "Your personal AI model is being created.",
      });
      nextStep(); // Go to AI generation step
    },
    onError: (error) => {
      toast({
        title: "Training failed",
        description: "Failed to start AI training. Please try again.",
        variant: "destructive",
      });
    }
  });

  const startModelTraining = () => {
    if (data.photoSourceType === 'ai-model' && uploadedFiles.length >= 10) {
      // Convert uploaded files to base64 strings for training
      const promises = uploadedFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(promises).then(base64Images => {
        startModelTrainingMutation.mutate(base64Images);
      });
    } else {
      // For other photo types, skip training and go to next step
      nextStep();
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Update current step in data
      const stepNames = ['welcome', 'brand-questionnaire', 'selfie-upload', 'ai-generation', 'completion'];
      const nextStepName = stepNames[currentStep];
      
      // Save progress
      const updatedData = {
        ...data,
        currentStep: nextStepName,
        completedSteps: [...(data.completedSteps || []), stepNames[currentStep - 1]]
      };
      
      setData(updatedData);
      saveOnboardingMutation.mutate(updatedData);
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect
      const completedData = {
        ...data,
        currentStep: 'completed',
        completedSteps: [...(data.completedSteps || []), 'completion']
      };
      
      saveOnboardingMutation.mutate(completedData);
      
      // Redirect based on plan type
      if (planType === 'ai-pack') {
        setLocation('/ai-images');
      } else {
        setLocation('/workspace');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const selectOption = (category: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [category]: value }));
    updateData(category as keyof OnboardingData, value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Please upload only image files under 10MB.",
        variant: "destructive",
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelfieUpload = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one selfie to continue.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    uploadedFiles.forEach(file => {
      formData.append('selfies', file);
    });
    
    uploadSelfiesMutation.mutate(formData);
  };

  const progress = (currentStep / totalSteps) * 100;



  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be signed in to access your onboarding.
          </p>
          <a
            href="/api/login"
            className="text-xs uppercase tracking-wider text-black hover:underline"
          >
            SIGN IN
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <HeroFullBleed
        backgroundImage={SandraImages.journey.onboarding}
        title="ONBOARDING"
        tagline={`Welcome to ${getPlanTitle(planType)}`}
        alignment="center"
      />

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Progress Bar */}
        <div className="w-full h-0.5 bg-[#f5f5f5] mb-16">
          <div 
            className="h-full bg-[#0a0a0a] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="text-center">
            <h1 className="text-4xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Hey beautiful! You're in {getPlanTitle(planType)}
            </h1>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              {planType === 'ai-pack' 
                ? "Let's get your AI selfies set up in 5 quick steps. This'll take about 3 minutes and we're gonna create the most gorgeous AI images of you."
                : "Let's get your entire business set up in 5 quick steps. We're gonna create stunning AI images AND build your business platform."
              }
            </p>
            
            <div className="bg-gray-50 p-8 max-w-2xl mx-auto mb-12">
              <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                What you'll get:
              </h3>
              <div className="space-y-3 text-left">
                {planType === 'ai-pack' ? (
                  <>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                      <span>50 professional AI images that look like you</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                      <span>Editorial-quality photos ready for social media</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                      <span>Everything in AI Pack plus business builder</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                      <span>Professional landing page templates</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                      <span>Booking system and payment integration</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 mb-8">
              Ready to turn your selfies into money? Let's do this thing.
            </p>
          </div>
        )}

        {/* Step 2: Brand Questionnaire */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Let's talk about your vibe
              </h2>
              <p className="text-gray-600">
                I need to know your style so we can create AI images that actually look like YOU, not some random model
              </p>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  What's your vibe? (Be honest)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Luxury & Elegant', 'Warm & Approachable', 'Bold & Creative', 'Professional & Polished', 'Fun & Playful', 'Minimalist & Clean'].map((option) => (
                    <button
                      key={option}
                      onClick={() => selectOption('brandVibe', option)}
                      className={`p-4 text-sm border transition-colors ${
                        selectedOptions.brandVibe === option 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-black border-gray-200 hover:border-black'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Who do you want to work with?
                </label>
                <textarea
                  className="w-full p-4 border border-gray-200 bg-white min-h-[100px] resize-none focus:outline-none focus:border-black transition-colors"
                  placeholder="Tell me about your dream client. Are they busy moms? Ambitious entrepreneurs? Creative souls? What keeps them up at night?"
                  value={data.targetClient}
                  onChange={(e) => updateData('targetClient', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  What's your main business goal?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Book more clients', 'Build my following', 'Launch a product', 'Grow my business', 'Start freelancing', 'Create content'].map((option) => (
                    <button
                      key={option}
                      onClick={() => selectOption('businessGoal', option)}
                      className={`p-4 text-sm border transition-colors text-left ${
                        selectedOptions.businessGoal === option 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-black border-gray-200 hover:border-black'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Choose your AI trigger word
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  This special word will generate images of you in your AI photoshoots. Choose something memorable and unique to you.
                </p>
                <input
                  type="text"
                  className="w-full p-4 border border-gray-200 bg-white focus:outline-none focus:border-black transition-colors"
                  placeholder="e.g., your name, nickname, or 'subject'"
                  value={data.triggerWord || ''}
                  onChange={(e) => updateData('triggerWord', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photo Source Selection */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                How do you want to create your brand photos?
              </h2>
              <p className="text-gray-600">
                Choose the approach that works best for your brand vision
              </p>
            </div>
            
            <div className="space-y-4">
              {/* AI Model Option */}
              <button
                onClick={() => updateData('photoSourceType', 'ai-model')}
                className={`w-full p-6 border-2 text-left transition-all ${
                  data.photoSourceType === 'ai-model' 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Create with SSELFIE AI Model
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Upload 10-15 selfies and I'll train a custom AI model that creates unlimited professional photos of you in any style or setting.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• Unlimited AI photos</div>
                      <div>• Any style or location</div>
                      <div>• Perfect for content creation</div>
                    </div>
                  </div>
                  <div className={`ml-4 w-4 h-4 rounded-full border-2 ${
                    data.photoSourceType === 'ai-model' ? 'bg-black border-black' : 'border-gray-300'
                  }`} />
                </div>
              </button>

              {/* Own Photos Option */}
              <button
                onClick={() => updateData('photoSourceType', 'own-photos')}
                className={`w-full p-6 border-2 text-left transition-all ${
                  data.photoSourceType === 'own-photos' 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Upload My Own Photos
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Use photos you already have - selfies, professional shots, or any images you want to include in your brand.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• Use existing photos</div>
                      <div>• Complete control</div>
                      <div>• Quick setup</div>
                    </div>
                  </div>
                  <div className={`ml-4 w-4 h-4 rounded-full border-2 ${
                    data.photoSourceType === 'own-photos' ? 'bg-black border-black' : 'border-gray-300'
                  }`} />
                </div>
              </button>

              {/* Branded Photos Option */}
              <button
                onClick={() => updateData('photoSourceType', 'branded-photos')}
                className={`w-full p-6 border-2 text-left transition-all ${
                  data.photoSourceType === 'branded-photos' 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                      I Have Professional Branded Photos
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Already have professional photos from a brand photoshoot? Perfect! Tell me about them and we'll integrate them into your platform.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• Professional quality</div>
                      <div>• Brand consistency</div>
                      <div>• Ready to use</div>
                    </div>
                  </div>
                  <div className={`ml-4 w-4 h-4 rounded-full border-2 ${
                    data.photoSourceType === 'branded-photos' ? 'bg-black border-black' : 'border-gray-300'
                  }`} />
                </div>
              </button>
            </div>

            {/* Additional input for branded photos */}
            {data.photoSourceType === 'branded-photos' && (
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  Tell me about your existing branded photos
                </label>
                <textarea
                  className="w-full p-4 border border-gray-200 bg-white min-h-[100px] resize-none focus:outline-none focus:border-black transition-colors"
                  placeholder="Describe your existing photos - what style, how many, where they're stored, what you love about them..."
                  value={data.brandedPhotosDetails || ''}
                  onChange={(e) => updateData('brandedPhotosDetails', e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Photo Upload (formerly Step 3) */}
        {currentStep === 4 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                {data.photoSourceType === 'ai-model' && 'Time for your selfies'}
                {data.photoSourceType === 'own-photos' && 'Upload your photos'}
                {data.photoSourceType === 'branded-photos' && 'Upload your branded photos'}
              </h2>
              <p className="text-gray-600 mb-6">
                {data.photoSourceType === 'ai-model' && 'Upload 10-15 selfies where you look like yourself on a good day. Check out my '}
                {data.photoSourceType === 'own-photos' && 'Upload any photos you want to use for your brand - selfies, professional shots, or anything that represents you.'}
                {data.photoSourceType === 'branded-photos' && 'Upload your existing professional branded photos so we can integrate them into your platform.'}
                {data.photoSourceType === 'ai-model' && <Link href="/selfie-guide" className="underline">selfie guide</Link>}
                {data.photoSourceType === 'ai-model' && ' if you need help.'}
              </p>
              <p className="text-sm text-gray-500">
                {data.photoSourceType === 'ai-model' && 'Good lighting, clear face, different angles. If you can text, you can do this.'}
                {data.photoSourceType === 'own-photos' && 'Any image format, up to 10MB each. Choose photos that represent your brand.'}
                {data.photoSourceType === 'branded-photos' && 'Professional quality photos that match your brand aesthetic.'}
              </p>
            </div>

            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-black transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-4">
                <div className="text-4xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>+</div>
                <div>
                  <p className="text-lg font-medium mb-2">
                    Click to upload selfies
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG files up to 10MB each
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-3 mb-8">
                <h3 className="font-medium">Uploaded files ({uploadedFiles.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-gray-100 rounded border flex items-center justify-center text-sm p-2">
                        <span className="text-center break-all">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full text-xs hover:bg-gray-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleSelfieUpload}
                  disabled={uploadSelfiesMutation.isPending || startModelTrainingMutation.isPending}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 text-xs uppercase tracking-wider"
                >
                  {uploadSelfiesMutation.isPending 
                    ? 'UPLOADING...' 
                    : startModelTrainingMutation.isPending 
                    ? 'STARTING AI TRAINING...'
                    : data.photoSourceType === 'ai-model' 
                    ? 'START AI TRAINING' 
                    : 'UPLOAD PHOTOS'
                  }
                </button>
                {data.photoSourceType === 'ai-model' && uploadedFiles.length < 10 && (
                  <p className="text-sm text-gray-500 mt-3">
                    Upload at least 10 selfies for AI training ({uploadedFiles.length}/10)
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 5: AI Generation */}
        {currentStep === 5 && (
          <div className="text-center">
            <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              {data.photoSourceType === 'ai-model' 
                ? 'Working my magic on your selfies'
                : 'Processing your photos'
              }
            </h2>
            <p className="text-gray-600 mb-12">
              {data.photoSourceType === 'ai-model' 
                ? "I'm analyzing your gorgeous face and training your personal AI model. This usually takes 24-48 hours, but the results will be stunning."
                : "I'm processing and organizing your photos for your brand workspace."
              }
            </p>
            
            <div className="space-y-8">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
              
              <div className="bg-gray-50 p-6 max-w-lg mx-auto">
                <h3 className="font-medium mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                  What I'm doing right now:
                </h3>
                <div className="space-y-2 text-sm text-left">
                  {data.photoSourceType === 'ai-model' ? (
                    <>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span>Studying your gorgeous face</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span>Training your personal AI model</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                        <span>Learning your unique features</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                        <span>Creating sample images</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span>Processing your photos</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span>Organizing for your workspace</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                        <span>Setting up your brand library</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                        <span>Preparing templates</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-8">
              {data.photoSourceType === 'ai-model' 
                ? "I'll email you when your AI model is ready. Feel free to close this page."
                : "This will just take a moment..."
              }
            </p>
          </div>
        )}

        {/* Step 6: Completion */}
        {currentStep === 6 && (
          <div className="text-center">
            <h1 className="text-4xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              You're officially in, gorgeous!
            </h1>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              {planType === 'ai-pack' 
                ? "Your AI images are being created right now and they're going to be stunning. I'll email you when they're ready."
                : "Your AI images are being created and your business workspace is ready to customize. Time to build your empire."
              }
            </p>
            
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-6 max-w-lg mx-auto">
                <h3 className="font-medium text-green-800 mb-2">
                  What happens next:
                </h3>
                <div className="space-y-1 text-sm text-green-700 text-left">
                  <p>• Your gorgeous AI images are being created right now</p>
                  <p>• I'll email you when they're ready (usually 2-3 minutes)</p>
                  {planType !== 'ai-pack' && (
                    <p>• You can start building your business page immediately</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={nextStep}
                className="px-8 py-4 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                {planType === 'ai-pack' ? 'Go to AI Images' : 'Go to Workspace'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-16 gap-5">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-8 py-4 border border-gray-200 bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed hover:border-black transition-colors text-sm font-medium tracking-wide uppercase"
          >
            Previous
          </button>
          
          <div className="flex-1 text-center">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          <button 
            onClick={nextStep}
            disabled={saveOnboardingMutation.isPending || 
              (currentStep === 3 && !data.photoSourceType) || 
              (currentStep === 4 && data.photoSourceType === 'ai-model' && uploadedFiles.length < 10) ||
              (currentStep === 4 && data.photoSourceType !== 'ai-model' && uploadedFiles.length === 0)}
            className="px-8 py-4 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium tracking-wide uppercase disabled:opacity-50"
          >
            {currentStep === totalSteps ? 'COMPLETE SETUP' : 'NEXT'}
          </button>
        </div>
      </div>
    </div>
  );
}