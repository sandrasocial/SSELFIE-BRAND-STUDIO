import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

interface BrandOnboardingData {
  // Personal Brand Story
  businessName: string;
  tagline: string;
  personalStory: string;
  whyStarted: string;
  
  // Target Client & Positioning
  targetClient: string;
  problemYouSolve: string;
  uniqueApproach: string;
  
  // Offers & Services
  primaryOffer: string;
  primaryOfferPrice: string;
  secondaryOffer?: string;
  secondaryOfferPrice?: string;
  freeResource?: string;
  
  // Contact & Links
  instagramHandle?: string;
  websiteUrl?: string;
  email: string;
  location?: string;
  
  // Brand Personality
  brandPersonality: string; // sophisticated, warm, bold, minimalist, etc.
  brandValues: string; // 3-5 core values
  
  // Design Preferences (Missing from Zara's audit)
  stylePreference: string; // editorial-luxury, modern-minimal, warm-personal, professional-clean
  colorScheme: string; // black-white-editorial, warm-neutrals, bold-accent, monochrome
  typographyStyle: string; // times-editorial, modern-sans, classic-serif, contemporary-mix
  designPersonality: string; // sophisticated, approachable, bold, elegant, authentic
}

export default function BrandOnboarding() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BrandOnboardingData>({
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
    instagramHandle: '',
    websiteUrl: '',
    email: '',
    location: '',
    brandPersonality: '',
    brandValues: '',
    stylePreference: 'editorial-luxury',
    colorScheme: 'black-white-editorial',
    typographyStyle: 'times-editorial',
    designPersonality: 'sophisticated'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing onboarding data if available
  const { data: existingData, isLoading } = useQuery({
    queryKey: ['/api/brand-onboarding'],
    retry: false,
  });

  // Load existing data into form when available
  useEffect(() => {
    if (existingData && !isLoading) {
      setFormData({
        businessName: existingData.businessName || '',
        tagline: existingData.tagline || '',
        personalStory: existingData.personalStory || '',
        whyStarted: existingData.whyStarted || '',
        targetClient: existingData.targetClient || '',
        problemYouSolve: existingData.problemYouSolve || '',
        uniqueApproach: existingData.uniqueApproach || '',
        primaryOffer: existingData.primaryOffer || '',
        primaryOfferPrice: existingData.primaryOfferPrice || '',
        secondaryOffer: existingData.secondaryOffer || '',
        secondaryOfferPrice: existingData.secondaryOfferPrice || '',
        freeResource: existingData.freeResource || '',
        instagramHandle: existingData.instagramHandle || '',
        websiteUrl: existingData.websiteUrl || '',
        email: existingData.email || '',
        location: existingData.location || '',
        brandPersonality: existingData.brandPersonality || '',
        brandValues: existingData.brandValues || ''
      });
    }
  }, [existingData, isLoading]);

  // Save brand onboarding mutation
  const saveBrandDataMutation = useMutation({
    mutationFn: async (data: BrandOnboardingData) => {
      return apiRequest('POST', '/api/save-brand-onboarding', data);
    },
    onSuccess: () => {
      toast({
        title: "Brand Story Saved",
        description: "Your brand information has been saved. Creating your personalized template...",
      });
      // Redirect to Victoria builder with complete brand data
      setLocation('/victoria-builder');
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save brand information. Please try again.",
        
      });
    },
  });

  const handleInputChange = (field: keyof BrandOnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save all data
      saveBrandDataMutation.mutate(formData);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.tagline && formData.personalStory;
      case 2:
        return formData.targetClient && formData.problemYouSolve && formData.uniqueApproach;
      case 3:
        return formData.primaryOffer && formData.primaryOfferPrice;
      case 4:
        return formData.email && formData.brandPersonality;
      case 5:
        return formData.stylePreference && formData.colorScheme && formData.typographyStyle;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mb-4 mx-auto" />
          <p>Loading your brand information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/photo-selection">
              <button className="text-black hover:bg-gray-100 touch-manipulation px-4 py-2 min-h-[44px] flex items-center justify-center text-sm font-medium transition-colors">
                ‹ Back to Photos
              </button>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-serif text-black">Brand Story</h1>
              <p className="text-sm text-gray-600 mt-1">Step {currentStep} of 5</p>
            </div>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-black h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-black mb-3">Your Brand Foundation</h2>
              <p className="text-gray-600 text-lg">Tell us about your business and personal journey</p>
            </div>

            <div>
              <label htmlFor="business-name" className="block text-sm font-medium text-black mb-2">Business Name *</label>
              <Input
                id="business-name"
                name="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Your business or personal brand name"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-black mb-2">Tagline *</label>
              <Input
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="A powerful one-liner that captures what you do"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="personal-story" className="block text-sm font-medium text-black mb-2">Your Personal Story *</label>
              <Textarea
                id="personal-story"
                name="personalStory"
                value={formData.personalStory}
                onChange={(e) => handleInputChange('personalStory', e.target.value)}
                placeholder="Share your journey, background, and what makes your story unique. This will appear on your landing page."
                className="w-full min-h-[120px]"
              />
            </div>

            <div>
              <label htmlFor="why-started" className="block text-sm font-medium text-black mb-2">Why Did You Start This Business?</label>
              <Textarea
                id="why-started"
                name="whyStarted"
                value={formData.whyStarted}
                onChange={(e) => handleInputChange('whyStarted', e.target.value)}
                placeholder="What motivated you to begin this journey? What problem did you see that needed solving?"
                className="w-full min-h-[100px]"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-black mb-3">Your Ideal Client</h2>
              <p className="text-gray-600 text-lg">Define who you serve and how you help them</p>
            </div>

            <div>
              <label htmlFor="target-client" className="block text-sm font-medium text-black mb-2">Who Is Your Target Client? *</label>
              <Textarea
                id="target-client"
                name="targetClient"
                value={formData.targetClient}
                onChange={(e) => handleInputChange('targetClient', e.target.value)}
                placeholder="Describe your ideal client in detail. Demographics, psychographics, their current situation."
                className="w-full min-h-[100px]"
              />
            </div>

            <div>
              <label htmlFor="problem-solve" className="block text-sm font-medium text-black mb-2">What Problem Do You Solve? *</label>
              <Textarea
                id="problem-solve"
                name="problemYouSolve"
                value={formData.problemYouSolve}
                onChange={(e) => handleInputChange('problemYouSolve', e.target.value)}
                placeholder="What specific challenge, pain point, or desire do you address for your clients?"
                className="w-full min-h-[100px]"
              />
            </div>

            <div>
              <label htmlFor="unique-approach" className="block text-sm font-medium text-black mb-2">Your Unique Approach *</label>
              <Textarea
                id="unique-approach"
                name="uniqueApproach"
                value={formData.uniqueApproach}
                onChange={(e) => handleInputChange('uniqueApproach', e.target.value)}
                placeholder="What makes your solution different? What's your unique methodology or perspective?"
                className="w-full min-h-[100px]"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-black mb-3">Your Offers</h2>
              <p className="text-gray-600 text-lg">Define your services and pricing</p>
            </div>

            <div>
              <label htmlFor="primary-offer" className="block text-sm font-medium text-black mb-2">Primary Offer/Service *</label>
              <Input
                id="primary-offer"
                name="primaryOffer"
                value={formData.primaryOffer}
                onChange={(e) => handleInputChange('primaryOffer', e.target.value)}
                placeholder="Your main service or product"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="primary-offer-price" className="block text-sm font-medium text-black mb-2">Primary Offer Price *</label>
              <Input
                id="primary-offer-price"
                name="primaryOfferPrice"
                value={formData.primaryOfferPrice}
                onChange={(e) => handleInputChange('primaryOfferPrice', e.target.value)}
                placeholder="€2,500 or Starting at €1,000"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="secondary-offer" className="block text-sm font-medium text-black mb-2">Secondary Offer/Service</label>
              <Input
                id="secondary-offer"
                name="secondaryOffer"
                value={formData.secondaryOffer}
                onChange={(e) => handleInputChange('secondaryOffer', e.target.value)}
                placeholder="Additional service or product (optional)"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="secondary-offer-price" className="block text-sm font-medium text-black mb-2">Secondary Offer Price</label>
              <Input
                id="secondary-offer-price"
                name="secondaryOfferPrice"
                value={formData.secondaryOfferPrice}
                onChange={(e) => handleInputChange('secondaryOfferPrice', e.target.value)}
                placeholder="Price for secondary offer"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="free-resource" className="block text-sm font-medium text-black mb-2">Free Resource/Lead Magnet</label>
              <Input
                id="free-resource"
                name="freeResource"
                value={formData.freeResource}
                onChange={(e) => handleInputChange('freeResource', e.target.value)}
                placeholder="Free guide, consultation, or resource you offer"
                className="w-full"
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-black mb-3">Contact & Brand Style</h2>
              <p className="text-gray-600 text-lg">Complete your brand profile</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">Email Address *</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="instagram-handle" className="block text-sm font-medium text-black mb-2">Instagram Handle</label>
              <Input
                id="instagram-handle"
                name="instagramHandle"
                value={formData.instagramHandle}
                onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                placeholder="@yourinsta"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="website-url" className="block text-sm font-medium text-black mb-2">Website URL</label>
              <Input
                id="website-url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-black mb-2">Location</label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="brand-personality" className="block text-sm font-medium text-black mb-2">Brand Personality *</label>
              <Input
                id="brand-personality"
                name="brandPersonality"
                value={formData.brandPersonality}
                onChange={(e) => handleInputChange('brandPersonality', e.target.value)}
                placeholder="sophisticated, warm, bold, minimalist, luxury, approachable"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="brand-values" className="block text-sm font-medium text-black mb-2">Core Brand Values</label>
              <Textarea
                id="brand-values"
                name="brandValues"
                value={formData.brandValues}
                onChange={(e) => handleInputChange('brandValues', e.target.value)}
                placeholder="List 3-5 core values that drive your business (e.g., authenticity, excellence, innovation)"
                className="w-full min-h-[80px]"
              />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-black mb-3">Design Preferences</h2>
              <p className="text-gray-600 text-lg">Choose the visual style for your website</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-4">Website Style *</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'editorial-luxury', label: 'Editorial Luxury', desc: 'Magazine-style with Times New Roman' },
                  { value: 'modern-minimal', label: 'Modern Minimal', desc: 'Clean lines and contemporary fonts' },
                  { value: 'warm-personal', label: 'Warm Personal', desc: 'Approachable and friendly design' },
                  { value: 'professional-clean', label: 'Professional Clean', desc: 'Crisp business aesthetic' }
                ].map((style) => (
                  <div
                    key={style.value}
                    onClick={() => handleInputChange('stylePreference', style.value)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.stylePreference === style.value
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-black mb-1">{style.label}</h3>
                    <p className="text-sm text-gray-600">{style.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-4">Color Scheme *</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'black-white-editorial', label: 'Black & White Editorial', desc: 'Classic magazine contrast' },
                  { value: 'warm-neutrals', label: 'Warm Neutrals', desc: 'Creams, beiges, and soft browns' },
                  { value: 'bold-accent', label: 'Bold Accent', desc: 'Neutral base with strong accent color' },
                  { value: 'monochrome', label: 'Monochrome', desc: 'Single color with tonal variations' }
                ].map((color) => (
                  <div
                    key={color.value}
                    onClick={() => handleInputChange('colorScheme', color.value)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.colorScheme === color.value
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-black mb-1">{color.label}</h3>
                    <p className="text-sm text-gray-600">{color.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-4">Typography Style *</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'times-editorial', label: 'Times Editorial', desc: 'Classic serif for luxury appeal' },
                  { value: 'modern-sans', label: 'Modern Sans', desc: 'Clean contemporary typefaces' },
                  { value: 'classic-serif', label: 'Classic Serif', desc: 'Traditional book-style fonts' },
                  { value: 'contemporary-mix', label: 'Contemporary Mix', desc: 'Serif headers, sans body text' }
                ].map((typo) => (
                  <div
                    key={typo.value}
                    onClick={() => handleInputChange('typographyStyle', typo.value)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.typographyStyle === typo.value
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-black mb-1">{typo.label}</h3>
                    <p className="text-sm text-gray-600">{typo.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="design-personality" className="block text-sm font-medium text-black mb-2">Design Personality</label>
              <Input
                id="design-personality"
                name="designPersonality"
                value={formData.designPersonality}
                onChange={(e) => handleInputChange('designPersonality', e.target.value)}
                placeholder="sophisticated, approachable, bold, elegant, authentic"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">How should your website feel to visitors?</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="text-black hover:bg-gray-100 touch-manipulation px-4 py-2 min-h-[44px] flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹ Previous
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              {currentStep === 5 ? 'Ready to create your template?' : 'Complete this step to continue'}
            </p>
          </div>

          <button
            onClick={handleNextStep}
            disabled={!isStepComplete() || saveBrandDataMutation.isPending}
            className="bg-black text-white hover:bg-gray-800 touch-manipulation px-4 py-2 min-h-[44px] flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveBrandDataMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Creating Template...
              </div>
            ) : currentStep === 5 ? (
              'Create My Template ›'
            ) : (
              'Next ›'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}