import React, { useEffect } from 'react';
import { Redirect } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/use-auth.js';
import PageLoader from '../../components/PageLoader.js';
import { ROUTES } from '../../constants/routes.js';

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
 *    - Otherwise → /simple-training
 */
export default function PostLoginHandler() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // ✅ REMOVED DUPLICATE /api/me CALL - user data already comes from useAuth()
  // Fetch user model training status from /api/user-model
  const { data: userModel, isLoading: modelLoading, error: modelError } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated && !!user,
    retry: false,
    staleTime: 30 * 1000
  });

  // Debug logging
  useEffect(() => {
    if (user || userModel) {
      console.log('🔍 PostLoginHandler Debug:', {
        user, // Already has user data from useAuth
        userModel,
        authLoading,
        modelLoading,
        isAuthenticated
      });
    }
  }, [user, userModel, authLoading, modelLoading, isAuthenticated]);

  // Show loading while fetching data
  if (authLoading || modelLoading) {
    return <PageLoader />;
  }

  // If not authenticated, redirect to sign-in
  if (!isAuthenticated) {
    return <Redirect to={ROUTES.SIGN_IN} />;
  }

  // Handle API errors - if we can't determine status, send to training as safe fallback
  if (modelError) {
    console.error('🚨 PostLoginHandler API Error:', { modelError });
    return <Redirect to={ROUTES.SIMPLE_TRAINING} />;
  }

  // Check training status - use userModel as single source of truth
  const isModelTrained = userModel?.trainingStatus === 'completed';
  
  const shouldGoToApp = isModelTrained;

  console.log('🎯 PostLoginHandler Routing Decision:', {
    userModelStatus: userModel?.trainingStatus,
    shouldGoToApp,
    redirectTo: shouldGoToApp ? ROUTES.APP : ROUTES.SIMPLE_TRAINING
  });

  // Route based on training status
  if (shouldGoToApp) {
    return <Redirect to={ROUTES.APP} />;
  } else {
    return <Redirect to={ROUTES.SIMPLE_TRAINING} />;
  }
}