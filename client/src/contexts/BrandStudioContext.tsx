import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient.js';
import { useAuth } from '../hooks/use-auth.js';
import { useToast } from '../hooks/use-toast.js';
import type { ConceptCard } from '../../../shared/types/concept-card.js';

// Validation Functions

/**
 * Validates concept cards received from the API to ensure they have the required structure
 * @param cards - Raw concept cards data from API response
 * @returns boolean indicating if the data is valid
 */
const validateConceptCards = (cards: any): boolean => {
  // Handle null/undefined
  if (!cards) return true; // No cards is valid (empty response)
  
  // Must be an array
  if (!Array.isArray(cards)) {
    console.error('❌ VALIDATION: Concept cards is not an array:', typeof cards);
    return false;
  }

  // Validate each card structure
  return cards.every((card, index) => {
    // Basic existence check
    if (!card || typeof card !== 'object') {
      console.error(`❌ VALIDATION: Card ${index} is not an object:`, card);
      return false;
    }

    // Required fields with type validation
    const requiredFields = [
      { field: 'title', type: 'string' },
      { field: 'description', type: 'string' }
    ];

    for (const { field, type } of requiredFields) {
      if (!(field in card) || typeof card[field] !== type) {
        console.error(`❌ VALIDATION: Card ${index} missing or invalid ${field}:`, { 
          field, 
          expected: type, 
          actual: typeof card[field],
          card 
        });
        return false;
      }
    }

    // Optional fields with type validation (if present)
    const optionalFields = [
      { field: 'id', type: 'string' },
      { field: 'prompt', type: 'string' },
      { field: 'fluxPrompt', type: 'string' },
      { field: 'shotType', type: 'string' },
      { field: 'creativeLook', type: 'string' }
    ];

    for (const { field, type } of optionalFields) {
      if (field in card && card[field] !== null && card[field] !== undefined && typeof card[field] !== type) {
        console.error(`❌ VALIDATION: Card ${index} has invalid ${field} type:`, { 
          field, 
          expected: type, 
          actual: typeof card[field],
          value: card[field] 
        });
        return false;
      }
    }

    return true;
  });
};

/**
 * Sanitizes and enhances concept cards with default values and proper IDs
 * @param cards - Validated concept cards from API
 * @returns Enhanced concept cards ready for state
 */
const sanitizeConceptCards = (cards: any[]): ConceptCard[] => {
  return cards.map((card, index) => ({
    ...card,
    id: card.id || `concept_${Date.now()}_${index}`,
    canGenerate: true,
    isGenerating: false,
    // Ensure required fields are strings
    title: String(card.title || ''),
    description: String(card.description || ''),
    // Preserve optional fields
    prompt: card.prompt || undefined,
    fluxPrompt: card.fluxPrompt || undefined,
    shotType: card.shotType || undefined,
    creativeLook: card.creativeLook || undefined
  }));
};

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
  isGenerating: boolean;
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
      // Extract concept cards if present and add to conceptCardsById
      const newMessage = action.payload;
      let updatedConceptCardsById = { ...state.conceptCardsById };
      
      if (newMessage.conceptCards && newMessage.conceptCards.length > 0) {
        console.log('🃏 CONCEPT CARDS: Storing', newMessage.conceptCards.length, 'concept cards in state');
        newMessage.conceptCards.forEach(card => {
          console.log('🃏 STORING CARD:', { id: card.id, title: card.title, hasFluxPrompt: !!card.fluxPrompt });
          updatedConceptCardsById[card.id] = card;
        });
      }
      
      return {
        ...state,
        messages: [...state.messages, newMessage],
        conceptCardsById: updatedConceptCardsById,
        pendingMessageIds: state.pendingMessageIds.filter(id => id !== newMessage.id)
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

  // Load conversation history - NOW ENABLED with working endpoint
  const { isLoading, refetch: refetchChatHistory } = useQuery({
    queryKey: ['/api/maya/chat-history', state.conversationId],
    queryFn: async () => {
      const response = await apiRequest('/api/maya/chat-history', 'GET');
      if (response.messages?.length > 0) {
        // FIXED: Set messages atomically instead of appending to prevent duplicates
        dispatch({ type: 'SET_MESSAGES', payload: response.messages });
      }
      return response;
    },
    enabled: !!user && !!state.conversationId, // Enable when user is authenticated and has conversation ID
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

      // Use authenticated apiRequest instead of direct fetch
      return await apiRequest('/api/maya/chat', 'POST', {
        message: messageContent,
        chatHistory: chatHistory,
        context: {
          styling: true,
          conversationId: state.conversationId,
          userIntent: 'creative_direction',
          sessionType: 'brand_studio'
        }
      });
    },
    onSuccess: (data) => {
      // Handle Maya's intelligent response with proper concept card extraction and validation
      console.log('🔍 MAYA CLIENT: Full API response received:', JSON.stringify(data, null, 2));
      console.log('🎯 MAYA CLIENT: Concept cards in response:', data.conceptCards?.length || 0);
      
      if (data.response || data.content || data.message) {
        // Validate concept cards before processing
        const rawConceptCards = data.conceptCards || [];
        let validatedConceptCards: ConceptCard[] = [];
        
        if (validateConceptCards(rawConceptCards)) {
          if (rawConceptCards.length > 0) {
            validatedConceptCards = sanitizeConceptCards(rawConceptCards);
            console.log('✅ MAYA CLIENT: Concept cards validated and sanitized:', validatedConceptCards.length);
          }
        } else {
          console.error('❌ MAYA CLIENT: Concept card validation failed, skipping malformed data');
          toast({ 
            title: "Concept Card Error", 
            description: "Some concept cards couldn't be displayed due to invalid data format."
          });
        }

        const mayaMessage: ChatMessage = {
          id: `maya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'maya',
          content: data.response || data.content || data.message || '',
          timestamp: new Date().toISOString(),
          conceptCards: validatedConceptCards,
          quickButtons: data.quickButtons || []
        };
        
        console.log('📝 MAYA CLIENT: Created message with validated concept cards:', mayaMessage.conceptCards?.length || 0);
        dispatch({ type: 'ADD_MESSAGE', payload: mayaMessage });
        
        // Update concept cards state with validated data
        if (validatedConceptCards.length > 0) {
          console.log('✅ MAYA CLIENT: Updating state with validated concept cards:', validatedConceptCards);
          dispatch({ type: 'UPDATE_CONCEPT_CARDS', payload: validatedConceptCards });
        } else {
          console.log('❌ MAYA CLIENT: No valid concept cards to process');
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

      console.log('🎨 GENERATE: Starting generation for card:', {
        cardId,
        title: conceptCard.title,
        hasPrompt: !!conceptCard.prompt,
        hasFluxPrompt: !!conceptCard.fluxPrompt,
        promptLength: typeof conceptCard.prompt === 'string' ? conceptCard.prompt.length : 0,
        fluxPromptLength: typeof conceptCard.fluxPrompt === 'string' ? conceptCard.fluxPrompt.length : 0,
        fullCard: conceptCard
      });

      const finalPrompt = conceptCard.fluxPrompt || conceptCard.prompt;
      if (!finalPrompt) {
        throw new Error('No prompt available for generation. Concept card missing prompt data.');
      }

      console.log('🎨 GENERATE: Using prompt:', String(finalPrompt).substring(0, 100) + '...');

      // FIXED: Use correct endpoint /api/maya/generate (matches server handler)
      const response = await fetch('/api/maya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conceptCard: {
            id: conceptCard.id,
            title: conceptCard.title,
            description: conceptCard.description,
            fluxPrompt: finalPrompt
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate image');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('🎨 GENERATE SUCCESS:', data);
      
      // ✅ ASYNC APPROACH: Generation started, now poll for completion
      if (data.generationId) {
        toast({ 
          title: "Generation Started!", 
          description: "Your images are being created. This may take 1-2 minutes." 
        });
        
        // Start polling for completion
        pollForGenerationCompletion(data.generationId);
      } else {
        console.log('⚠️ No generation ID in response:', data);
        toast({ 
          title: "Generation Issue", 
          description: "Failed to start generation. Please try again." 
        });
      }
    },
    onError: (error) => {
      console.error('❌ GENERATE ERROR:', error);
      
      // Clear the selected concept card on error
      dispatch({ type: 'SELECT_CONCEPT_CARD', payload: null });
      
      toast({ 
        title: "Generation Error", 
        description: error.message || "Failed to generate image. Please try again." 
      });
    }
  });



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

  // Polling function for async generation completion
  const pollForGenerationCompletion = useCallback(async (jobId: string) => {
    const maxPolls = 40; // 40 polls * 3 seconds = 2 minutes max
    const pollInterval = 3000; // 3 seconds
    let pollCount = 0;
    
    console.log(`🔄 CLIENT POLLING: Starting for job ${jobId}`);
    
    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/maya/status?predictionId=${jobId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to check generation status');
        }
        
        const data = await response.json();
        console.log(`🔄 CLIENT POLLING: Status ${data.status} for ${jobId}`);
        
        if (data.status === 'completed') {
          // 🎯 FIXED: Generation complete - refresh chat history to get preview service messages
          console.log(`✅ CLIENT POLLING: Generation completed, refreshing chat history`);
          
          // Refresh chat history to pick up messages from Maya Chat Preview Service
          try {
            await refetchChatHistory();
            
            toast({ 
              title: "Images Ready!", 
              description: "Your photos have been generated successfully." 
            });
          } catch (refreshError) {
            console.error('❌ CLIENT POLLING: Failed to refresh chat history:', refreshError);
            
            // FALLBACK: If refresh fails, create message with images from status
            if (data.images && data.images.length > 0) {
              const imageMessage: ChatMessage = {
                id: `images_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'maya',
                content: `🎬 **YOUR IMAGES ARE READY!**\n\nHere are your stunning photos! Click the heart ♡ on any image you love to save it to your gallery.`,
                timestamp: new Date().toISOString(),
                generatedImages: data.images
              };
              
              dispatch({ type: 'ADD_MESSAGE', payload: imageMessage });
            }
          }
          
          return; // Stop polling
        }
        
        // Continue polling if not complete
        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(poll, pollInterval);
        } else {
          console.warn(`⏰ CLIENT POLLING: Timeout for job ${jobId}`);
          toast({
            title: "Generation Timeout",
            description: "Image generation is taking longer than expected. Please try again."
          });
        }
        
      } catch (error) {
        console.error(`❌ CLIENT POLLING: Error for job ${jobId}:`, error);
        toast({
          title: "Generation Error",
          description: "Failed to check generation status. Please try again."
        });
      }
    };
    
    // Start polling
    setTimeout(poll, pollInterval);
  }, [dispatch, toast]);

  const generateImage = useCallback((cardId: string) => {
    console.log('🎨 GENERATE IMAGE CALLED:', { 
      cardId, 
      isPending: generateImageMutation.isPending,
      hasCard: !!state.conceptCardsById[cardId] 
    });
    
    if (!cardId || generateImageMutation.isPending) return;
    generateImageMutation.mutate(cardId);
  }, [generateImageMutation, state.conceptCardsById]);

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
    isLoading: isLoading || sendMessageMutation.isPending,
    isGenerating: generateImageMutation.isPending
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