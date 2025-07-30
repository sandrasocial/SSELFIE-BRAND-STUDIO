import React, { useState } from 'react';
import { useWebsiteBuilder, type WebsiteGenerationRequest } from '@/hooks/useWebsiteBuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface WebsiteWizardProps {
  onComplete: (website: any) => void;
}

export function WebsiteWizard({ onComplete }: WebsiteWizardProps) {
  const { currentStep, nextStep, prevStep, generateWebsite, isGenerating } = useWebsiteBuilder();
  
  const [formData, setFormData] = useState<Partial<WebsiteGenerationRequest>>({
    businessName: '',
    businessDescription: '',
    businessType: '',
    brandPersonality: '',
    targetAudience: '',
    keyFeatures: [],
    contentStrategy: ''
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
        const result = await generateWebsite.mutateAsync(formData as WebsiteGenerationRequest);
        onComplete(result);
      } catch (error) {
        console.error('Generation failed:', error);
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
    'Tell Me About Your Business',
    'Your Brand & Dream Clients',
    'Fun Features & Your Message',
    'Let\'s Make This Happen!'
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
          Let's Build Your Dream Website Together!
        </h1>
        <div className="flex items-center space-x-2 mb-6">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  index + 1 === currentStep
                    ? 'bg-black text-white'
                    : index + 1 < currentStep
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              {index < stepTitles.length - 1 && (
                <div className="w-16 h-px bg-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
        <h2 className="text-xl text-gray-600">Step {currentStep}: {stepTitles[currentStep - 1]}</h2>
      </div>

      <div className="bg-white p-8 border border-gray-200">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="businessName">What's your business called?</Label>
              <Input
                id="businessName"
                value={formData.businessName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Tell me your business name!"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="businessDescription">Tell me all about your amazing business!</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                placeholder="Don't be shy - what magic do you create for your clients?"
                className="mt-2"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="businessType">What kind of business magic are you working?</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Pick the one that feels most like you!" />
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
          <div className="space-y-6">
            <div>
              <Label htmlFor="brandPersonality">What's your brand's personality?</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, brandPersonality: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="How do you want to show up in the world?" />
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
              <Label htmlFor="targetAudience">Who are your dream clients?</Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="Tell me about the amazing people you love working with!"
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <Label>What amazing features should we add to make your site shine?</Label>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {availableFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.keyFeatures?.includes(feature) || false}
                      onChange={() => handleFeatureToggle(feature)}
                    />
                    <Label htmlFor={feature} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="contentStrategy">What's your heart-centered message?</Label>
              <Textarea
                id="contentStrategy"
                value={formData.contentStrategy || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contentStrategy: e.target.value }))}
                placeholder="What do you want your dream clients to feel when they visit your site?"
                className="mt-2"
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

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-8"
          >
            Back a step
          </Button>
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={currentStep === 1 && !formData.businessName}
              className="px-8 bg-black text-white hover:bg-gray-800"
            >
              Keep going!
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || isGenerating}
              className="px-8 bg-black text-white hover:bg-gray-800"
            >
              {isGenerating ? 'Creating your website...' : 'Let\'s build your website!'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}