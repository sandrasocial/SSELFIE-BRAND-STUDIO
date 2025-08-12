import React, { useState } from 'react';
import { useWebsiteBuilder, type WebsiteGenerationRequest } from '@/hooks/useWebsiteBuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface WebsiteWizardProps {
  onComplete: (website: any) => void;
}

export function WebsiteWizard({ onComplete }: WebsiteWizardProps) {
  const { currentStep, nextStep, prevStep, generateWebsite, isGenerating } = useWebsiteBuilder();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<WebsiteGenerationRequest>>({
    businessName: '',
    businessDescription: '',
    businessType: '',
    brandPersonality: '',
    targetAudience: '',
    keyFeatures: [],
    contentStrategy: ''
  });

  // Mutation to save onboarding data before generation
  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: Partial<WebsiteGenerationRequest>) => {
      return apiRequest('/api/build/onboarding', 'POST', data);
    },
    onError: (error) => {
      console.error('Failed to save onboarding data:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your information. Please try again.",
        
      });
    },
  });

  const businessTypes = [
    'consulting',
    'coaching',
    'creative-services',
    'ecommerce',
    'professional-services',
    'health-wellness',
    'real-estate',
    'photography',
    'marketing-agency'
  ];

  const brandPersonalities = [
    'professional',
    'elegant',
    'modern',
    'luxury',
    'approachable',
    'authoritative',
    'creative',
    'minimal'
  ];

  const availableFeatures = [
    'Contact Forms',
    'Booking System',
    'Portfolio Gallery',
    'Testimonials',
    'Service Listings',
    'About Section',
    'Team Profiles',
    'Blog Integration',
    'Social Media Links',
    'Newsletter Signup'
  ];

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures?.includes(feature)
        ? prev.keyFeatures.filter(f => f !== feature)
        : [...(prev.keyFeatures || []), feature]
    }));
  };

  const handleSubmit = async () => {
    if (isFormValid()) {
      try {
        console.log('💾 Saving onboarding data before website generation...');
        
        // First, save the onboarding data to the database
        await saveOnboardingMutation.mutateAsync(formData as WebsiteGenerationRequest);
        
        console.log('✅ Onboarding data saved successfully, now generating website...');
        
        // Then generate the website with Victoria
        const result = await generateWebsite.mutateAsync(formData as WebsiteGenerationRequest);
        onComplete(result);
      } catch (error) {
        console.error('Generation failed:', error);
        toast({
          title: "Generation Failed",
          description: "Failed to create your website. Please try again.",
          
        });
      }
    }
  };

  const isFormValid = () => {
    return formData.businessName && 
           formData.businessDescription && 
           formData.businessType && 
           formData.brandPersonality && 
           formData.targetAudience &&
           formData.contentStrategy;
  };

  const stepTitles = [
    'Tell Me About Your Personal Brand',
    'Your Brand & Ideal Clients',
    'Essential Features & Your Message',
    'Review & Create Your Website'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Full Bleed Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.5)), url('https://images.unsplash.com/photo-1594736797933-d0401ba52fe6?q=80&w=2070&auto=format&fit=crop')`
          }}
        />
        
        {/* Hero Content Overlay */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center px-8 max-w-4xl">
            <h1 className="text-8xl font-normal mb-12 tracking-wide leading-none text-white" 
                style={{ fontFamily: 'Times New Roman, serif' }}>
              Craft Your Digital
              <br />
              <span className="italic font-light">Empire</span>
            </h1>
            <p className="text-2xl text-white font-light max-w-3xl mx-auto leading-relaxed opacity-90" 
               style={{ fontFamily: 'Times New Roman, serif' }}>
              Where luxury meets functionality. Where your vision becomes digital reality.
            </p>
            <div className="mt-8 pt-6 border-t border-white/30">
              <span className="text-lg font-normal text-white/90" 
                    style={{ fontFamily: 'Times New Roman, serif' }}>
                €67/month • Premium Digital Architecture
              </span>
            </div>
          </div>
        </div>
        
        {/* Elegant Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70">
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-sm mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>Begin Your Journey</span>
            <div className="w-px h-8 bg-white/50"></div>
          </div>
        </div>
      </div>

      {/* Content Section with Editorial Spacing */}
      <div className="max-w-5xl mx-auto px-12 py-20">
        <div className="mb-20">
          {/* Editorial Chapter Introduction */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-light mb-6" 
              style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
            Your Digital Transformation
          </h2>
          <div className="w-32 h-px bg-black mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto" 
             style={{ fontFamily: 'Times New Roman, serif' }}>
            Four curated steps to architect your premium digital presence
          </p>
        </div>

        {/* Luxury Progress Indicator */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center space-x-8">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center group">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center text-sm font-light transition-all duration-500 transform ${
                      index + 1 === currentStep
                        ? 'bg-black text-white scale-110 shadow-lg'
                        : index + 1 < currentStep
                        ? 'bg-gray-800 text-white scale-105'
                        : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ 
                      borderRadius: '2px',
                      fontFamily: 'Times New Roman, serif'
                    }}
                  >
                    {index + 1 < currentStep ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs mt-3 font-light transition-colors duration-300 ${
                    index + 1 === currentStep ? 'text-black' : 'text-gray-400'
                  }`} style={{ fontFamily: 'Times New Roman, serif' }}>
                    {title.length > 20 ? `${title.substring(0, 20)}...` : title}
                  </span>
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`w-20 h-px mx-6 transition-colors duration-500 ${
                    index + 1 < currentStep ? 'bg-black' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Indicator */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-light text-gray-700" 
              style={{ fontFamily: 'Times New Roman, serif' }}>
            Chapter {currentStep}
          </h2>
          <div className="w-24 h-px bg-black mx-auto mt-4"></div>
        </div>

        {/* Editorial Form Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-gray-100 p-12 shadow-sm">
            
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <Label htmlFor="businessName" className="text-lg font-light mb-4 block" 
                         style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                    What is your Personal Brand called?
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your Personal Brand name"
                    className="mt-3 text-lg border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 focus:ring-0 focus:border-black transition-colors duration-300"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  />
                </div>
                <div>
                  <Label htmlFor="businessDescription" className="text-lg font-light mb-4 block" 
                         style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                    Tell me about your Personal Brand and what you offer
                  </Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                    placeholder="Share your services, mission, and what makes your Personal Brand unique..."
                    className="mt-3 text-lg border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 focus:ring-0 focus:border-black transition-colors duration-300 resize-none"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="businessType" className="text-lg font-light mb-4 block" 
                         style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                    What type of Personal Brand do you have?
                  </Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                    <SelectTrigger className="mt-3 text-lg border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 focus:ring-0 focus:border-black transition-colors duration-300">
                      <SelectValue placeholder="Select your Personal Brand category" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <Label htmlFor="brandPersonality" className="text-lg font-light mb-4 block" 
                         style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                    What is your Personal Brand's personality?
                  </Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, brandPersonality: value }))}>
                    <SelectTrigger className="mt-3 text-lg border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 focus:ring-0 focus:border-black transition-colors duration-300">
                      <SelectValue placeholder="How do you want to show up professionally?" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandPersonalities.map((personality) => (
                        <SelectItem key={personality} value={personality}>
                          {personality.charAt(0).toUpperCase() + personality.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetAudience" className="text-lg font-light mb-4 block" 
                         style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                    Who are your ideal clients?
                  </Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Describe the clients you love working with and who need your expertise..."
                    className="mt-3 text-lg border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 focus:ring-0 focus:border-black transition-colors duration-300 resize-none"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <Label className="text-lg font-light mb-4 block" 
                         style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                    What essential features should we include on your website?
                  </Label>
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    {availableFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-3">
                        <Checkbox
                          id={feature}
                          checked={formData.keyFeatures?.includes(feature) || false}
                          onChange={() => handleFeatureToggle(feature)}
                          className="border-2 border-gray-300"
                        />
                        <Label htmlFor={feature} className="text-base font-light" 
                               style={{ fontFamily: 'Times New Roman, serif' }}>
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="contentStrategy" className="text-lg font-light mb-4 block" 
                         style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                    What is your core message and value proposition?
                  </Label>
                  <Textarea
                    id="contentStrategy"
                    value={formData.contentStrategy || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentStrategy: e.target.value }))}
                    placeholder="What do you want your ideal clients to understand and feel when they visit your website?"
                    className="mt-3 text-lg border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 focus:ring-0 focus:border-black transition-colors duration-300 resize-none"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    rows={4}
                  />
                </div>
              </div>
            )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Let's review your website plan!</h3>
            <div className="space-y-4 text-sm">
              <div>
                <strong>Your beautiful business:</strong> {formData.businessName}
              </div>
              <div>
                <strong>Business magic:</strong> {formData.businessType?.replace('-', ' ')}
              </div>
              <div>
                <strong>Brand personality:</strong> {formData.brandPersonality}
              </div>
              <div>
                <strong>Sparkly features:</strong> {formData.keyFeatures?.join(', ')}
              </div>
            </div>
          </div>
        )}

            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-8 py-3 text-lg font-light border-2 border-gray-300 hover:border-black transition-colors duration-300"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Previous
              </Button>
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={currentStep === 1 && !formData.businessName}
                  className="px-8 py-3 text-lg font-light bg-black text-white hover:bg-gray-800 transition-colors duration-300"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isGenerating}
                  className="px-8 py-3 text-lg font-light bg-black text-white hover:bg-gray-800 transition-colors duration-300"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {isGenerating ? 'Creating your website...' : 'Create My Website'}
                </Button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}