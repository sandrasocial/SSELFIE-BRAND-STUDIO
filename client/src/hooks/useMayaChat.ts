import { useState } from 'react';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

// PHASE 7: Frontend Performance Tracking
const trackUserEvent = (event: string, data: any = {}) => {
  console.log(`USER_EVENT_${event}`, {
    ...data,
    timestamp: Date.now(),
    url: window.location.pathname
  });
};

const trackInteractionTiming = (event: string, startTime: number, success: boolean) => {
  console.log(`USER_INTERACTION_TIMING`, {
    event,
    duration: Date.now() - startTime,
    success,
    timestamp: Date.now()
  });
};

interface ChatMessage {
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
}

export const useMayaChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
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
      context: isOnboardingMode ? 'onboarding' : isQuickStartMode ? 'quickstart' : 'regular',
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

    try {
      // SINGLE MAYA ENDPOINT for all interactions
      const context = isOnboardingMode ? 'onboarding' : isQuickStartMode ? 'quickstart' : 'regular';
      const response = await apiRequest('/api/maya/chat', 'POST', {
        message: messageToSend,
        context: context,
        chatId: currentChatId
      });

      // Handle unified response
      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: response.message,
        timestamp: new Date().toISOString(),
        canGenerate: response.canGenerate,
        generatedPrompt: response.generatedPrompt,
        quickButtons: response.quickButtons,
        conceptCards: response.conceptCards
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
        context: isOnboardingMode ? 'onboarding' : isQuickStartMode ? 'quickstart' : 'regular'
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
    loadChatHistory
  };
};