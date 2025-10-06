import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient.js';
import { useAuth } from '../hooks/use-auth.js';
import { useToast } from '../hooks/use-toast.js';
import type { ConceptCard } from '../../../shared/types/concept-card.js';

// Types

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  quickButtons?: string[];
  generatedImages?: string[];
}

interface BrandStudioState {
  conversationId: string | null;
  messages: ChatMessage[];
  conceptCardsById: Record<string, ConceptCard>;
  selectedConceptCardId: string | null;
  isTyping: boolean;
  pendingMessageIds: string[];
  activeTab: 'photo' | 'story' | 'maya';
  handoffData: {
    conceptCard?: ConceptCard;
    fromPhoto?: boolean;
  } | null;
}

interface BrandStudioContextType extends BrandStudioState {
  // Actions
  sendMessage: (content: string) => void;
  selectConceptCard: (id: string | null) => void;
  generateImage: (cardId: string) => void;
  setActiveTab: (tab: 'photo' | 'story' | 'maya') => void;
    setHandoffData: (data: BrandStudioState['handoffData']) => void;
  clearHandoffData: () => void;
  startNewSession: () => void;
  // Additional properties
  selectedItem: ConceptCard | null;
  setSelectedItem: (item: ConceptCard | null) => void;
  // Status
  isLoading: boolean;
}

// Action types
type BrandStudioAction =
  | { type: 'SET_CONVERSATION_ID'; payload: string }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'ADD_PENDING_MESSAGE'; payload: string }
  | { type: 'REMOVE_PENDING_MESSAGE'; payload: string }
  | { type: 'UPDATE_CONCEPT_CARDS'; payload: ConceptCard[] }
  | { type: 'SELECT_CONCEPT_CARD'; payload: string | null }
  | { type: 'SET_ACTIVE_TAB'; payload: 'photo' | 'story' | 'maya' }
  | { type: 'SET_HANDOFF_DATA'; payload: BrandStudioState['handoffData'] }
  | { type: 'CLEAR_HANDOFF_DATA' }
  | { type: 'CLEAR_CONVERSATION' };

// Reducer
function brandStudioReducer(state: BrandStudioState, action: BrandStudioAction): BrandStudioState {
  switch (action.type) {
    case 'SET_CONVERSATION_ID':
      return { ...state, conversationId: action.payload };
      
    case 'SET_MESSAGES':
      // FIXED: Set messages atomically (for history loading)
      return { ...state, messages: action.payload };
      
    case 'ADD_MESSAGE':
      // Deduplicate: only add if message with same ID doesn't exist
      const existingMessage = state.messages.find(msg => msg.id === action.payload.id);
      if (existingMessage) return state;
      
      return {
        ...state,
        messages: [...state.messages, action.payload],
        pendingMessageIds: state.pendingMessageIds.filter(id => id !== action.payload.id)
      };
      
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
      
    case 'ADD_PENDING_MESSAGE':
      return {
        ...state,
        pendingMessageIds: [...state.pendingMessageIds, action.payload]
      };
      
    case 'REMOVE_PENDING_MESSAGE':
      return {
        ...state,
        pendingMessageIds: state.pendingMessageIds.filter(id => id !== action.payload)
      };
      
    case 'UPDATE_CONCEPT_CARDS':
      const conceptCardsById = { ...state.conceptCardsById };
      action.payload.forEach(card => {
        conceptCardsById[card.id] = card;
      });
      return { ...state, conceptCardsById };
      
    case 'SELECT_CONCEPT_CARD':
      return { ...state, selectedConceptCardId: action.payload };
      
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
      
    case 'SET_HANDOFF_DATA':
      return { ...state, handoffData: action.payload };
      
    case 'CLEAR_HANDOFF_DATA':
      return { ...state, handoffData: null };
      
    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        messages: [],
        conceptCardsById: {},
        selectedConceptCardId: null,
        pendingMessageIds: [],
        isTyping: false
      };
      
    default:
      return state;
  }
}

// Initial state
const initialState: BrandStudioState = {
  conversationId: null,
  messages: [],
  conceptCardsById: {},
  selectedConceptCardId: null,
  isTyping: false,
  pendingMessageIds: [],
  activeTab: 'photo',
  handoffData: null,
};

// Context
const BrandStudioContext = createContext<BrandStudioContextType | null>(null);

// Provider component
export function BrandStudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(brandStudioReducer, initialState);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate conversation ID on mount
  React.useEffect(() => {
    if (user && !state.conversationId) {
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      dispatch({ type: 'SET_CONVERSATION_ID', payload: conversationId });
    }
  }, [user, state.conversationId]);

  // Load conversation history (TEMPORARILY DISABLED - endpoint needs implementation)
  const { isLoading } = useQuery({
    queryKey: ['/api/maya/chat-history', state.conversationId],
    queryFn: async () => {
      const response = await apiRequest('/api/maya/chat-history', 'GET');
      if (response.messages?.length > 0) {
        // FIXED: Set messages atomically instead of appending to prevent duplicates
        dispatch({ type: 'SET_MESSAGES', payload: response.messages });
      }
      return response;
    },
    enabled: false, // TEMPORARILY DISABLED until /api/maya/chat-history endpoint is implemented
    staleTime: 30000,
    refetchOnWindowFocus: false, // Prevent duplicate loading on focus
  });

  // Send message mutation with full Maya personality system
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      // Build conversation history for Maya's context
      const chatHistory = state.messages.map(msg => ({
        [msg.type]: msg.content
      }));

      const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: messageContent,
          chatHistory: chatHistory,
          context: {
            styling: true,
            conversationId: state.conversationId,
            userIntent: 'creative_direction',
            sessionType: 'brand_studio'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Handle Maya's intelligent response with proper concept card extraction
      
      if (data.response || data.content || data.message) {
        const mayaMessage: ChatMessage = {
          id: `maya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'maya',
          content: data.response || data.content || data.message || '',
          timestamp: new Date().toISOString(),
          conceptCards: data.conceptCards || [],
          quickButtons: data.quickButtons || []
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: mayaMessage });
        
        // Update concept cards with proper IDs for selection
        if (data.conceptCards?.length > 0) {
          const processedConceptCards = data.conceptCards.map((card: ConceptCard, index: number) => ({
            ...card,
            id: card.id || `concept_${Date.now()}_${index}`,
            canGenerate: true,
            isGenerating: false
          }));
          dispatch({ type: 'UPDATE_CONCEPT_CARDS', payload: processedConceptCards });
        }
      }
      dispatch({ type: 'SET_TYPING', payload: false });
    },
    onError: () => {
      dispatch({ type: 'SET_TYPING', payload: false });
      toast({ 
        title: "Connection Error", 
        description: "Failed to send message. Please try again." 
      });
    }
  });

  // Generate image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const conceptCard = state.conceptCardsById[cardId];
      if (!conceptCard) throw new Error('Concept card not found');

      const response = await fetch('/api/maya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conceptCard: conceptCard,
          conversationId: state.conversationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate image');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Start polling for generation status
      if (data.generationId) {
        pollGenerationStatus(data.generationId);
      }
    },
    onError: (error) => {
      toast({ 
        title: "Generation Error", 
        description: error.message || "Failed to generate image. Please try again." 
      });
    }
  });

  // Poll generation status
  const pollGenerationStatus = useCallback(async (generationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/maya/status/${generationId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          clearInterval(pollInterval);
          return;
        }

        const status = await response.json();

        if (status.status === 'completed' && status.images) {
          clearInterval(pollInterval);
          
          // Add generated images to the conversation
          const imageMessage: ChatMessage = {
            id: `images_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'maya',
            content: `Here are your generated photos based on the selected concept:`,
            timestamp: new Date().toISOString(),
            generatedImages: status.images
          };
          
          dispatch({ type: 'ADD_MESSAGE', payload: imageMessage });
          
          toast({ 
            title: "Images Generated!", 
            description: "Your photos are ready to view." 
          });
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          toast({ 
            title: "Generation Failed", 
            description: "Image generation failed. Please try again." 
          });
        }
        // Continue polling if still processing
      } catch (error) {
        clearInterval(pollInterval);
        console.error('Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  }, [toast]);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || sendMessageMutation.isPending) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });

    // Send to Maya
    sendMessageMutation.mutate(content.trim());
  }, [sendMessageMutation]);

  const generateImage = useCallback((cardId: string) => {
    if (!cardId || generateImageMutation.isPending) return;
    generateImageMutation.mutate(cardId);
  }, [generateImageMutation]);

  const selectConceptCard = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_CONCEPT_CARD', payload: id });
  }, []);

  const setActiveTab = useCallback((tab: 'photo' | 'story' | 'maya') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const setHandoffData = useCallback((data: BrandStudioState['handoffData']) => {
    dispatch({ type: 'SET_HANDOFF_DATA', payload: data });
  }, []);

  const clearHandoffData = useCallback(() => {
    dispatch({ type: 'CLEAR_HANDOFF_DATA' });
  }, []);

  const startNewSession = useCallback(() => {
    dispatch({ type: 'CLEAR_CONVERSATION' });
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ type: 'SET_CONVERSATION_ID', payload: newConversationId });
  }, []);

  const contextValue: BrandStudioContextType = {
    ...state,
    sendMessage,
    selectConceptCard,
    generateImage,
    setActiveTab,
    setHandoffData,
    clearHandoffData,
    startNewSession,
    selectedItem: null,
    setSelectedItem: () => {},
    isLoading: isLoading || sendMessageMutation.isPending
  };

  return (
    <BrandStudioContext.Provider value={contextValue}>
      {children}
    </BrandStudioContext.Provider>
  );
}

// Hook for using the context
export function useBrandStudio() {
  const context = useContext(BrandStudioContext);
  if (!context) {
    throw new Error('useBrandStudio must be used within BrandStudioProvider');
  }
  return context;
}