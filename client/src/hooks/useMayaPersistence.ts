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

// 🔗 ENHANCED MEMORY: User-specific conversation storage
const getMayaConversationKey = (userId?: string) => 
  userId ? `maya_conversation_${userId}` : 'maya_conversation_temp';
const MAX_MESSAGES = 30; // 🧠 MEMORY ENHANCED: Keep 30 messages for better context continuity
const CONVERSATION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useMayaPersistence = (userId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // 🔗 ENHANCED SESSION CONTINUITY: Use userId-based session for persistence across browser sessions
  const [sessionId] = useState(() => userId ? `maya_session_${userId}` : `temp_session_${Date.now()}`);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  // 🧠 ENHANCED MEMORY LOADING: Multi-layered fallback system
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadConversationWithFallback = async () => {
      try {
        const conversationKey = getMayaConversationKey(userId);
        let loadedMessages: ChatMessage[] = [];
        let dataSource = 'none';

        // LAYER 1: Try localStorage first
        try {
          const stored = localStorage.getItem(conversationKey);
          if (stored) {
            const persistedData: PersistedConversation = JSON.parse(stored);
            
            // Check if conversation is still valid (within TTL and same user)
            const isValid = persistedData.userId === userId && 
                            (Date.now() - persistedData.lastUpdated) < CONVERSATION_TTL;
            
            if (isValid && persistedData.messages.length > 0) {
              loadedMessages = persistedData.messages.slice(-MAX_MESSAGES);
              setLastSyncTime(persistedData.lastUpdated);
              dataSource = 'localStorage';
              console.log(`💾 MEMORY: Loaded ${loadedMessages.length} messages from localStorage`);
              console.log(`📊 CONTEXT: ${persistedData.conversationContext.conceptCardsGenerated} concept cards, ${persistedData.conversationContext.imagesGenerated} images`);
            } else {
              console.log('🔄 MEMORY: localStorage expired or invalid, trying database fallback...');
              localStorage.removeItem(conversationKey);
            }
          }
        } catch (localStorageError) {
          console.warn('⚠️ MEMORY: localStorage corrupted, trying database fallback...', localStorageError);
          const conversationKey = getMayaConversationKey(userId);
          localStorage.removeItem(conversationKey);
        }

        // LAYER 2: Database fallback if localStorage failed/expired
        if (loadedMessages.length === 0) {
          try {
            console.log('🔍 MEMORY: Attempting database fallback for conversation history...');
            const response = await fetch('/api/maya/chat-history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ userId, limit: MAX_MESSAGES })
            });
            
            if (response.ok) {
              const chatHistory = await response.json();
              if (chatHistory.success && chatHistory.messages?.length > 0) {
                // Transform database messages to frontend format
                loadedMessages = chatHistory.messages.map((msg: any) => ({
                  id: msg.id || `db_${Date.now()}_${Math.random()}`,
                  role: msg.role === 'assistant' ? 'maya' : msg.role,
                  content: msg.content,
                  timestamp: new Date(msg.createdAt).toISOString(),
                  conceptCards: msg.conceptCards || [],
                  canGenerate: msg.canGenerate || false
                }));
                dataSource = 'database';
                console.log(`🗄️ MEMORY RECOVERY: Loaded ${loadedMessages.length} messages from database`);
                
                // Restore to localStorage for future sessions
                const recoveryData: PersistedConversation = {
                  messages: loadedMessages,
                  lastUpdated: Date.now(),
                  userId,
                  sessionId: `maya_session_${userId}`,
                  conversationContext: {
                    totalMessages: loadedMessages.length,
                    lastActivity: Date.now(),
                    conceptCardsGenerated: loadedMessages.reduce((total, msg) => 
                      total + (msg.conceptCards?.length || 0), 0),
                    imagesGenerated: 0
                  }
                };
                localStorage.setItem(conversationKey, JSON.stringify(recoveryData));
                console.log('💾 MEMORY RECOVERY: Restored conversation to localStorage');
              }
            }
          } catch (databaseError) {
            console.warn('⚠️ MEMORY: Database fallback failed, starting fresh conversation', databaseError);
          }
        }

        // Set loaded messages and log final state
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
          console.log(`✅ MEMORY: Successfully loaded ${loadedMessages.length} messages from ${dataSource}`);
        } else {
          console.log('🆕 MEMORY: No existing conversation found, starting fresh');
        }

      } catch (error) {
        console.error('❌ MEMORY: Critical error in conversation loading:', error);
        // Clean slate on critical error
        const conversationKey = getMayaConversationKey(userId);
        localStorage.removeItem(conversationKey);
      }
      
      setIsLoading(false);
    };

    loadConversationWithFallback();
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

      const conversationKey = getMayaConversationKey(userId);
      localStorage.setItem(conversationKey, JSON.stringify(persistedData));
      setLastSyncTime(Date.now());
      
      console.log(`💾 MEMORY: Saved ${updatedMessages.length} messages for user ${userId}`);
      console.log(`📊 CONTINUITY: ${conceptCardsGenerated} concept cards, ${imagesGenerated} images across sessions`);
    } catch (error) {
      console.error('❌ MEMORY: Failed to save conversation:', error);
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