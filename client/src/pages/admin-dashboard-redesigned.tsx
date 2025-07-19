import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/api';

export default function BuildOnboarding() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    personalBrandName: '',
    businessType: '',
    targetAudience: '',
    uniqueValue: '',
    businessGoals: '',
    contentStyle: '',
    platforms: [] as string[],
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/onboarding', data);
    },
    onSuccess: () => {
      // Handle success - redirect to dashboard or next step
      window.location.href = '/workspace';
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personalBrandName.trim()) {
      alert('Personal Brand Name is required');
      return;
    }
    onboardingMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Editorial Header */}
        <div className="text-center mb-16">
          <h1 
            className="text-6xl font-serif text-black uppercase tracking-wide mb-8"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Build Your Empire
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From phone selfies to editorial perfection. Let's architect your transformation story.
          </p>
        </div>

        {/* Luxury Form */}
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Personal Brand Name - First Priority Field */}
          <div className="space-y-4">
            <Label 
              htmlFor="personalBrandName"
              className="block text-2xl font-serif text-black uppercase tracking-wide mb-4"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Your Personal Brand Name *
            </Label>
            <div className="relative">
              <Input
                id="personalBrandName"
                type="text"
                value={formData.personalBrandName}
                onChange={(e) => handleInputChange('personalBrandName', e.target.value)}
                placeholder="The name that will define your empire..."
                className="text-xl py-6 px-6 border-2 border-black focus:border-black focus:ring-0 bg-white text-black placeholder-gray-400"
                style={{ 
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '1.25rem',
                  letterSpacing: '0.02em'
                }}
                required
              />
              {!formData.personalBrandName && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black text-2xl">
                  *
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 italic mt-2">
              This is how you'll be known. Choose something that embodies your transformation story.
            </p>
          </div>

          {/* Business Type */}
          <div className="space-y-4">
            <Label 
              htmlFor="businessType"
              className="block text-xl font-serif text-black uppercase tracking-wide"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Business Type
            </Label>
            <Input
              id="businessType"
              type="text"
              value={formData.businessType}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
              placeholder="Coach, Consultant, Creative, Entrepreneur..."
              className="text-lg py-4 px-4 border border-gray-300 focus:border-black focus:ring-0"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <Label 
              htmlFor="targetAudience"
              className="block text-xl font-serif text-black uppercase tracking-wide"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Target Audience
            </Label>
            <Input
              id="targetAudience"
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              placeholder="Women entrepreneurs, busy moms, creative professionals..."
              className="text-lg py-4 px-4 border border-gray-300 focus:border-black focus:ring-0"
            />
          </div>

          {/* Unique Value Proposition */}
          <div className="space-y-4">
            <Label 
              htmlFor="uniqueValue"
              className="block text-xl font-serif text-black uppercase tracking-wide"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Your Unique Value
            </Label>
            <Textarea
              id="uniqueValue"
              value={formData.uniqueValue}
              onChange={(e) => handleInputChange('uniqueValue', e.target.value)}
              placeholder="What makes you different? What transformation do you offer?"
              rows={4}
              className="text-lg py-4 px-4 border border-gray-300 focus:border-black focus:ring-0 resize-none"
            />
          </div>

          {/* Business Goals */}
          <div className="space-y-4">
            <Label 
              htmlFor="businessGoals"
              className="block text-xl font-serif text-black uppercase tracking-wide"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Business Goals
            </Label>
            <Textarea
              id="businessGoals"
              value={formData.businessGoals}
              onChange={(e) => handleInputChange('businessGoals', e.target.value)}
              placeholder="What do you want to achieve in the next 90 days?"
              rows={3}
              className="text-lg py-4 px-4 border border-gray-300 focus:border-black focus:ring-0 resize-none"
            />
          </div>

          {/* Content Style Preferences */}
          <div className="space-y-4">
            <Label 
              htmlFor="contentStyle"
              className="block text-xl font-serif text-black uppercase tracking-wide"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Content Style
            </Label>
            <Input
              id="contentStyle"
              type="text"
              value={formData.contentStyle}
              onChange={(e) => handleInputChange('contentStyle', e.target.value)}
              placeholder="Professional, casual, bold, minimalist..."
              className="text-lg py-4 px-4 border border-gray-300 focus:border-black focus:ring-0"
            />
          </div>

          {/* Platform Selection */}
          <div className="space-y-6">
            <Label className="block text-xl font-serif text-black uppercase tracking-wide"
                   style={{ fontFamily: 'Times New Roman, serif' }}>
              Preferred Platforms
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'YouTube', 'Twitter', 'Pinterest', 'Website'].map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`py-3 px-4 border-2 text-center transition-all ${
                    formData.platforms.includes(platform)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8">
            <Button
              type="submit"
              disabled={onboardingMutation.isPending || !formData.personalBrandName.trim()}
              className="w-full py-6 text-xl font-serif uppercase tracking-wide border-2 border-black text-black bg-white hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              {onboardingMutation.isPending ? 'Building Your Empire...' : 'Begin Transformation'}
            </Button>
          </div>

          {/* Error Display */}
          {onboardingMutation.error && (
            <div className="mt-4 p-4 border border-red-300 bg-red-50 text-red-700 text-center">
              Something went wrong. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}