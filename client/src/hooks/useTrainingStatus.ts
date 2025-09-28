// Enhanced Training Status Hook
// Provides comprehensive training status management with adaptive polling

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAdaptivePolling } from './useAdaptivePolling.js';
import { ProgressMetrics, TrainingStage } from '../types/training.js';
import { apiRequest } from '../lib/queryClient.js';

interface TrainingStatusData {
  trainingStatus: 'idle' | 'training' | 'completed' | 'failed';
  progress: number;
  stage: 'preprocessing' | 'training' | 'finalizing';
  estimatedTimeRemaining: number;
  startedAt?: string;
  errorRate?: number;
  userId?: string;
}

interface UserModelResponse {
  trainingStatus?: 'idle' | 'training' | 'completed' | 'failed';
  progress?: number;
  startedAt?: string;
  userId?: string;
  [key: string]: any; // Allow additional properties
}

export const useTrainingStatus = (userId: string, enabled: boolean = true) => {
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics | null>(null);
  const [trainingStage, setTrainingStage] = useState<TrainingStage | null>(null);

  // Query for user model status
  const { 
    data: userModel, 
    refetch: refetchUserModel,
    isLoading: isUserModelLoading
  } = useQuery<UserModelResponse>({
    queryKey: ['/api/user-model'],
    enabled: enabled && !!userId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1
  });

  // Fetch detailed training progress
  const fetchTrainingProgress = useCallback(async () => {
    if (!userId || !userModel?.trainingStatus || userModel.trainingStatus !== 'training') {
      return;
    }

    try {
      const response = await fetch(`/api/training-progress/${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data: TrainingStatusData = await response.json();
        
        // Update progress metrics
        const metrics: ProgressMetrics = {
          progress: data.progress || 0,
          timeRemaining: data.estimatedTimeRemaining || 0,
          stage: data.stage || 'preprocessing',
          errorRate: data.errorRate
        };
        setProgressMetrics(metrics);

        // Update training stage
        const stage: TrainingStage = {
          name: data.stage || 'preprocessing',
          progress: data.progress || 0,
          description: getStageDescription(data.stage || 'preprocessing'),
          estimatedDuration: getStageEstimatedDuration(data.stage || 'preprocessing')
        };
        setTrainingStage(stage);

        console.log(`📊 Training progress updated: ${data.progress}% (${data.stage})`);
      }
    } catch (error) {
      console.error('Failed to fetch training progress:', error);
    }
  }, [userId, userModel?.trainingStatus]);

  // Adaptive polling for training status
  const { isPolling, currentInterval } = useAdaptivePolling({
    enabled: enabled && userModel?.trainingStatus === 'training',
    onPoll: async () => {
      await refetchUserModel();
      await fetchTrainingProgress();
    },
    progress: progressMetrics?.progress || 0
  });

  // Calculate time remaining based on progress and start time
  const calculateTimeRemaining = useCallback((progress: number, startedAt?: string): number => {
    if (!startedAt || progress <= 0) return 0;

    const startTime = new Date(startedAt).getTime();
    const elapsed = Date.now() - startTime;
    const totalEstimatedTime = 25 * 60 * 1000; // 25 minutes base estimate
    
    // Adjust based on current progress
    const remaining = totalEstimatedTime - elapsed;
    
    // Use progress to refine estimate
    if (progress > 10) {
      const progressBasedTotal = (elapsed / progress) * 100;
      const progressBasedRemaining = progressBasedTotal - elapsed;
      return Math.max(0, Math.min(remaining, progressBasedRemaining));
    }

    return Math.max(0, remaining);
  }, []);

  // Update time remaining when progress changes
  useEffect(() => {
    if (progressMetrics && userModel?.startedAt) {
      const timeRemaining = calculateTimeRemaining(progressMetrics.progress, userModel.startedAt);
      if (Math.abs(timeRemaining - progressMetrics.timeRemaining) > 5000) { // Update if >5s difference
        setProgressMetrics(prev => prev ? { ...prev, timeRemaining } : null);
      }
    }
  }, [progressMetrics?.progress, userModel?.startedAt, calculateTimeRemaining]);

  const isTraining = userModel?.trainingStatus === 'training';
  const isCompleted = userModel?.trainingStatus === 'completed';
  const isFailed = userModel?.trainingStatus === 'failed';

  return {
    userModel,
    progressMetrics,
    trainingStage,
    isTraining,
    isCompleted,
    isFailed,
    isLoading: isUserModelLoading,
    isPolling,
    currentPollingInterval: currentInterval,
    refetch: refetchUserModel,
    fetchProgress: fetchTrainingProgress
  };
};

// Helper functions for stage information
function getStageDescription(stage: string): string {
  switch (stage) {
    case 'preprocessing':
      return 'Analyzing and preparing your images for training';
    case 'training':
      return 'Training your personalized AI model';
    case 'finalizing':
      return 'Finalizing model and preparing for use';
    default:
      return 'Processing your training data';
  }
}

function getStageEstimatedDuration(stage: string): number {
  switch (stage) {
    case 'preprocessing':
      return 3 * 60 * 1000; // 3 minutes
    case 'training':
      return 20 * 60 * 1000; // 20 minutes
    case 'finalizing':
      return 2 * 60 * 1000; // 2 minutes
    default:
      return 5 * 60 * 1000; // 5 minutes default
  }
}