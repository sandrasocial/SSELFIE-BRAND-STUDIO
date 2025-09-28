import { useState } from 'react';
import { useToast } from './use-toast.js';
import { useAuth } from './use-auth.js';
import { apiRequest } from '../lib/queryClient.js';
import type { MayaChatMessage, ConceptCard, MayaAPIResponse, MayaAPIError } from '../types/maya.js';

export const useMayaChat = () => {
  const [messages, setMessages] = useState<MayaChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Enhanced sendMessage function with better error handling and type safety
  const sendMessage = async (messageText: string): Promise<void> => {
    if (!messageText.trim() || isTyping) return;

    // Check authentication first
    if (!isAuthenticated || !user) {
      const authError = 'Please sign in to chat with Maya';
      setError(authError);
      toast({
        title: 'Authentication Required',
        description: authError,
      });
      return;
    }

    // Clear any previous errors
    setError(null);

    // Add user message to UI with proper typing
    const userMessage: MayaChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      console.log('🎨 Sending message to Maya:', messageText);
      
      // Build conversation history for context (last 8 messages to avoid token limits)
      const conversationHistory = messages
        .slice(-8)
        .map(msg => ({
          role: msg.role === 'maya' ? 'assistant' : 'user',
          content: msg.content
        }));

      // Call the Maya API with proper typing
      const response = await apiRequest('/api/maya/chat', 'POST', {
        message: messageText.trim(),
        context: 'styling',
        conversationHistory: conversationHistory
      }) as MayaAPIResponse;

      console.log('✅ Maya API response:', response);

      // Validate response structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from Maya API');
      }

      // Add Maya's response to the chat with proper typing
      const mayaMessage: MayaChatMessage = {
        id: `maya_${Date.now()}`,
        role: 'maya',
        content: response.response || response.reply || 'I received your message!',
        timestamp: new Date().toISOString(),
        conceptCards: Array.isArray(response.conceptCards) ? response.conceptCards : []
      };

      setMessages(prev => [...prev, mayaMessage]);

    } catch (error: unknown) {
      console.error('❌ Maya chat error:', error);
      
      // Enhanced error handling with proper typing
      let errorMsg = 'Failed to connect to Maya';
      let errorCode: string | undefined;
      
      if (error instanceof Error) {
        const mayaError = error as MayaAPIError;
        errorCode = mayaError.code;
        
        if (mayaError.message?.includes('502') || mayaError.status === 502) {
          errorMsg = 'Maya service is temporarily unavailable. Please try again in a moment.';
          errorCode = 'SERVICE_UNAVAILABLE';
        } else if (mayaError.message?.includes('401') || mayaError.status === 401) {
          errorMsg = 'Authentication expired. Please sign in again.';
          errorCode = 'AUTH_EXPIRED';
        } else if (mayaError.message?.includes('500') || mayaError.status === 500) {
          errorMsg = 'Maya encountered an internal error. Please try again.';
          errorCode = 'INTERNAL_ERROR';
        } else if (mayaError.message?.includes('timeout')) {
          errorMsg = 'Request timed out. Maya might be busy - please try again.';
          errorCode = 'TIMEOUT';
        } else if (mayaError.message) {
          errorMsg = mayaError.message;
        }
      }
      
      setError(errorMsg);

      // Show user-friendly error message in chat
      const mayaErrorMessage: MayaChatMessage = {
        id: `maya_error_${Date.now()}`,
        role: 'maya',
        content: "I'm having a little trouble connecting right now, but I'm still here with you! Could you try sharing that again? I'm so excited to help you on your journey.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, mayaErrorMessage]);

      // Show toast for critical errors
      if (errorCode === 'AUTH_EXPIRED') {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in again to continue chatting with Maya.',
        });
      } else if (errorCode === 'SERVICE_UNAVAILABLE') {
        toast({
          title: 'Service Temporarily Unavailable',
          description: 'Maya is experiencing high demand. Please try again in a moment.',
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    isTyping,
    error,
    sendMessage
  };
};
