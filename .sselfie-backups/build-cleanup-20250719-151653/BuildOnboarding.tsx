import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// BUILD onboarding form schema
const buildOnboardingSchema = z.object({
  personalBrandName: z.string().min(1, 'Please enter your personal brand name'),
  story: z.string().min(10, 'Please share at least 10 characters about your story'),
  businessType: z.string().min(1, 'Please select your business type'),
  targetAudience: z.string().min(5, 'Please describe who you serve'),
  goals: z.string().min(5, 'Please share your goals'),
  brandKeywords: z.string().optional(),
});

type BuildOnboardingForm = z.infer<typeof buildOnboardingSchema>;

interface BuildOnboardingProps {
  onComplete: (data: any) => void;
  userId: string;
}

const businessTypes = [
  'Coach',
  'Consultant', 
  'Therapist',
  'Photographer',
  'Designer',
  'Real Estate Agent',
  'Fitness Trainer',
  'Nutritionist',
  'Beauty Professional',
  'Content Creator',
  'Speaker',
  'Author',
  'Other'
];

export function BuildOnboarding({ onComplete, userId }: BuildOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BuildOnboardingForm>({
    resolver: zodResolver(buildOnboardingSchema),
    defaultValues: {
      personalBrandName: '',
      story: '',
      businessType: '',
      targetAudience: '',
      goals: '',
      brandKeywords: '',
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: BuildOnboardingForm) => {
      const response = await apiRequest('POST', '/api/build/onboarding', {
        ...data,
        userId,
        brandKeywords: data.brandKeywords?.split(',').map(k => k.trim()).filter(Boolean) || [],
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Your story has been saved",
        description: "Victoria is now ready to help you build your website.",
      });
      onComplete(data);
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BuildOnboardingForm) => {
    onboardingMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step <= currentStep ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-8 h-px ${
                  step < currentStep ? 'bg-black' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
          Step {currentStep} of 4: Building Your Story
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Step 1: Personal Brand & Story - Sandra's Voice */}
          {currentStep === 1 && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-4xl font-serif text-black mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Let's start with the basics
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Okay, so I know this might feel like a lot, but honestly? This is the fun part. We're going to build something amazing together, and it all starts with your story.
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="personalBrandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-serif text-black mb-4 block" style={{ fontFamily: 'Times New Roman, serif' }}>
                      What should we call your brand?
                    </FormLabel>
                    <div className="text-gray-600 mb-6 leading-relaxed">
                      This is the name that's going everywhere - your website, your business cards, everything. It could be your name, your business name, or something that just feels authentically you. Don't overthink it, you can always change it later.
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Sandra Social, Your Brand Co., etc."
                        className="text-xl py-6 border-2 border-gray-200 focus:border-black text-center"
                        style={{ fontFamily: 'Times New Roman, serif' }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="story"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-serif text-black mb-4 block" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Tell me your story
                    </FormLabel>
                    <div className="text-gray-600 mb-6 leading-relaxed">
                      Here's what I want you to remember - your mess is your message. The struggles, the victories, the moments that changed everything. That's what people connect with. Share what led you here, what drives you, and why you do what you do.
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="I started my business because I was tired of settling for less than I deserved..."
                        className="min-h-40 resize-none text-lg leading-relaxed border-2 border-gray-200 focus:border-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-center">
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="px-12 py-4 bg-black text-white hover:bg-gray-800 text-lg font-medium tracking-wide"
                  disabled={!form.watch('personalBrandName') || !form.watch('story') || form.watch('story').length < 10}
                >
                  This feels right, let's continue
                </Button>
                <p className="text-sm text-gray-500 mt-4 italic">
                  Take your time - there's no rush here
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Business Type - Sandra's Voice */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-serif text-black mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                  What do you actually do?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  I need to know this so I can create a website that actually makes sense for your business. No generic templates here - we're building something that's completely you.
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel className="text-sm font-medium">Business Type</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        {businessTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => field.onChange(type)}
                            className={`p-4 text-left border rounded transition-colors ${
                              field.value === type
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{type}</div>
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-4 mt-8">
                <Button 
                  type="button" 
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                  disabled={!form.watch('businessType')}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Target Audience - Sandra's Voice */}
          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-4xl font-serif text-black mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Who do you actually serve?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
                Look, this is where most people go generic and say "everyone needs what I offer." But here's the thing - when you try to speak to everyone, you end up speaking to no one. 
                
                I want to know who you REALLY light up when you're helping them. Who are the people that make you think "this is exactly why I do what I do"?
              </p>
              
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel className="text-sm font-medium">Your Ideal Clients</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="I help busy professionals who..."
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-4 mt-8">
                <Button 
                  type="button" 
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                  disabled={!form.watch('targetAudience') || form.watch('targetAudience').length < 5}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Goals & Keywords */}
          {currentStep === 4 && (
            <div className="text-center">
              <h2 className="text-2xl font-serif font-normal mb-4">
                What Are Your Goals?
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Let's define what success looks like and the key words that represent your brand.
              </p>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-sm font-medium">Your Goals</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="I want to attract more clients by..."
                          className="min-h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandKeywords"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-sm font-medium">Brand Keywords (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="professional, authentic, results-driven"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500 text-left mt-1">
                        Separate keywords with commas
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex space-x-4 mt-8">
                <Button 
                  type="button" 
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                  disabled={onboardingMutation.isPending || !form.watch('goals') || form.watch('goals').length < 5}
                >
                  {onboardingMutation.isPending ? 'Saving...' : 'Start Building'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}