import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface WebsiteGenerationRequest {
  businessType: string;
  brandPersonality: string;
  targetAudience: string;
  keyFeatures: string[];
  colorPreferences?: string;
  contentStrategy: string;
  businessName: string;
  businessDescription: string;
}

export interface Website {
  id: string;
  preview: string;
  template: string;
  estimatedGenerationTime: number;
  status: 'draft' | 'generated' | 'deployed';
  deploymentUrl?: string;
}

export function useWebsiteBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const queryClient = useQueryClient();

  const generateWebsite = useMutation({
    mutationFn: async (data: WebsiteGenerationRequest) => {
      const response = await apiRequest('/api/victoria/generate', 'POST', data);
      return response.website;
    },
    onSuccess: (website: Website) => {
      setCurrentWebsite(website);
      setGenerationProgress(100);
      queryClient.invalidateQueries({ queryKey: ['/api/victoria/websites'] });
    },
    onError: (error) => {
      console.error('Website generation failed:', error);
      setGenerationProgress(0);
    }
  });

  const customizeWebsite = useMutation({
    mutationFn: async ({ siteId, modifications }: { 
      siteId: string; 
      modifications: any 
    }) => {
      return await apiRequest('/api/victoria/customize', 'POST', {
        siteId,
        modifications
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/victoria/websites'] });
    }
  });

  const deployWebsite = useMutation({
    mutationFn: async ({ siteId, domainPreferences }: { 
      siteId: string; 
      domainPreferences?: any 
    }) => {
      return await apiRequest('/api/victoria/deploy', 'POST', {
        siteId,
        domainPreferences
      });
    },
    onSuccess: (deployment) => {
      if (currentWebsite) {
        setCurrentWebsite({
          ...currentWebsite,
          status: 'deployed',
          deploymentUrl: deployment.deployment.url
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/victoria/websites'] });
    }
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/victoria/templates'],
    retry: false
  });

  const simulateProgress = useCallback(() => {
    setGenerationProgress(0);
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);
    return interval;
  }, []);

  const resetBuilder = useCallback(() => {
    setCurrentStep(1);
    setGenerationProgress(0);
    setCurrentWebsite(null);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  return {
    // State
    currentStep,
    generationProgress,
    currentWebsite,
    templates,
    templatesLoading,
    
    // Actions
    generateWebsite,
    customizeWebsite,
    deployWebsite,
    simulateProgress,
    resetBuilder,
    nextStep,
    prevStep,
    setCurrentStep,
    
    // Loading states
    isGenerating: generateWebsite.isPending,
    isCustomizing: customizeWebsite.isPending,
    isDeploying: deployWebsite.isPending
  };
}