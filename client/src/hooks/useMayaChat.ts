import { useState } from 'react';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

// PHASE 7: Frontend Performance Tracking - Production optimized
const trackUserEvent = (event: string, data: any = {}) => {
  // Only track critical user events in production
  if (event === 'CHAT_ERROR' || event === 'GENERATION_ERROR') {
    console.log(`USER_EVENT_${event}`, {
      ...data,
      timestamp: Date.now(),
      url: window.location.pathname
    });
  }
};

const trackInteractionTiming = (event: string, startTime: number, success: boolean) => {
  // Only track timing for critical interactions
  if (!success || Date.now() - startTime > 5000) {
    console.log(`USER_INTERACTION_TIMING`, {
      event,
      duration: Date.now() - startTime,
      success,
      timestamp: Date.now()
    });
  }
};

interface ConceptCard {
  id: string;
  title: string;
  description: string;  
  canGenerate: boolean;
  isGenerating: boolean;
  generatedImages?: string[];
  isLoading?: boolean;
  hasGenerated?: boolean;
}

// Maya-specific message interface reflecting her professional expertise
interface MayaChatMessage {
  id?: number;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  canGenerate?: boolean;
  generatedPrompt?: string;
  quickButtons?: string[];
  questions?: string[];
  stepGuidance?: string;
  isOnboarding?: boolean;
  generationId?: string;
  conceptCards?: ConceptCard[];
  mayaPersonality?: {
    isWarmEncouraging?: boolean;
    isStylingExpert?: boolean;
    usesPersonalBrandContext?: boolean;
    includesSandrasExpertise?: boolean;
  };
}

export const useMayaChat = () => {
  const [messages, setMessages] = useState<MayaChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  // STEP 4.2: Add retry logic with exponential backoff
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connected');
  const maxRetries = 3;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadChatHistory = async (chatId: number) => {
    try {
      const response = await apiRequest(`/api/maya-chats/${chatId}/messages`);
      if (response && Array.isArray(response)) {
        setMessages(response);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history"
      });
    }
  };

  const sendMessage = async (
    messageContent: string, 
    input: string, 
    setInput: (value: string) => void,
    isOnboardingMode: boolean,
    isQuickStartMode: boolean,
    setOnboardingStatus: (status: any) => void,
    setIsOnboardingMode: (mode: boolean) => void
  ) => {
    const messageToSend = messageContent || input.trim();
    if (!messageToSend || isTyping) return;

    // PHASE 7: Track user chat interaction
    const chatStartTime = Date.now();
    trackUserEvent('CHAT_MESSAGE_SENT', {
      messageLength: messageToSend.length,
      context: isOnboardingMode ? 'onboarding' : isQuickStartMode ? 'quickstart' : 'styling',
      isOnboarding: isOnboardingMode,
      isQuickStart: isQuickStartMode
    });

    // Add user message to UI
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // STEP 4.2: Enhanced API call with retry logic and connection monitoring
    const attemptApiCall = async (attempt: number = 0): Promise<any> => {
      try {
        setConnectionStatus(attempt > 0 ? 'connecting' : 'connected');
        
        // SINGLE MAYA ENDPOINT for all interactions with conversation history
        const context = isOnboardingMode ? 'onboarding' : isQuickStartMode ? 'quickstart' : 'styling';
        
        // Build conversation history for context (last 8 messages to avoid token limits)
        const conversationHistory = messages
          .slice(-8)
          .map(msg => ({
            role: msg.role === 'maya' ? 'assistant' : 'user',
            content: msg.content
          }));
        
        console.log(`🔄 STEP 4.2: API attempt ${attempt + 1}/${maxRetries + 1}`);
        
        const response = await apiRequest('/api/maya/chat', 'POST', {
          message: messageToSend,
          context: context,
          chatId: currentChatId,
          conversationHistory: conversationHistory
        });
        
        // Success - reset retry count and connection status
        setRetryCount(0);
        setConnectionStatus('connected');
        console.log('✅ STEP 4.2: API call successful');
        return response;
        
      } catch (error: any) {
        console.error(`❌ STEP 4.2: API attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries) {
          // Exponential backoff: wait 2^attempt seconds
          const backoffDelay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ STEP 4.2: Retrying in ${backoffDelay}ms (attempt ${attempt + 2})`);
          
          setConnectionStatus('connecting');
          setRetryCount(attempt + 1);
          
          // Wait and retry
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return attemptApiCall(attempt + 1);
        } else {
          // All retries exhausted
          setConnectionStatus('error');
          setRetryCount(0);
          throw error;
        }
      }
    };

    try {
      const response = await attemptApiCall();

      // Handle unified response
      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: response.message,
        timestamp: new Date().toISOString(),
        canGenerate: response.canGenerate,
        generatedPrompt: response.generatedPrompt,
        quickButtons: response.quickButtons,
        conceptCards: response.conceptCards || [] // Ensure conceptCards are included
      };

      setMessages(prev => [...prev, mayaMessage]);

      // Update UI state based on response
      if (response.mode === 'onboarding' && response.onboardingProgress) {
        setOnboardingStatus(response.onboardingProgress);
        
        // Check if onboarding is complete
        if (response.onboardingProgress.isComplete) {
          setTimeout(() => {
            setIsOnboardingMode(false);
            setOnboardingStatus((prev: any) => ({ ...prev!, isCompleted: true }));
          }, 2000);
        }
      }

      if (response.chatId && !currentChatId) {
        setCurrentChatId(response.chatId);
        window.history.replaceState({}, '', `/maya?chat=${response.chatId}`);
      }

      // Invalidate chat list to refresh with new/updated chat
      queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });

    } catch (error: any) {
      console.error('Maya chat error:', error);
      
      // PHASE 7: Track chat error
      trackInteractionTiming('CHAT_RESPONSE', chatStartTime, false);
      trackUserEvent('CHAT_ERROR', {
        error: error.message || 'Unknown error',
        context: isOnboardingMode ? 'onboarding' : isQuickStartMode ? 'quickstart' : 'styling'
      });
      
      const errorMessage: ChatMessage = {
        role: 'maya',
        content: "I'm having a little trouble connecting right now, but I'm still here with you! Could you try sharing that again? I'm so excited to help you on your journey.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    currentChatId,
    setCurrentChatId,
    sendMessage,
    loadChatHistory,
    // STEP 4.2: Expose connection monitoring for UI feedback
    connectionStatus,
    retryCount
  };
};