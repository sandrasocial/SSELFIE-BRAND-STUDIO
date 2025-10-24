import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './use-auth.js';
import { apiFetch } from '../lib/api.js';

/**
 * User state detection hook
 * Automatically determines if a user is new or returning based on:
 * - Trained models (trainingStatus === 'completed')
 * - Generated images (count > 0)
 * - User data existence
 */
export function useUserState() {
  const { user, isLoading: authLoading } = useAuth();
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FIXED: Query for user model status with explicit queryFn
  // Without queryFn, the default query function doesn't include auth headers
  // This caused API calls to fail with 401, breaking routing logic
  const { data: userModel, isLoading: modelLoading } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: !!user && !authLoading,
    staleTime: 60 * 1000, // 60 seconds
    retry: 1,
    queryFn: () => apiFetch('/user-model')
  });

  // ✅ FIXED: Query for generated images with explicit queryFn
  const { data: galleryData, isLoading: galleryLoading } = useQuery({
    queryKey: ['/api/gallery-images'],
    enabled: !!user && !authLoading,
    staleTime: 60 * 1000, // 60 seconds
    retry: 1,
    queryFn: () => apiFetch('/gallery-images')
  });

  // Determine user state based on data
  useEffect(() => {
    if (authLoading || modelLoading || galleryLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      console.log('⚠️ useUserState: No user authenticated');
      setIsLoading(false);
      setIsNewUser(null);
      return;
    }

    // A user is considered "new" if:
    // 1. No trained model (trainingStatus !== 'completed')
    // 2. No generated images
    // 3. No existing data in the system

    const hasTrainedModel = userModel?.trainingStatus === 'completed';
    const hasGeneratedImages = galleryData && galleryData.length > 0;

    // ✅ FIXED: Only log when data is loaded (not on every render)
    console.log('✅ useUserState: Data loaded', {
      userId: user?.id?.substring(0, 8) + '...',
      userEmail: user?.email,
      trainingStatus: userModel?.trainingStatus,
      hasTrainedModel,
      generatedImagesCount: galleryData?.length || 0,
      hasGeneratedImages,
      userModel: userModel ? {
        id: userModel.id,
        trainingStatus: userModel.trainingStatus,
        needsTraining: userModel.needsTraining,
        canRetrain: userModel.canRetrain
      } : null
    });

    // New user = no trained model AND no generated images
    const newUser = !hasTrainedModel && !hasGeneratedImages;

    setIsNewUser(newUser);
    setIsLoading(false);
  }, [user, userModel, galleryData, authLoading, modelLoading, galleryLoading]);

  return {
    isNewUser,
    isLoading,
    hasTrainedModel: userModel?.trainingStatus === 'completed',
    generatedImagesCount: galleryData?.length || 0,
    userModel
  };
}

