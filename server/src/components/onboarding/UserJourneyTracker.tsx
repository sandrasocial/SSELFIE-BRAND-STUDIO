import React from 'react';
import { useToast } from '@/hooks/useToast';

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timeSpent?: number;
}

export const UserJourneyTracker: React.FC = () => {
  const { toast } = useToast();
  const [steps, setSteps] = React.useState<JourneyStep[]>([
    {
      id: 'upload',
      title: 'Upload Your Photos',
      description: 'Select 10-20 selfies that best represent your style',
      completed: false
    },
    {
      id: 'style',
      title: 'Define Your Style',
      description: 'Help us understand your brand aesthetic',
      completed: false
    },
    {
      id: 'training',
      title: 'Train Your Model',
      description: 'We\'re learning your unique style',
      completed: false
    },
    {
      id: 'website',
      title: 'Create Your Website',
      description: 'Build your professional online presence',
      completed: false
    }
  ]);

  const completeStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, completed: true } 
        : step
    ));

    toast({
      title: 'Step Completed!',
      description: 'Moving to next step...',
      variant: 'success'
    });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Your Journey</h2>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`p-4 rounded-lg border ${
              step.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${step.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200'
                }
              `}>
                {index + 1}
              </div>
              
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};