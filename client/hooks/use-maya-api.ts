/**
 * Type-Safe Maya API Hook
 * Demonstrates frontend integration with type-safe Maya API
 */

import { useState, useCallback } from 'react';
import {
  MayaChatRequest,
  MayaResponse,
  ConceptCard,
  ApiResponse,
  ApiError
} from '../../shared/types/api';

interface UseMayaApiState {
  loading: boolean;
  error: ApiError | null;
  response: string | null;
  conceptCards: ConceptCard[];
}

interface MayaChatResponse {
  response: string;
  conceptCards: ConceptCard[];
  chatId: string;
  agentName: string;
  agentType: string;
  timestamp: string;
  metadata?: {
    processingTime: number;
    model: string;
    tokens: number;
  };
}

/**
 * Type-safe hook for Maya API interactions
 */
export function useMayaApi() {
  const [state, setState] = useState<UseMayaApiState>({
    loading: false,
    error: null,
    response: null,
    conceptCards: []
  });

  const sendMessage = useCallback(async (request: MayaChatRequest): Promise<MayaChatResponse | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/maya-typed-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<MayaChatResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to send message');
      }

      setState(prev => ({
        ...prev,
        loading: false,
        response: data.data!.response,
        conceptCards: data.data!.conceptCards,
        error: null
      }));

      return data.data;

    } catch (error) {
      const apiError: ApiError = {
        code: 'MAYA_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError
      }));

      return null;
    }
  }, []);

  const validateMessage = useCallback(async (request: MayaChatRequest): Promise<{
    isValid: boolean;
    errors?: Array<{ field: string; message: string; code: string }>;
    sanitizedData?: MayaChatRequest;
  } | null> => {
    try {
      const response = await fetch('/api/maya-validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<{
        isValid: boolean;
        errors?: Array<{ field: string; message: string; code: string }>;
        sanitizedData?: MayaChatRequest;
      }> = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Validation failed');
      }

      return data.data || null;

    } catch (error) {
      console.error('Validation error:', error);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      response: null,
      conceptCards: []
    });
  }, []);

  return {
    // State
    loading: state.loading,
    error: state.error,
    response: state.response,
    conceptCards: state.conceptCards,

    // Actions
    sendMessage,
    validateMessage,
    clearError,
    reset
  };
}

/**
 * Type-safe Maya API utility functions
 */
export const mayaApiUtils = {
  /**
   * Create a properly typed Maya chat request
   */
  createChatRequest: (
    message: string,
    options?: {
      chatHistory?: MayaChatRequest['chatHistory'];
      context?: MayaChatRequest['context'];
    }
  ): MayaChatRequest => ({
    message: message.trim(),
    chatHistory: options?.chatHistory || [],
    context: options?.context || {}
  }),

  /**
   * Validate message length before sending
   */
  validateMessageLength: (message: string): { isValid: boolean; error?: string } => {
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    if (trimmed.length > 5000) {
      return { isValid: false, error: 'Message too long (maximum 5000 characters)' };
    }
    return { isValid: true };
  },

  /**
   * Format concept cards for display
   */
  formatConceptCards: (conceptCards: ConceptCard[]): string[] => {
    return conceptCards.map(card => `**${card.title}**: ${card.prompt}`);
  },

  /**
   * Extract error message from API error
   */
  getErrorMessage: (error: ApiError | null): string => {
    if (!error) return '';
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Example usage:
 * 
 * const MyComponent = () => {
 *   const { sendMessage, loading, response, conceptCards, error } = useMayaApi();
 *   
 *   const handleSendMessage = async () => {
 *     const request = mayaApiUtils.createChatRequest(
 *       "Help me with a photoshoot concept",
 *       { context: { userPreferences: { stylePreferences: ['modern'] } } }
 *     );
 *     
 *     const validation = mayaApiUtils.validateMessageLength(request.message);
 *     if (!validation.isValid) {
 *       alert(validation.error);
 *       return;
 *     }
 *     
 *     const result = await sendMessage(request);
 *     if (result) {
 *       console.log('Maya response:', result.response);
 *       console.log('Concept cards:', result.conceptCards);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={handleSendMessage} disabled={loading}>
 *         {loading ? 'Sending...' : 'Send Message'}
 *       </button>
 *       {error && <p>Error: {mayaApiUtils.getErrorMessage(error)}</p>}
 *       {response && <p>Maya: {response}</p>}
 *       {conceptCards.length > 0 && (
 *         <ul>
 *           {mayaApiUtils.formatConceptCards(conceptCards).map((card, i) => (
 *             <li key={i}>{card}</li>
 *           ))}
 *         </ul>
 *       )}
 *     </div>
 *   );
 * };
 */