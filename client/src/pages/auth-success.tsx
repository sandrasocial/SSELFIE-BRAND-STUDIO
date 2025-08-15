import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

export default function AuthSuccess() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    const setupUserAccount = async () => {
      if (!isAuthenticated || !user || isSettingUp) return;

      setIsSettingUp(true);

      try {
        // Check if user has a stored plan from purchase or email capture
        const storedPlan = localStorage.getItem('userPlan') || localStorage.getItem('selectedPlan');
        const plan = storedPlan || 'free'; // Default to free plan

        console.log('Setting up user account with plan:', plan);

        // Setup user plan automatically
        const response = await apiRequest('POST', '/api/setup-plan', {
          plan: plan
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Plan setup successful:', data);

          // Clear stored plans
          localStorage.removeItem('userPlan');
          localStorage.removeItem('selectedPlan');

          toast({
            title: "Welcome to SSELFIE Studio!",
            description: "Your account has been set up successfully.",
          });

          // Immediate redirect with proper auth state
          setLocation('/workspace');
        } else {
          throw new Error('Failed to setup plan');
        }
      } catch (error) {
        console.error('Plan setup error:', error);
        toast({
          title: "Setup Error",
          description: "There was an issue setting up your account. Please try again.",
          variant: "destructive",
        });
        
        // Still redirect to workspace, they can setup later
        setTimeout(() => {
          setLocation('/workspace');
        }, 2000);
      }
    };

    // Only run setup if user is authenticated and we haven't run it yet
    if (isAuthenticated && !isLoading && !isSettingUp) {
      setupUserAccount();
    }
  }, [isAuthenticated, user, isLoading, isSettingUp, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#0a0a0a] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#666666]">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-8">
        <div className="w-16 h-16 border-2 border-[#0a0a0a] rounded-full flex items-center justify-center mx-auto mb-8">
          <div className="w-6 h-6 border-b-2 border-r-2 border-[#0a0a0a] transform rotate-45 translate-x-1"></div>
        </div>
        
        <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
          Welcome to SSELFIE Studio
        </h1>
        
        <p className="text-[#666666] mb-8">
          Setting up your account and workspace...
        </p>

        <div className="animate-spin w-6 h-6 border-2 border-[#0a0a0a] border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}