import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';

// Types
interface ConceptCard {
  id: string; // Server-generated ULID
  title: string;
  description: string; // Made required to match UI usage
  fullPrompt?: string;
  fluxPrompt?: string; // Embedded FLUX-optimized prompt from Maya
  emoji?: string; // Maya's styling emoji (🎯✨💼🌟💫🏆📸🎬)
  creativeLook?: string; // One of Maya's 12 Creative Looks
  creativeLookDescription?: string; // Brief description of the Creative Look
  generatedImages?: string[];
  isGenerating: boolean;
  hasGenerated: boolean;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  quickButtons?: string[];
}

interface BrandStudioState {
  conversationId: string | null;
  messages: ChatMessage[];
  conceptCardsById: Record<string, ConceptCard>;
  selectedConceptCardId: string | null;
  isTyping: boolean;
  pendingMessageIds: string[];
  activeTab: 'photo' | 'story';
  handoffData: {
    conceptCard?: ConceptCard;
    fromPhoto?: boolean;
  } | null;
}

interface BrandStudioContextType extends BrandStudioState {
  // Actions
  sendMessage: (content: string) => void;
  selectConceptCard: (id: string | null) => void;
  setActiveTab: (tab: 'photo' | 'story') => void;
  setHandoffData: (data: any) => void;
  clearHandoffData: () => void;
  startNewSession: () => void;
  // Additional properties
  selectedItem: any;
  setSelectedItem: (item: any) => void;
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
  | { type: 'SET_ACTIVE_TAB'; payload: 'photo' | 'story' }
  | { type: 'SET_HANDOFF_DATA'; payload: any }
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

  // Send message mutation (with duplicate prevention)
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: messageContent,
          context: 'styling',
          conversationId: state.conversationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Add Maya's response
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
        
        // Update concept cards
        if (data.conceptCards?.length > 0) {
          dispatch({ type: 'UPDATE_CONCEPT_CARDS', payload: data.conceptCards });
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

  // Actions (with duplicate prevention)
  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || state.isTyping || sendMessageMutation.isPending) return;

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
  }, [state.isTyping, sendMessageMutation]);

  const selectConceptCard = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_CONCEPT_CARD', payload: id });
  }, []);

  const setActiveTab = useCallback((tab: 'photo' | 'story') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const setHandoffData = useCallback((data: any) => {
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