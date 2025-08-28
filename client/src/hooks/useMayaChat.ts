import { useState } from 'react';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

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
        quickButtons: response.quickButtons
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