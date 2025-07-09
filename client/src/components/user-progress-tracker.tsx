import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href?: string;
  estimatedTime?: string;
}

export function UserProgressTracker() {
  const { user, isAuthenticated } = useAuth();

  // Fetch user's progress data
  const { data: onboarding } = useQuery({
    queryKey: ['/api/onboarding'],
    enabled: isAuthenticated,
    retry: 1
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated,
    retry: 1
  });

  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated,
    retry: 1
  });

  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated,
    retry: 1
  });

  const { data: brandbook } = useQuery({
    queryKey: ['/api/brandbook'],
    enabled: isAuthenticated,
    retry: 1
  });

  if (!isAuthenticated) return null;

  // Calculate progress steps
  const progressSteps: ProgressStep[] = [
    {
      id: 'payment',
      title: 'Subscription',
      description: 'Access granted',
      completed: subscription?.status === 'active'
    },
    {
      id: 'onboarding',
      title: 'Brand Foundation',
      description: 'Vision defined',
      completed: onboarding?.currentStep === 'completed' || onboarding?.brandVibe,
      href: '/onboarding'
    },
    {
      id: 'photos',
      title: 'Visual Assets',
      description: 'Images prepared',
      completed: onboarding?.photoSourceType && (
        onboarding.photoSourceType === 'ai-model' ? userModel?.status === 'completed' :
        onboarding.photoSourceType === 'own-photos' ? onboarding.ownPhotosUploaded?.length > 0 :
        onboarding.brandedPhotosDetails
      ),
      href: '/onboarding'
    },
    {
      id: 'ai-training',
      title: 'AI Creation',
      description: 'Model trained',
      completed: userModel?.status === 'completed' || aiImages.length > 0,
      href: '/ai-generator'
    },
    {
      id: 'brandbook',
      title: 'Brand Identity',
      description: 'Style documented',
      completed: !!brandbook,
      href: '/brandbook-designer'
    },
    {
      id: 'studio',
      title: 'Business Platform',
      description: 'Launch ready',
      completed: true, // Always available after payment
      href: '/workspace'
    }
  ];

  const completedSteps = progressSteps.filter(step => step.completed).length;
  const totalSteps = progressSteps.length;

  return (
    <div className="border border-[#0a0a0a] bg-white">
      {/* Header */}
      <div className="px-12 py-8 border-b border-[#0a0a0a]">
        <h3 className="text-2xl font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
          Journey
        </h3>
        <div className="text-xs uppercase tracking-[0.2em] text-[#0a0a0a]">
          {completedSteps} of {totalSteps} complete
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-12 py-8">
        <div className="space-y-6">
          {progressSteps.map((step, index) => (
            <div key={step.id} className="group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline space-x-4">
                    <div className="text-xs text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-light mb-1 ${
                        step.completed ? 'text-[#0a0a0a]' : 'text-[#666666]'
                      }`} style={{ fontFamily: 'Times New Roman, serif' }}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-[#666666] uppercase tracking-[0.1em]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  {step.completed ? (
                    <div className="text-xs uppercase tracking-[0.1em] text-[#0a0a0a]">
                      Complete
                    </div>
                  ) : (
                    <div>
                      {step.href && (
                        <Link href={step.href}>
                          <span className="text-xs uppercase tracking-[0.1em] text-[#0a0a0a] border-b border-[#0a0a0a] pb-0.5 hover:opacity-70 transition-opacity">
                            Begin
                          </span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Divider line - except for last item */}
              {index < progressSteps.length - 1 && (
                <div className="mt-6 ml-8 border-b border-[#f5f5f5]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Action */}
      {completedSteps < totalSteps && (
        <div className="px-12 py-8 border-t border-[#0a0a0a] bg-[#f5f5f5]">
          {(() => {
            const nextStep = progressSteps.find(step => !step.completed);
            if (nextStep) {
              return (
                <div className="text-center">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#666666] mb-3">
                    Next Step
                  </div>
                  <div className="text-sm font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {nextStep.title}
                  </div>
                  {nextStep.href && (
                    <Link href={nextStep.href}>
                      <span className="inline-block border border-[#0a0a0a] bg-white text-[#0a0a0a] px-8 py-3 text-xs uppercase tracking-[0.1em] hover:bg-[#0a0a0a] hover:text-white transition-colors">
                        Continue
                      </span>
                    </Link>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}