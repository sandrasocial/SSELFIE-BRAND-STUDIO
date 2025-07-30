import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  type: 'user' | 'victoria';
  content: string;
  timestamp: Date;
}

interface VictoriaChatProps {
  onWebsiteGenerated: (website: any) => void;
}

export function VictoriaChat({ onWebsiteGenerated }: VictoriaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'victoria',
      content: "Hello! I'm Victoria, your personal website designer. I'll help you create a beautiful, professional website for your business. Let's start by telling me about your business - what do you do and who do you help?",
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send message to Victoria via member agent endpoint
      const response = await apiRequest('/api/victoria-website-chat', 'POST', {
        message: inputValue,
        conversationHistory: messages.slice(-5) // Last 5 messages for context
      });

      const victoriaMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'victoria',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, victoriaMessage]);

      // Check if Victoria generated a website
      if (response.website) {
        onWebsiteGenerated(response.website);
      }

    } catch (error) {
      console.error('Victoria chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'victoria',
        content: "I'm sorry, I'm having trouble connecting right now. Could you please try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
          Chat with Victoria
        </h1>
        <p className="text-gray-600">
          Describe your business vision and I'll create your website through our conversation.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.type === 'victoria' && (
                  <div className="text-xs text-gray-600 mb-1 font-medium">Victoria</div>
                )}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-lg max-w-xs">
                <div className="text-xs text-gray-600 mb-1 font-medium">Victoria</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your business, target audience, or any questions..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-black text-white hover:bg-gray-800 px-6"
            >
              Send
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send your message to Victoria
          </p>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        Victoria will analyze your business requirements and generate a complete website during our conversation
      </div>
    </div>
  );
}