import React, { useEffect } from 'react';
import { Redirect } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/use-auth.js';
import { PageLoader } from '../../components/PageLoader.js';

interface UserModel {
  trainingStatus?: string;
  trainingProgress?: number;
  id?: number;
  userId?: string;
  needsTraining?: boolean;
  canRetrain?: boolean;
  modelType?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  userPlan?: string;
  hasActiveSubscription?: boolean;
  onboardingSource?: string;
}

interface MeResponse {
  success: boolean;
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    plan: string;
    role: string;
    monthlyGenerationLimit: number;
    mayaAiAccess: boolean;
    victoriaAiAccess: boolean;
    onboardingProgress: string | null;
    preferredOnboardingMode: string | null;
    lastLoginAt: Date | null;
    modelStatus?: string; // This might contain training status
  };
}

/**
 * PostLoginHandler - Gatekeeper component that redirects users based on their training status
 * 
 * This component:
 * 1. Fetches user data from /api/me endpoint
 * 2. Fetches user model data from /api/user-model endpoint  
 * 3. Redirects based on training status:
 *    - If modelStatus is 'completed' or trainingStatus is 'completed' → /app
 *    - Otherwise → /onboarding/simple-training
 */
export default function PostLoginHandler() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch user profile data from /api/me
  const { data: meData, isLoading: meLoading, error: meError } = useQuery<MeResponse>({
    queryKey: ['/api/me'],
    enabled: isAuthenticated && !!user,
    retry: false,
    staleTime: 30 * 1000
  });

  // Fetch user model training status from /api/user-model
  const { data: userModel, isLoading: modelLoading, error: modelError } = useQuery<UserModel>({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated && !!user,
    retry: false,
    staleTime: 30 * 1000
  });

  // Debug logging
  useEffect(() => {
    if (meData || userModel) {
      console.log('🔍 PostLoginHandler Debug:', {
        meData: meData?.user,
        userModel,
        authLoading,
        meLoading,
        modelLoading,
        isAuthenticated
      });
    }
  }, [meData, userModel, authLoading, meLoading, modelLoading, isAuthenticated]);

  // Show loading while fetching data
  if (authLoading || meLoading || modelLoading) {
    return <PageLoader />;
  }

  // If not authenticated, redirect to sign-in
  if (!isAuthenticated) {
    return <Redirect to="/handler/sign-in" />;
  }

  // Handle API errors - if we can't determine status, send to training as safe fallback
  if (meError || modelError) {
    console.error('🚨 PostLoginHandler API Error:', { meError, modelError });
    return <Redirect to="/onboarding/simple-training" />;
  }

  // Check training status from multiple sources for robustness
  const isModelTrained = 
    // Primary check: userModel trainingStatus
    userModel?.trainingStatus === 'completed' ||
    // Secondary check: meData modelStatus (if available)
    meData?.user?.modelStatus === 'completed' ||
    // Tertiary check: userModel needsTraining flag (inverted)
    (userModel?.needsTraining === false && userModel?.trainingStatus !== 'not_started');

  console.log('🎯 PostLoginHandler Routing Decision:', {
    isModelTrained,
    trainingStatus: userModel?.trainingStatus,
    modelStatus: meData?.user?.modelStatus,
    needsTraining: userModel?.needsTraining,
    redirectTo: isModelTrained ? '/app' : '/simple-training'
  });

  // Route based on training status
  if (isModelTrained) {
    return <Redirect to="/app" />;
  } else {
    return <Redirect to="/simple-training" />;
  }
}