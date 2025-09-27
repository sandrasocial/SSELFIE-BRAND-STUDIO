/**
 * CONCEPT CARDS API INTEGRATION
 * 
 * React Query hooks for concept card management using the new backend APIs
 * This replaces UI-based persistence with server-side CRUD operations
 * Uses server-generated ULID keys to solve React DOM duplicate key errors
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

// Server-side concept card type with ULID
export interface ConceptCard {
  id: string; // Server-generated ULID - guaranteed unique
  userId: string;
  conversationId?: string;
  clientId?: string; // For idempotency
  title: string;
  description?: string;
  images?: string[];
  tags?: string[];
  status: 'draft' | 'final';
  sortOrder: number;
  generatedImages?: string[];
  isLoading: boolean;
  isGenerating: boolean;
  hasGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConceptCardData {
  title: string;
  description?: string;
  conversationId?: string;
  clientId?: string; // For idempotency
  images?: string[];
  tags?: string[];
  status?: 'draft' | 'final';
  sortOrder?: number;
}

export interface UpdateConceptCardData {
  title?: string;
  description?: string;
  images?: string[];
  tags?: string[];
  status?: 'draft' | 'final';
  sortOrder?: number;
}

/**
 * Get user's concept cards with optional conversation filter
 */
export const useConceptCards = (conversationId?: string) => {
  return useQuery({
    queryKey: conversationId ? ['/api/concepts', conversationId] : ['/api/concepts'],
    queryFn: async () => {
      const url = conversationId 
        ? `/api/concepts?conversationId=${conversationId}` 
        : '/api/concepts';
      const response = await apiRequest(url, 'GET');
      return response.conceptCards as ConceptCard[];
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

/**
 * Get specific concept card by ID
 */
export const useConceptCard = (id: string) => {
  return useQuery({
    queryKey: ['/api/concepts', id],
    queryFn: async () => {
      const response = await apiRequest(`/api/concepts/${id}`, 'GET');
      return response.conceptCard as ConceptCard;
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Create new concept card with idempotency support
 */
export const useCreateConceptCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateConceptCardData) => {
      const response = await apiRequest('/api/concepts', 'POST', data);
      return response.conceptCard as ConceptCard;
    },
    onSuccess: (newCard, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] });
      if (newCard.conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/concepts', newCard.conversationId] 
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create concept card:', error);
    }
  });
};

/**
 * Update concept card
 */
export const useUpdateConceptCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateConceptCardData }) => {
      const response = await apiRequest(`/api/concepts/${id}`, 'PATCH', data);
      return response.conceptCard as ConceptCard;
    },
    onSuccess: (updatedCard) => {
      // Update specific card in cache
      queryClient.setQueryData(['/api/concepts', updatedCard.id], updatedCard);
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] });
      if (updatedCard.conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/concepts', updatedCard.conversationId] 
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update concept card:', error);
    }
  });
};

/**
 * Update concept card generation status (for image generation workflow)
 */
export const useUpdateConceptCardGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      generatedImages, 
      isLoading, 
      isGenerating, 
      hasGenerated 
    }: {
      id: string;
      generatedImages?: string[];
      isLoading?: boolean;
      isGenerating?: boolean;
      hasGenerated?: boolean;
    }) => {
      const response = await apiRequest(`/api/concepts/${id}/generation`, 'PATCH', {
        generatedImages,
        isLoading,
        isGenerating,
        hasGenerated
      });
      return response.conceptCard as ConceptCard;
    },
    onSuccess: (updatedCard) => {
      // Update specific card in cache
      queryClient.setQueryData(['/api/concepts', updatedCard.id], updatedCard);
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] });
      if (updatedCard.conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/concepts', updatedCard.conversationId] 
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update concept card generation:', error);
    }
  });
};

/**
 * Delete concept card
 */
export const useDeleteConceptCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/concepts/${id}`, 'DELETE');
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['/api/concepts', deletedId] });
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['/api/concepts'] });
    },
    onError: (error) => {
      console.error('Failed to delete concept card:', error);
    }
  });
};

/**
 * Optimistic update helper for concept card generation
 * Updates the UI immediately while the mutation is in progress
 */
export const useOptimisticConceptCardUpdate = () => {
  const queryClient = useQueryClient();

  const updateOptimistically = (
    cardId: string, 
    conversationId: string | undefined,
    updates: Partial<ConceptCard>
  ) => {
    // Update in list cache
    queryClient.setQueryData(
      conversationId ? ['/api/concepts', conversationId] : ['/api/concepts'],
      (oldData: ConceptCard[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(card => 
          card.id === cardId ? { ...card, ...updates } : card
        );
      }
    );

    // Update in individual card cache
    queryClient.setQueryData(['/api/concepts', cardId], (oldData: ConceptCard | undefined) => {
      if (!oldData) return oldData;
      return { ...oldData, ...updates };
    });
  };

  return { updateOptimistically };
};