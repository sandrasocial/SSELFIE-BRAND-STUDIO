/**
 * Hook for managing branded posts creation and state
 * Integrates with Maya's automatic text overlay service
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { apiRequest } from '../lib/queryClient';

interface BrandedPost {
  id: string;
  userId: string;
  originalImageUrl: string;
  processedImageUrl: string;
  textOverlay: string;
  overlayPosition: string;
  overlayStyle: string | null;
  socialPlatform: string;
  engagementData: any;
  isPublished: boolean;
  createdAt: string;
}

interface CreateBrandedPostRequest {
  userId: string;
  imageUrl: string;
  text: string;
  messageType: string;
  platform: string;
  overlayOptions?: any;
}

interface AutoCreateBrandedPostRequest {
  userId: string;
  imageUrl: string;
  messageType: string;
  platform: string;
  brandColorOverride?: string;
  customText?: string;
  regenerateVariation?: boolean;
}

interface BatchCreateRequest {
  userId: string;
  imageUrls: string[];
  messageType: string;
  platform: string;
}

export function useBrandedPosts(userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user's branded posts
  const {
    data: brandedPosts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['branded-posts', userId],
    queryFn: () => apiRequest(`/api/branded-posts/${userId}`),
    enabled: !!userId,
    staleTime: 30000,
  });

  // Create branded post with canvas system
  const createBrandedPost = useMutation({
    mutationFn: async (request: CreateBrandedPostRequest) => {
      return apiRequest('/api/maya/create-branded-post', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Branded Post Created! 🎨",
        description: "Your professional branded post is ready to share",
      });
      queryClient.invalidateQueries({ queryKey: ['branded-posts', userId] });
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create branded post",
        variant: "destructive"
      });
    }
  });

  // Auto-create branded post with Maya intelligence
  const autoCreateBrandedPost = useMutation({
    mutationFn: async (request: AutoCreateBrandedPostRequest) => {
      return apiRequest('/api/maya/auto-create-branded-post', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "AI Branded Post Created! 🤖",
        description: `Quality Score: ${Math.round(data.qualityScore * 100)}% | ${data.processingTime}ms`,
      });
      queryClient.invalidateQueries({ queryKey: ['branded-posts', userId] });
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Auto-Creation Failed",
        description: error.message || "Failed to create automatic branded post",
        variant: "destructive"
      });
    }
  });

  // Batch create multiple branded posts
  const batchCreateBrandedPosts = useMutation({
    mutationFn: async (request: BatchCreateRequest) => {
      return apiRequest('/api/maya/batch-create-branded-posts', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
    onSuccess: (data) => {
      const { stats } = data;
      toast({
        title: `Created ${stats.successCount} Branded Posts! 🚀`,
        description: `Average quality: ${stats.averageQualityScore}/1.0 | Total time: ${Math.round(stats.totalProcessingTime/1000)}s`,
      });
      queryClient.invalidateQueries({ queryKey: ['branded-posts', userId] });
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Batch Creation Failed",
        description: error.message || "Failed to create batch branded posts",
        variant: "destructive"
      });
    }
  });

  // Analyze image for text placement
  const analyzeImage = useMutation({
    mutationFn: async (imageUrl: string) => {
      return apiRequest('/api/maya/analyze-image-placement', {
        method: 'POST',
        body: JSON.stringify({ imageUrl })
      });
    },
    onError: (error: any) => {
      toast({
        title: "Image Analysis Failed",
        description: error.message || "Failed to analyze image",
        variant: "destructive"
      });
    }
  });

  // Generate text overlay options
  const generateTextOverlay = useMutation({
    mutationFn: async ({ userId, messageType, regenerate }: { userId: string; messageType: string; regenerate?: boolean }) => {
      return apiRequest('/api/maya/generate-text-overlay', {
        method: 'POST',
        body: JSON.stringify({ userId, messageType, regenerate })
      });
    },
    onError: (error: any) => {
      toast({
        title: "Text Generation Failed",
        description: error.message || "Failed to generate text options",
        variant: "destructive"
      });
    }
  });

  return {
    // Data
    brandedPosts: brandedPosts?.posts || [],
    isLoading,
    error,
    
    // Actions
    createBrandedPost: createBrandedPost.mutateAsync,
    autoCreateBrandedPost: autoCreateBrandedPost.mutateAsync,
    batchCreateBrandedPosts: batchCreateBrandedPosts.mutateAsync,
    analyzeImage: analyzeImage.mutateAsync,
    generateTextOverlay: generateTextOverlay.mutateAsync,
    refetch,
    
    // Loading states
    isCreating: createBrandedPost.isPending,
    isAutoCreating: autoCreateBrandedPost.isPending,
    isBatchCreating: batchCreateBrandedPosts.isPending,
    isAnalyzing: analyzeImage.isPending,
    isGeneratingText: generateTextOverlay.isPending
  };
}