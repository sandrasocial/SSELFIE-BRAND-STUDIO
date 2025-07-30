import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface OnboardingData {
  // Personal & Business Info
  businessName: string;
  tagline: string;
  personalStory: string;
  whyStarted: string;
  
  // Target Market
  targetClient: string;
  problemYouSolve: string;
  uniqueApproach: string;
  
  // Services & Offers
  primaryOffer: string;
  primaryOfferPrice: string;
  secondaryOffer: string;
  secondaryOfferPrice: string;
  freeResource: string;
  
  // Brand & Style
  brandPersonality: string;
  brandValues: string;
  preferredImageStyle: string;
  websiteGoals: string;
  
  // Contact & Social
  instagramHandle: string;
  websiteUrl: string;
  email: string;
  location: string;
}

interface VictoriaOnboardingQuestionnaireProps {
  onComplete: (data: OnboardingData) => void;
  selectedImages: string[];
}

export function VictoriaOnboardingQuestionnaire({ onComplete, selectedImages }: VictoriaOnboardingQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    businessName: '',
    tagline: '',
    personalStory: '',
    whyStarted: '',
    targetClient: '',
    problemYouSolve: '',
    uniqueApproach: '',
    primaryOffer: '',
    primaryOfferPrice: '',
    secondaryOffer: '',
    secondaryOfferPrice: '',
    freeResource: '',
    brandPersonality: '',
    brandValues: '',
    preferredImageStyle: '',
    websiteGoals: '',
    instagramHandle: '',
    websiteUrl: '',
    email: '',
    location: ''
  });

  // Load existing brand onboarding data if available
  const { data: existingData, isLoading } = useQuery({
    queryKey: ['/api/brand-onboarding'],
    retry: false,
  });

  useEffect(() => {
    if (existingData && !isLoading) {
      setFormData(prev => ({
        ...prev,
        ...existingData
      }));
    }
  }, [existingData, isLoading]);

  const questions = [
    {
      title: "Let's Start With Your Brand Foundation",
      fields: [
        { key: 'businessName', label: 'What is your business name?', type: 'text', placeholder: 'Sandra Social Co.' },
        { key: 'tagline', label: 'What\'s your brand tagline or mission?', type: 'text', placeholder: 'Transforming women into confident leaders' },
        { key: 'location', label: 'Where are you based?', type: 'text', placeholder: 'Reykjavik, Iceland' }
      ]
    },
    {
      title: "Tell Me Your Story",
      fields: [
        { key: 'personalStory', label: 'What\'s your personal story?', type: 'textarea', placeholder: 'Share your journey, struggles, and transformation...' },
        { key: 'whyStarted', label: 'Why did you start this business?', type: 'textarea', placeholder: 'What drove you to begin this journey?' }
      ]
    },
    {
      title: "Who Do You Serve?",
      fields: [
        { key: 'targetClient', label: 'Who is your ideal client?', type: 'textarea', placeholder: 'Describe your perfect client in detail...' },
        { key: 'problemYouSolve', label: 'What problem do you solve for them?', type: 'textarea', placeholder: 'What challenge do they face that you help with?' },
        { key: 'uniqueApproach', label: 'What makes your approach unique?', type: 'textarea', placeholder: 'How are you different from others in your space?' }
      ]
    },
    {
      title: "Your Offers & Services",
      fields: [
        { key: 'primaryOffer', label: 'What\'s your main service/offer?', type: 'text', placeholder: 'SSELFIE AI Training' },
        { key: 'primaryOfferPrice', label: 'Price for your main offer?', type: 'text', placeholder: '€67/month' },
        { key: 'secondaryOffer', label: 'Any secondary offer?', type: 'text', placeholder: 'Personal Brand Consultation' },
        { key: 'secondaryOfferPrice', label: 'Price for secondary offer?', type: 'text', placeholder: '€297' },
        { key: 'freeResource', label: 'What free resource do you offer?', type: 'text', placeholder: 'Brand Strategy Guide' }
      ]
    },
    {
      title: "Brand Personality & Style",
      fields: [
        { key: 'brandPersonality', label: 'How would you describe your brand personality?', type: 'select', options: ['sophisticated', 'warm & approachable', 'bold & confident', 'minimal & elegant', 'creative & artistic'] },
        { key: 'brandValues', label: 'What are your core brand values?', type: 'textarea', placeholder: 'authenticity, empowerment, transformation...' },
        { key: 'preferredImageStyle', label: 'What image style appeals to you most?', type: 'select', options: ['editorial & moody', 'bright & minimal', 'luxury & sophisticated', 'natural & authentic', 'bold & dramatic'] },
        { key: 'websiteGoals', label: 'What do you want your website to achieve?', type: 'textarea', placeholder: 'Generate leads, showcase expertise, build trust...' }
      ]
    },
    {
      title: "Connect & Contact",
      fields: [
        { key: 'email', label: 'Your email address', type: 'email', placeholder: 'hello@yourname.com' },
        { key: 'instagramHandle', label: 'Instagram handle', type: 'text', placeholder: '@yourname' },
        { key: 'websiteUrl', label: 'Current website (if any)', type: 'text', placeholder: 'www.yourname.com' }
      ]
    }
  ];

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data
      await apiRequest('/api/brand-onboarding', 'POST', formData);
      onComplete(formData);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-normal" style={{ fontFamily: 'Times New Roman' }}>
              Victoria Onboarding
            </h1>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {questions.length}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-8">
          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
                Your Selected Images ({selectedImages.length})
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {selectedImages.slice(0, 8).map((image, idx) => (
                  <div key={idx} className="aspect-square">
                    <img 
                      src={image} 
                      alt={`Selected ${idx + 1}`}
                      className="w-full h-full object-cover border border-gray-200"
                    />
                  </div>
                ))}
                {selectedImages.length > 8 && (
                  <div className="aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">+{selectedImages.length - 8}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question */}
          <div className="mb-12">
            <h2 className="text-4xl font-normal mb-8" style={{ fontFamily: 'Times New Roman' }}>
              {currentQuestion.title}
            </h2>
            
            <div className="space-y-8">
              {currentQuestion.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-lg font-normal mb-3" style={{ fontFamily: 'Times New Roman' }}>
                    {field.label}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key as keyof OnboardingData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full p-4 border border-gray-300 focus:border-black focus:outline-none resize-none"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key as keyof OnboardingData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full p-4 border border-gray-300 focus:border-black focus:outline-none"
                    >
                      <option value="">Select an option...</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key as keyof OnboardingData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-4 border border-gray-300 focus:border-black focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="px-8 py-3"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              className="bg-black text-white hover:bg-gray-800 px-8 py-3"
            >
              {currentStep === questions.length - 1 ? 'Complete & Continue to Victoria' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}