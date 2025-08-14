import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AiImage } from '@shared/schema';

export default function Workspace() {
  const { user, isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const { data: aiImages = [], isLoading } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated,
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/subscription/status'],
    enabled: isAuthenticated,
  });

  const isPremium = (subscriptionData as any)?.subscription?.status === 'active';

  const getJourneySteps = () => {
    const hasImages = (aiImages as any).length > 0;
    
    return [
      {
        number: 1,
        title: 'TRAIN Your AI Model',
        subtitle: 'Just you, your phone, and 15 minutes',
        description: 'Hey gorgeous! I remember feeling so awkward taking selfies at first. But here\'s what I learned: your phone already knows how to make you look incredible. Trust me on this one.',
        status: hasImages ? 'completed' : 'current',
        action: hasImages ? 'View Your Training' : 'Let\'s Do This',
        path: '/ai-training',
        sandraNote: 'I was shaking when I took my first selfies. Now look where we are.'
      },
      {
        number: 2,
        title: 'STYLE Your Vision',
        subtitle: 'Maya knows exactly what works',
        description: 'This is where the magic happens, babe. Maya\'s going to help you figure out your visual story. No more guessing what "on brand" means - she\'ll show you.',
        status: hasImages ? 'current' : 'upcoming',
        action: 'Chat with Maya',
        path: '/maya',
        sandraNote: 'Maya gets it. She\'ll help you find your thing.'
      },
      {
        number: 3,
        title: 'PHOTOSHOOT Magic',
        subtitle: 'Watch your transformation happen',
        description: 'Okay, this part still gives me chills. You\'re about to see yourself the way others see you - confident, powerful, unstoppable. Get ready.',
        status: hasImages ? 'available' : 'upcoming',
        action: 'Generate Your Photos',
        path: '/ai-photoshoot',
        sandraNote: 'The first time I saw my AI photos, I cried. Good tears.'
      },
      {
        number: 4,
        title: 'BUILD Your Empire',
        subtitle: 'From photos to full business in 20 minutes',
        description: 'This is it, gorgeous. Victoria\'s going to help you turn everything we just created into a real business. Website, booking system, the works. Your mess becomes your message becomes your money.',
        status: hasImages ? 'available' : 'upcoming',
        action: 'Launch Your Empire',
        path: '/build',
        sandraNote: 'I built my first €10K month with exactly this process.'
      }
    ];
  };

  const steps = getJourneySteps();

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-black text-white';
      case 'current':
        return 'bg-black text-white';
      case 'available':
        return 'border-black text-black hover:bg-black hover:text-white';
      default:
        return 'border-gray-300 text-gray-400';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-black mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-6">Access your personal AI model workspace</p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="border-black text-black hover:bg-black hover:text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-5xl font-serif text-black uppercase tracking-wide mb-2" 
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Hey Gorgeous
              </h1>
              <p className="text-lg text-gray-600">
                Welcome to your studio. This is where your mess becomes your message becomes your money. Ready?
              </p>
            </div>
            <div className="text-right">
              <Badge 
                variant={isPremium ? "default" : "outline"}
                className={cn(
                  "text-sm px-4 py-2",
                  isPremium 
                    ? "bg-black text-white" 
                    : "border-gray-300 text-gray-600"
                )}
              >
                {isPremium ? 'SSELFIE Studio Active' : 'Free Plan'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Steps */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 
            className="text-3xl font-serif text-black uppercase tracking-wide mb-4" 
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Here's How We Do This
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            I remember when I first started - I had no clue what I was doing. But I figured out the exact process that works. You don't need to have it all together. You just need to start.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card 
              key={step.number}
              className={cn(
                "border-2 transition-all duration-200 cursor-pointer",
                activeStep === index ? "border-black shadow-lg" : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => setActiveStep(activeStep === index ? null : index)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      getStepStatusColor(step.status)
                    )}
                  >
                    {step.number}
                  </div>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs",
                      step.status === 'completed' ? 'border-green-500 text-green-700' :
                      step.status === 'current' ? 'border-black text-black' :
                      step.status === 'available' ? 'border-blue-500 text-blue-700' :
                      'border-gray-300 text-gray-500'
                    )}
                  >
                    {step.status === 'completed' ? 'Complete' :
                     step.status === 'current' ? 'Active' :
                     step.status === 'available' ? 'Ready' :
                     'Locked'}
                  </Badge>
                </div>

                <h3 
                  className="text-xl font-serif text-black uppercase tracking-wide mb-2" 
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {step.title}
                </h3>
                
                <p className="text-sm text-gray-600 font-medium mb-3">
                  {step.subtitle}
                </p>
                
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  {step.description}
                </p>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (step.status !== 'upcoming') {
                      window.location.href = step.path;
                    }
                  }}
                  disabled={step.status === 'upcoming'}
                  className={cn(
                    "w-full text-sm",
                    step.status === 'upcoming' 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
                      : "border-black text-black hover:bg-black hover:text-white"
                  )}
                  variant="outline"
                >
                  {step.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-serif text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
              {(aiImages as AiImage[]).length}
            </div>
            <p className="text-gray-600">AI Photos Generated</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-serif text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
              {isPremium ? '∞' : '6'}
            </div>
            <p className="text-gray-600">Generations {isPremium ? 'Unlimited' : 'Remaining'}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-serif text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
              20min
            </div>
            <p className="text-gray-600">Selfie to Business</p>
          </div>
        </div>
      </div>
    </div>
  );
}