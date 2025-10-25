/* eslint-disable no-console */
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';
import { useAuth } from './use-auth.js';

/**
 * Hook to fetch user model status from /api/user-model
 * Returns the user's model training status and related information
 */
export function useUserModelStatus(isAuthenticated: boolean) {
  const { user } = useAuth();
  
  const { data: modelStatus, isLoading, error } = useQuery({
    queryKey: ['/api/user-model', user?.id], // Include user ID for per-user caching
    enabled: isAuthenticated && !!user,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
    queryFn: async () => {
      console.log('🔍 useUserModelStatus: Fetching user model status');
      try {
        const result = await apiFetch('/user-model');
        // ✅ FIXED: Extract data from API response wrapper
        const modelData = result?.data || result;
        console.log('✅ useUserModelStatus: API call successful', {
          trainingStatus: modelData?.trainingStatus,
          needsTraining: modelData?.needsTraining,
          canRetrain: modelData?.canRetrain,
          hasTrainedModel: modelData?.trainingStatus === 'completed',
          fullResponse: result,
          extractedData: modelData
        });
        return modelData;
      } catch (error) {
        console.error('❌ useUserModelStatus: API call failed', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    }
  });

  const hasTrainedModel = modelStatus?.trainingStatus === 'completed';
  
  console.log('🔍 useUserModelStatus: Hook state', {
    isAuthenticated,
    isLoading,
    error: error?.message || error,
    hasTrainedModel,
    modelStatus: modelStatus ? {
      trainingStatus: modelStatus.trainingStatus,
      needsTraining: modelStatus.needsTraining,
      canRetrain: modelStatus.canRetrain
    } : null
  });

  return {
    modelStatus,
    isLoading,
    error,
    hasTrainedModel
  };
}