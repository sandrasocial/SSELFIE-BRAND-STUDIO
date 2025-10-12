/**
 * Maya Generation Polling Hook
 * Robust polling implementation for Maya image generation status
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface GenerationResult {
  status: 'processing' | 'completed' | 'failed';
  images?: string[];
  generationId?: string;
  completedAt?: Date;
  progress?: number;
}

interface UseMayaGenerationOptions {
  generationId: string | null;
  onComplete: (result: { images: string[] }) => void;
  onError: () => void;
  enabled?: boolean;
}

/**
 * Hook to poll for Maya generation status and handle completion
 * @param options - Configuration object with generationId, callbacks, and options
 */
export function useMayaGeneration({
  generationId,
  onComplete,
  onError,
  enabled = true
}: UseMayaGenerationOptions) {
  const query = useQuery<GenerationResult>({
    queryKey: ['generationStatus', generationId],
    queryFn: async () => {
      if (!generationId) throw new Error('No generation ID provided');
      
      const response = await fetch(`/api/maya/status?predictionId=${generationId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to check generation status');
      }
      
      return response.json();
    },
    enabled: enabled && !!generationId,
    refetchInterval: (query) => {
      // Get the data from the query state
      const data = query.state.data;
      // Stop polling if the job is done or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      // Poll every 3 seconds while processing
      return 3000;
    },
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: 3, // Retry failed requests 3 times
  });

  // Handle success with useEffect
  useEffect(() => {
    if (query.data?.status === 'completed' && query.data.images && query.data.images.length > 0) {
      console.log('✅ POLLING: Generation completed successfully', query.data.images);
      onComplete({ images: query.data.images });
    } else if (query.data?.status === 'failed') {
      console.error('❌ POLLING: Generation failed');
      onError();
    }
  }, [query.data?.status, query.data?.images, onComplete, onError]);

  // Handle errors with useEffect
  useEffect(() => {
    if (query.error) {
      console.error('❌ POLLING: Error checking generation status:', query.error);
      onError();
    }
  }, [query.error, onError]);

  return query;
}