import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

/**
 * Hook to fetch user model status from /api/user-model
 * Returns the user's model training status and related information
 */
export function useUserModelStatus(isAuthenticated: boolean) {
  const { data: modelStatus, isLoading, error } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated, // Only fetch if user is authenticated
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
    queryFn: async () => {
      console.log('🔍 useUserModelStatus: Fetching user model status');
      const result = await apiFetch('/user-model');
      console.log('✅ useUserModelStatus: Model status received', {
        trainingStatus: result?.trainingStatus,
        needsTraining: result?.needsTraining,
        canRetrain: result?.canRetrain,
        hasTrainedModel: result?.trainingStatus === 'completed'
      });
      return result;
    }
  });

  return {
    modelStatus,
    isLoading,
    error,
    hasTrainedModel: modelStatus?.trainingStatus === 'completed'
  };
}