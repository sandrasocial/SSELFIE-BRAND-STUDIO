import { useState } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '../lib/queryClient';

interface ConceptCard {
  id: string;
  title: string;
  description: string;  
  emoji?: string;
  creativeLook?: string;
  fluxPrompt?: string;
  type?: 'portrait' | 'flatlay' | 'lifestyle';
}

interface MayaChatMessage {
  id?: number;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
}

export const useMayaChat = () => {
  const [messages, setMessages] = useState<MayaChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Simplified sendMessage function that just takes the message text
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isTyping) return;

    // Clear any previous errors
    setError(null);

    // Add user message to UI
    const userMessage: MayaChatMessage = {
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

      // Call the Maya API
      const response = await apiRequest('/api/maya/chat', 'POST', {
        message: messageText.trim(),
        context: 'styling',
        conversationHistory: conversationHistory
      });

      console.log('✅ Maya API response:', response);

      // Add Maya's response to the chat
      const mayaMessage: MayaChatMessage = {
        role: 'maya',
        content: response.response || response.reply || 'I received your message!',
        timestamp: new Date().toISOString(),
        conceptCards: response.conceptCards || []
      };

      setMessages(prev => [...prev, mayaMessage]);

    } catch (error: any) {
      console.error('❌ Maya chat error:', error);
      setError(error.message || 'Failed to connect to Maya');
      
      const errorMessage: MayaChatMessage = {
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
    isTyping,
    error,
    sendMessage
  };
};
