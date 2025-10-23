import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './use-auth.js';

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

  // Query for user model status
  const { data: userModel, isLoading: modelLoading } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: !!user && !authLoading,
    staleTime: 60 * 1000, // 60 seconds
    retry: 1
  });

  // Query for generated images
  const { data: galleryData, isLoading: galleryLoading } = useQuery({
    queryKey: ['/api/gallery-images'],
    enabled: !!user && !authLoading,
    staleTime: 60 * 1000, // 60 seconds
    retry: 1
  });

  // Determine user state based on data
  useEffect(() => {
    if (authLoading || modelLoading || galleryLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
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

