import { useState, useEffect } from 'react';

import { BaseChatMessage } from './unified-chat.js';

export interface ChatMessage extends BaseChatMessage {
  role: 'user' | 'maya'; // Role can be either user or maya
  context: string | null;
}

export function useMayaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (content: string, context?: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      context: context || null
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Get Maya's response
    const response = await getContextualResponse(content, context);
    
    setTimeout(() => {
      const mayaMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'maya',
        timestamp: new Date(),
        context: context || null
      };
      
      setMessages(prev => [...prev, mayaMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return {
    messages,
    sendMessage,
    isTyping,
    clearMessages: () => setMessages([])
  };
}

async function getContextualResponse(input: string, context?: string): Promise<string> {
  // Enhanced Sandra voice responses with context awareness
  const contextResponses = getContextualSandraResponses(input, context);
  if (!contextResponses || !contextResponses.length) {
    return "I understand. Please tell me more.";
  }
  const index = Math.floor(Math.random() * contextResponses.length);
  return contextResponses[index] ?? "I understand. Please tell me more.";
}

function getContextualSandraResponses(input: string, context?: string): string[] {
  const lowerInput = input.toLowerCase();
  
  // Context-aware responses
  if (context === 'visual-editor') {
    return [
      "YES! The visual editor is literally game-changing. I remember when I had to figure out Canva and it felt so overwhelming. This makes creating content that looks expensive so much simpler. What kind of content are you wanting to create?",
      "The visual editor is your secret weapon for looking professional without the professional price tag. I've used every tool out there and this one just gets it right. What's your biggest visual challenge right now?"
    ];
  }

  if (context === 'content-planning') {
    return [
      "Content planning changed my LIFE. Going from posting randomly to having a strategic plan? That's when everything clicked. Your audience can feel when you're intentional vs. just throwing stuff at the wall.",
      "Planning doesn't have to be complicated. I plan my content around my real life - my struggles, wins, lessons learned. That authenticity combined with strategy? That's the magic formula right there."
    ];
  }

  // Return to general Sandra responses if no context match
  return getSandraResponses(input);
}

// Import the previous getSandraResponses function here
function getSandraResponses(input: string): string[] {
  // ... (same as above)
  return [
    "Tell me more about what you're working on. I want to help you figure this out.",
    "You're asking the right questions. Let's dig deeper into what you need.",
    "Your phone + my strategy = your empire. What's holding you back?"
  ];
}