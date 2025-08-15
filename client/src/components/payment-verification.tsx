import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';

interface PaymentVerificationProps {
  children: React.ReactNode;
  requiredPlan?: string;
}

export function PaymentVerification({ children, requiredPlan }: PaymentVerificationProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check user's subscription status
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated && user?.email !== 'ssa@ssasocial.com',
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/pricing');
      return;
    }

    // Admin users (Sandra) bypass all payment verification immediately
    if (user?.email === 'ssa@ssasocial.com') {
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    // Wait for subscription data to load for non-admin users
    if (subscriptionLoading) {
      return;
    }

    // FIXED: Free users should get immediate access to workspace
    // Only block access if user needs specific premium features
    if (requiredPlan && requiredPlan !== 'free') {
      const hasRequiredPlan = subscription?.plan === requiredPlan;
      if (!hasRequiredPlan) {
        toast({
          title: "Upgrade Required",
          description: `This feature requires ${requiredPlan} subscription.`,
          variant: "destructive",
        });
        setLocation('/pricing');
        return;
      }
    }

    // Allow access to all authenticated users (free and premium)
    // The subscription endpoint creates virtual subscriptions for free users
    setHasAccess(true);
    setIsChecking(false);
  }, [isAuthenticated, subscription, subscriptionLoading, requiredPlan, user?.email, toast, setLocation]);

  if (!isAuthenticated || isChecking || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#0a0a0a] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Access Denied
          </h2>
          <p className="text-[#666666] mb-8">
            You need a valid subscription to access this feature.
          </p>
          <button
            onClick={() => setLocation('/pricing')}
            className="bg-[#0a0a0a] text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors"
          >
            View Pricing
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}