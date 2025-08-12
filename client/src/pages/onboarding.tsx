import { ChangeEvent, useState, useEffect } from 'react';
import { MemberNavigation } from '../components/member-navigation';
import { useAuth } from '../hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useLocation } from 'wouter';
import { SandraImages } from '../lib/sandra-images';
import { HeroFullBleed } from '../components/HeroFullBleed';
import { useToast } from '../hooks/use-toast';

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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Luxury Editorial Image Selection
  const ImageSelector = () => (
    <div className="mb-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="editorial-headline mb-2">Select Your Images</h2>
          <p className="editorial-subheadline">Choose the visuals that tell your story</p>
        </div>
        <button 
          onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
          className="eyebrow-text hover:text-[var(--soft-gray)] transition-colors"
        >
          {previewMode === 'desktop' ? 'View Mobile' : 'View Desktop'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SandraImages.map((image, index) => (
          <div 
            key={index}
            className="aspect-[3/4] relative group cursor-pointer"
            onClick={() => {
              if (selectedImages.includes(image)) {
                setSelectedImages(prev => prev.filter(img => img !== image));
              } else {
                setSelectedImages(prev => [...prev, image]);
              }
            }}
          >
            <img 
              src={image} 
              alt={`Editorial image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-[var(--luxury-black)] transition-opacity duration-200 ${
              selectedImages.includes(image) ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'
            }`} />
            {selectedImages.includes(image) && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 border-2 border-[var(--pure-white)] bg-[var(--luxury-black)] flex items-center justify-center">
                  <span className="text-[var(--pure-white)] text-xs">✓</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Luxury Editorial Progress Indicator
  const ProgressBar = () => (
    <div className="w-full mb-12">
      <div className="flex justify-between mb-2">
        <span className="eyebrow-text">Your Progress</span>
        <span className="eyebrow-text">{Math.round((currentStep/totalSteps) * 100)}%</span>
      </div>
      <div className="w-full h-[1px] bg-[var(--accent-line)]">
        <div 
          className="h-full bg-[var(--luxury-black)] transition-all duration-500 ease-out"
          style={{ width: `${(currentStep/totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
  
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

  // Luxury Editorial Brand Customizer
  const BrandCustomizer = () => {
    const [brandStyle, setBrandStyle] = useState({
      palette: 'editorial',
      font: 'Times New Roman',
      vibe: 'editorial'
    });

    return (
      <div className="mb-16">
        <h2 className="editorial-headline mb-2">Brand Style</h2>
        <p className="editorial-subheadline mb-12">Define your visual identity</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <label className="eyebrow-text block mb-4">Color Palette</label>
            <div className="grid grid-cols-2 gap-4">
              {['editorial', 'luxury', 'minimalist', 'bold'].map(palette => (
                <button
                  key={palette}
                  onClick={() => setBrandStyle(prev => ({ ...prev, palette }))}
                  className={`p-6 border ${
                    brandStyle.palette === palette 
                      ? 'border-[var(--luxury-black)]' 
                      : 'border-[var(--accent-line)]'
                  } hover:border-[var(--luxury-black)] transition-colors`}
                >
                  <span className="editorial-subheadline capitalize">{palette}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="eyebrow-text block mb-4">Typography</label>
            <div className="space-y-4">
              {['Times New Roman', 'Georgia', 'Playfair'].map(font => (
                <button
                  key={font}
                  onClick={() => setBrandStyle(prev => ({ ...prev, font }))}
                  className={`w-full p-6 border ${
                    brandStyle.font === font 
                      ? 'border-[var(--luxury-black)]' 
                      : 'border-[var(--accent-line)]'
                  } hover:border-[var(--luxury-black)] transition-colors text-left`}
                >
                  <span style={{ fontFamily: font }} className="text-xl">
                    {font}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <label className="eyebrow-text block mb-4">Brand Vibe</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['editorial', 'luxury', 'minimalist', 'modern', 'bold'].map(vibe => (
              <button
                key={vibe}
                onClick={() => setBrandStyle(prev => ({ ...prev, vibe }))}
                className={`p-6 border ${
                  brandStyle.vibe === vibe 
                    ? 'border-[var(--luxury-black)]' 
                    : 'border-[var(--accent-line)]'
                } hover:border-[var(--luxury-black)] transition-colors`}
              >
                <span className="editorial-subheadline capitalize">{vibe}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Luxury Editorial Step Title Component
  const StepTitle = ({ title, description }: { title: string, description: string }) => (
    <div className="mb-12">
      <h1 className="editorial-headline mb-4">{title}</h1>
      <p className="editorial-subheadline">{description}</p>
    </div>
  );

  // Luxury Editorial Input Field
  const EditorialInput = ({ 
    label, 
    value, 
    onChange, 
    multiline = false 
  }: { 
    label: string, 
    value: string, 
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    multiline?: boolean 
  }) => (
    <div className="mb-8">
      <label className="eyebrow-text block mb-2">{label}</label>
      {multiline ? (
        <textarea 
          value={value}
          onChange={onChange}
          className="w-full bg-[var(--pure-white)] border border-[var(--accent-line)] p-4 min-h-[120px]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          className="w-full bg-[var(--pure-white)] border border-[var(--accent-line)] p-4"
        />
      )}
    </div>
  );

  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: Partial<OnboardingFormData>) => {
      return apiRequest('POST', '/api/onboarding', data);
    },
    onSuccess: (response) => {
      console.log('Onboarding data saved successfully:', response);
    },
    onError: (error) => {
      console.error('Failed to save onboarding data:', error);
      // Remove toast notification to prevent user confusion during testing
      // toast({
      //   title: "Save failed",
      //   description: "Failed to save your progress. Please try again.",
      //   
      // });
    }
  });

  const startModelTrainingMutation = useMutation({
    mutationFn: async (selfieImages: string[]) => {
      return apiRequest('POST', '/api/start-model-training', { selfieImages });
    },
    onSuccess: (response) => {
      if (response.success) {
        setFormData(prev => ({ ...prev, aiTrainingStatus: 'in_progress' }));
        toast({
          title: "Training Started!",
          description: "Your bulletproof AI model training has begun.",
        });
        nextStep();
      } else {
        // Handle validation errors
        toast({
          title: "Training Validation Failed",
          description: `Please fix these issues: ${response.errors?.join(', ')}`,
          
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Training failed",
        description: "Training system error. Please restart upload process.",
        
      });
    }
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);
      setFormData(prev => ({ ...prev, currentStep: nextStepNum }));
      
      // Save progress
      saveOnboardingMutation.mutate({
        ...formData,
        currentStep: nextStepNum
      });
    } else {
      // Complete onboarding
      const completedData = {
        ...formData,
        completed: true,
        currentStep: totalSteps
      };
      
      saveOnboardingMutation.mutate(completedData);
      setLocation('/workspace');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const prevStepNum = currentStep - 1;
      setCurrentStep(prevStepNum);
      setFormData(prev => ({ ...prev, currentStep: prevStepNum }));
    }
  };

  const updateFormData = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // 🛡️ BULLETPROOF VALIDATION: Strict requirements
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      const isMinSize = file.size >= 10240; // At least 10KB for quality
      return isValidType && isValidSize && isMinSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Please upload only high-quality image files (10KB-10MB).",
        
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAITraining = () => {
    if (uploadedFiles.length < 10) {
      toast({
        title: "Not enough photos",
        description: "Please upload at least 10 selfies for AI training.",
        
      });
      return;
    }

    // Convert files to base64
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
  };

  const progress = (currentStep / totalSteps) * 100;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be signed in to complete onboarding.
          </p>
          <a href="/login" className="text-xs uppercase tracking-wider text-black hover:underline">
            SIGN IN
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--mid-gray)]">
      <MemberNavigation />
      
      <HeroFullBleed
        backgroundImage={SandraImages.building}
        title="WELCOME TO SSELFIE STUDIO"
        tagline="Let's build your personal brand"
        alignment="center"
      />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <ProgressBar />
        {/* Progress Bar */}
        <div className="w-full h-0.5 bg-gray-200 mb-16">
          <div 
            className="h-full bg-black transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step 1: Welcome & Brand Story */}
        {currentStep === 1 && (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Hey beautiful! Let's start with your story.
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              Your personal brand starts with your unique story. Tell me about yourself and what drives you.
            </p>
            
            <div className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Brand Story
                </label>
                <textarea
                  value={formData.brandStory}
                  onChange={(e) => updateFormData('brandStory', e.target.value)}
                  placeholder="Tell me about your journey. What led you here? What's your story?"
                  className="w-full h-32 p-3 border border-gray-300 rounded-none resize-none focus:outline-none focus:border-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Personal Mission
                </label>
                <textarea
                  value={formData.personalMission}
                  onChange={(e) => updateFormData('personalMission', e.target.value)}
                  placeholder="What's your mission? What do you want to be known for?"
                  className="w-full h-24 p-3 border border-gray-300 rounded-none resize-none focus:outline-none focus:border-black"
                />
              </div>
            </div>
            
            <div className="mt-12">
              <button
                onClick={nextStep}
                disabled={!formData.brandStory || !formData.personalMission}
                className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Business Goals */}
        {currentStep === 2 && (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              What are your business goals?
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              Understanding your goals helps Sandra AI create the perfect brand strategy for you.
            </p>
            
            <div className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Goals
                </label>
                <textarea
                  value={formData.businessGoals}
                  onChange={(e) => updateFormData('businessGoals', e.target.value)}
                  placeholder="What do you want to achieve? Launch a business? Grow your following? Something else?"
                  className="w-full h-32 p-3 border border-gray-300 rounded-none resize-none focus:outline-none focus:border-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) => updateFormData('targetAudience', e.target.value)}
                  placeholder="Who do you want to reach? Describe your ideal client or audience."
                  className="w-full h-24 p-3 border border-gray-300 rounded-none resize-none focus:outline-none focus:border-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => updateFormData('businessType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-black"
                >
                  <option value="">Select business type</option>
                  <option value="coach">Coach/Consultant</option>
                  <option value="service-provider">Service Provider</option>
                  <option value="creator">Content Creator</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mt-12 flex justify-between">
              <button
                onClick={prevStep}
                className="border border-gray-300 text-gray-700 px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                BACK
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.businessGoals || !formData.targetAudience || !formData.businessType}
                className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Voice & Style */}
        {currentStep === 3 && (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Your voice and style
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              This helps Sandra AI understand how to communicate like you and create content that feels authentic.
            </p>
            
            <div className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Voice
                </label>
                <textarea
                  value={formData.brandVoice}
                  onChange={(e) => updateFormData('brandVoice', e.target.value)}
                  placeholder="How do you speak? Are you casual or formal? Funny or serious? Describe your communication style."
                  className="w-full h-32 p-3 border border-gray-300 rounded-none resize-none focus:outline-none focus:border-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style Preferences
                </label>
                <select
                  value={formData.stylePreferences}
                  onChange={(e) => updateFormData('stylePreferences', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-black"
                >
                  <option value="">Select style preference</option>
                  <option value="luxury-minimal">Luxury Minimal</option>
                  <option value="editorial-magazine">Editorial Magazine</option>
                  <option value="business-professional">Business Professional</option>
                  <option value="creative-artistic">Creative Artistic</option>
                  <option value="feminine-soft">Feminine Soft</option>
                  <option value="bold-confident">Bold Confident</option>
                </select>
              </div>
            </div>
            
            <div className="mt-12 flex justify-between">
              <button
                onClick={prevStep}
                className="border border-gray-300 text-gray-700 px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                BACK
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.brandVoice || !formData.stylePreferences}
                className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}

        {/* Step 4: AI Training */}
        {currentStep === 4 && (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Train your AI
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              Upload 10-15 selfies to train your personal AI model. This creates images that actually look like you.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 p-12 mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 text-gray-700 px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors"
              >
                Upload Selfies
              </button>
              <p className="text-sm text-gray-500 mt-4">
                {uploadedFiles.length} photos uploaded (minimum 10 required)
              </p>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-12 flex justify-between">
              <button
                onClick={prevStep}
                className="border border-gray-300 text-gray-700 px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                BACK
              </button>
              <button
                onClick={handleAITraining}
                disabled={uploadedFiles.length < 10 || startModelTrainingMutation.isPending}
                className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {startModelTrainingMutation.isPending ? 'STARTING TRAINING...' : 'START AI TRAINING'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: AI Training in Progress */}
        {currentStep === 5 && (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Your AI is training
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              This takes 24-48 hours. You'll get an email when it's ready. Let's set up the rest of your STUDIO.
            </p>
            
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <p className="text-sm text-gray-500">Processing your photos...</p>
            </div>
            
            <div className="mt-12">
              <button
                onClick={nextStep}
                className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                CONTINUE TO STUDIO
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Complete */}
        {currentStep === 6 && (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              Welcome to your STUDIO!
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              Everything is set up. You now have access to your AI photoshoot, gallery, and Sandra AI to help you build your brand.
            </p>
            
            <div className="bg-gray-50 p-8 mb-8">
              <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                What's next:
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                  <span>Generate 100 AI photos monthly</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                  <span>Save your favorites to your gallery</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                  <span>Chat with Sandra AI to build your landing page</span>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <button
                onClick={() => setLocation('/workspace')}
                className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                ENTER YOUR STUDIO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}