/**
 * Maya Generation Polling Hook
 * Robust polling implementation for Maya image generation status
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Enhanced error types for better user experience
interface MayaError {
  type: 'network' | 'auth' | 'validation' | 'generation' | 'timeout' | 'rate_limit' | 'server' | 'unknown';
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  details?: any;
}

// Error classification and user-friendly messages
const classifyError = (error: any): MayaError => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';

  // Network errors
  if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('connection')) {
    return {
      type: 'network',
      message: errorMessage,
      userMessage: 'Connection lost. Please check your internet and try again.',
      recoverable: true,
      retryable: true
    };
  }

  // Authentication errors
  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return {
      type: 'auth',
      message: errorMessage,
      userMessage: 'Please sign in again to continue.',
      recoverable: true,
      retryable: false
    };
  }

  // Generation errors
  if (errorMessage.includes('generation') || errorMessage.includes('model') || errorMessage.includes('training')) {
    return {
      type: 'generation',
      message: errorMessage,
      userMessage: 'Image generation failed. Please try a different concept or contact support if this persists.',
      recoverable: true,
      retryable: true
    };
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      type: 'timeout',
      message: errorMessage,
      userMessage: 'Request timed out. Please try again.',
      recoverable: true,
      retryable: true
    };
  }

  // Rate limiting
  if (errorMessage.includes('rate') || errorMessage.includes('limit') || errorMessage.includes('429')) {
    return {
      type: 'rate_limit',
      message: errorMessage,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      recoverable: true,
      retryable: true
    };
  }

  // Server errors
  if (errorMessage.includes('server') || errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
    return {
      type: 'server',
      message: errorMessage,
      userMessage: 'Server temporarily unavailable. Please try again in a few minutes.',
      recoverable: true,
      retryable: true
    };
  }

  // Default unknown error
  return {
    type: 'unknown',
    message: errorMessage,
    userMessage: 'Something went wrong. Please try again or contact support.',
    recoverable: true,
    retryable: true
  };
};

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
  onError: (error: MayaError) => void;
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
  const query = useQuery({
    queryKey: ['generationStatus', generationId],
    queryFn: async () => {
      if (!generationId) throw new Error('No generation ID provided');

      const response = await fetch(`/api/maya/generation-status?predictionId=${generationId}`, {
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
      const error = classifyError(new Error('Generation failed'));
      onError(error);
    }
  }, [query.data?.status, query.data?.images, onComplete, onError]);

  // Handle errors with useEffect
  useEffect(() => {
    if (query.error) {
      console.error('❌ POLLING: Error checking generation status:', query.error);
      const classifiedError = classifyError(query.error);
      onError(classifiedError);
    }
  }, [query.error, onError]);

  return query;
}