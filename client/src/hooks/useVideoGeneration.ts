import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/queryClient';

interface VideoGenerationJob {
  jobId: string;
  videoId: string;
  provider: string;
  estimatedTime: string;
}

interface UseVideoGenerationOptions {
  onSuccess?: (videoUrl: string) => void;
  onError?: (error: string) => void;
}

export function useVideoGeneration(options: UseVideoGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<VideoGenerationJob | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Poll for job status
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (job && (status === 'pending' || status === 'processing')) {
      intervalId = setInterval(async () => {
        try {
          const response = await apiRequest(`/api/video/status/${job.jobId}`, 'GET');
          
          setStatus(response.status);
          setProgress(response.progress || 0);
          
          if (response.status === 'completed' && response.videoUrl) {
            setVideoUrl(response.videoUrl);
            options.onSuccess?.(response.videoUrl);
          } else if (response.status === 'failed') {
            const errorMsg = response.error || 'Video generation failed';
            setError(errorMsg);
            options.onError?.(errorMsg);
          }
        } catch (error: any) {
          console.error('Status check failed:', error);
          const errorMsg = 'Failed to check video status';
          setError(errorMsg);
          options.onError?.(errorMsg);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [job, status, options]);

  const startGeneration = async (params: {
    imageId: string;
    motionPrompt: string;
    imageSource?: string;
  }) => {
    setIsGenerating(true);
    setError(null);
    setJob(null);
    setStatus('idle');
    setProgress(0);
    setVideoUrl(null);

    try {
      const response = await apiRequest('/api/video/generate-from-image', 'POST', {
        imageId: parseInt(params.imageId),
        motionPrompt: params.motionPrompt.trim(),
        imageSource: params.imageSource || 'generated'
      });

      setJob(response);
      setStatus('pending');
      setProgress(10);

    } catch (error: any) {
      const errorMsg = error.message || 'Failed to start video generation';
      setError(errorMsg);
      setStatus('failed');
      options.onError?.(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setError(null);
    setJob(null);
    setStatus('idle');
    setProgress(0);
    setVideoUrl(null);
  };

  return {
    isGenerating,
    error,
    job,
    status,
    progress,
    videoUrl,
    startGeneration,
    reset
  };
}
