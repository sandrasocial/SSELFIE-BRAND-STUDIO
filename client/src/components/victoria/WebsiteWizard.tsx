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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Editorial Header Section */}
      <div className="max-w-5xl mx-auto px-12 py-16">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-normal mb-8 tracking-wide leading-tight" 
              style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
            Craft Your Digital
            <br />
            <span className="italic">Empire</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed" 
             style={{ fontFamily: 'Times New Roman, serif' }}>
            Where luxury meets functionality. Where your vision becomes digital reality.
            <br />
            <span className="text-sm font-normal mt-4 block">€67/month • Premium Digital Architecture</span>
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
      </div>



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