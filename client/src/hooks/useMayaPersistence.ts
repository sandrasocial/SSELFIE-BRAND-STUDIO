import { useState, useEffect, useCallback } from 'react';

// PHASE 2.1: Enhanced Frontend Persistence
// Comprehensive localStorage system for Maya conversations with concept cards and image previews

interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt?: string;
  fullPrompt?: string;
  category?: string;
  imageUrl?: string;
  generatedImages?: string[];
  isGenerating?: boolean;
  isLoading?: boolean;
  hasGenerated?: boolean;
  originalContext?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  isStreaming?: boolean;
  imagePreview?: string[];
  quickButtons?: string[];
  generationId?: string;
  canGenerate?: boolean;
  generatedPrompt?: string;
}

interface PersistedConversation {
  messages: ChatMessage[];
  lastUpdated: number;
  userId: string;
  sessionId: string;
  conversationContext: {
    totalMessages: number;
    lastActivity: number;
    conceptCardsGenerated: number;
    imagesGenerated: number;
  };
}

const MAYA_CONVERSATION_KEY = 'maya_conversation';
const MAX_MESSAGES = 30; // 🧠 MEMORY ENHANCED: Keep 30 messages for better context continuity
const CONVERSATION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useMayaPersistence = (userId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  // PHASE 2.1: Load persisted conversation on mount
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(MAYA_CONVERSATION_KEY);
      if (stored) {
        const persistedData: PersistedConversation = JSON.parse(stored);
        
        // Check if conversation is still valid (within TTL and same user)
        const isValid = persistedData.userId === userId && 
                        (Date.now() - persistedData.lastUpdated) < CONVERSATION_TTL;
        
        if (isValid && persistedData.messages.length > 0) {
          console.log(`🔄 PHASE 2.1: Loaded ${persistedData.messages.length} messages from localStorage`);
          console.log(`📊 Context: ${persistedData.conversationContext.conceptCardsGenerated} concept cards, ${persistedData.conversationContext.imagesGenerated} images`);
          
          setMessages(persistedData.messages.slice(-MAX_MESSAGES)); // Keep only last 20
          setLastSyncTime(persistedData.lastUpdated);
        } else {
          console.log('🔄 PHASE 2.1: Clearing expired or invalid conversation data');
          localStorage.removeItem(MAYA_CONVERSATION_KEY);
        }
      }
    } catch (error) {
      console.error('❌ PHASE 2.1: Failed to load persisted conversation:', error);
      localStorage.removeItem(MAYA_CONVERSATION_KEY);
    }
    
    setIsLoading(false);
  }, [userId]);

  // PHASE 2.1: Save conversation to localStorage
  const saveConversation = useCallback((updatedMessages: ChatMessage[]) => {
    if (!userId || updatedMessages.length === 0) return;

    try {
      // Calculate conversation statistics
      const conceptCardsGenerated = updatedMessages.reduce((total, msg) => 
        total + (msg.conceptCards?.length || 0), 0);
      
      const imagesGenerated = updatedMessages.reduce((total, msg) => 
        total + (msg.conceptCards?.reduce((cardTotal, card) => 
          cardTotal + (card.generatedImages?.length || 0), 0) || 0), 0);

      const persistedData: PersistedConversation = {
        messages: updatedMessages.slice(-MAX_MESSAGES), // Keep last 30 messages for extended context
        lastUpdated: Date.now(),
        userId,
        sessionId,
        conversationContext: {
          totalMessages: updatedMessages.length,
          lastActivity: Date.now(),
          conceptCardsGenerated,
          imagesGenerated
        }
      };

      localStorage.setItem(MAYA_CONVERSATION_KEY, JSON.stringify(persistedData));
      setLastSyncTime(Date.now());
      
      console.log(`💾 PHASE 2.1: Saved ${updatedMessages.length} messages to localStorage`);
      console.log(`📊 Stats: ${conceptCardsGenerated} concept cards, ${imagesGenerated} images`);
    } catch (error) {
      console.error('❌ PHASE 2.1: Failed to save conversation:', error);
    }
  }, [userId, sessionId]);

  // PHASE 2.1: Enhanced setMessages with automatic persistence
  const updateMessages = useCallback((updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessages(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      
      // Automatically save to localStorage
      saveConversation(updated);
      
      return updated;
    });
  }, [saveConversation]);

  // PHASE 2.1: Add new message with persistence
  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    updateMessages(prev => [...prev, newMessage]);
  }, [updateMessages]);

  // PHASE 2.1: Update specific message (for streaming, concept cards, etc.)
  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    updateMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, [updateMessages]);

  // PHASE 2.1: Update concept card within a message
  const updateConceptCard = useCallback((messageId: string, conceptCardId: string, updates: Partial<ConceptCard>) => {
    updateMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId && msg.conceptCards) {
          return {
            ...msg,
            conceptCards: msg.conceptCards.map(card =>
              card.id === conceptCardId ? { ...card, ...updates } : card
            )
          };
        }
        return msg;
      })
    );
  }, [updateMessages]);

  // PHASE 2.1: Clear conversation (for new session)
  const clearConversation = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(MAYA_CONVERSATION_KEY);
    console.log('🧹 PHASE 2.1: Conversation cleared');
  }, []);

  // PHASE 2.1: Get conversation statistics
  const getConversationStats = useCallback(() => {
    const conceptCards = messages.reduce((total, msg) => total + (msg.conceptCards?.length || 0), 0);
    const images = messages.reduce((total, msg) => 
      total + (msg.conceptCards?.reduce((cardTotal, card) => 
        cardTotal + (card.generatedImages?.length || 0), 0) || 0), 0);

    return {
      totalMessages: messages.length,
      conceptCards,
      images,
      lastActivity: lastSyncTime,
      sessionId
    };
  }, [messages, lastSyncTime, sessionId]);

  // PHASE 2.1: Force sync with database (for Phase 2.2)
  const syncWithDatabase = useCallback(async () => {
    // Placeholder for Phase 2.2: Database sync implementation
    console.log('🔄 PHASE 2.2: Database sync - to be implemented');
  }, []);

  return {
    // State
    messages,
    isLoading,
    sessionId,
    lastSyncTime,
    
    // Actions
    setMessages: updateMessages,
    addMessage,
    updateMessage,
    updateConceptCard,
    clearConversation,
    
    // Utilities
    getConversationStats,
    syncWithDatabase,
    
    // Direct access for compatibility
    rawMessages: messages,
    rawSetMessages: setMessages
  };
};