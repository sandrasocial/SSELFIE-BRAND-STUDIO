import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';

interface MayaInterfaceProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  isStreaming?: boolean;
}

interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt?: string;
  category?: string;
  imageUrl?: string;
}

export function MayaInterface({ onClose }: MayaInterfaceProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Load Maya conversation history
  const { data: conversationData } = useQuery({
    queryKey: ['/api/maya/conversation'],
    enabled: true
  });

  useEffect(() => {
    if (conversationData && (conversationData as any).messages) {
      setMessages((conversationData as any).messages);
    }
  }, [conversationData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to Maya
  const sendMessage = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageContent })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Add Maya's response
      const mayaMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'maya',
        content: data.response || '',
        timestamp: new Date().toISOString(),
        conceptCards: data.conceptCards || []
      };

      setMessages(prev => [...prev, mayaMessage]);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user', 
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Send to Maya
    sendMessage.mutate(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    "Help me create business headshots",
    "I need lifestyle content for Instagram", 
    "Create professional photos for LinkedIn",
    "Show me editorial styling options",
    "Design travel content concepts"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="px-20 py-16 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50 flex justify-between items-start">
        <div className="flex-1">
          <h1 className="font-serif text-[2.5rem] font-extralight uppercase tracking-[0.2em] text-black mb-4">
            MAYA
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-lg font-light">
            Your AI styling intelligence. Let's create concept cards for your next photo session with personalized FLUX prompts.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xl text-gray-500 hover:text-black transition-all duration-300 hover:rotate-90 p-2 rounded-full hover:bg-gray-100"
        >
          ×
        </button>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 p-10">
          <div className="space-y-12">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.6em] text-gray-500 mb-6">
                Quick Start
              </h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(action)}
                    className="block w-full text-left text-sm text-gray-700 hover:text-black transition-all duration-300 hover:translate-x-1 py-2 border-b border-gray-200 hover:border-gray-400 font-light leading-relaxed"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.6em] text-gray-500 mb-6">
                Style Categories
              </h3>
              <div className="space-y-3">
                {['Business', 'Professional', 'Lifestyle', 'Instagram', 'Travel', 'Fashion'].map((category, index) => (
                  <div key={index} className="text-sm text-gray-600 py-2 font-light">
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-20 space-y-12">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <div className="font-serif text-3xl font-light text-gray-400 mb-6">
                  Ready to create something beautiful?
                </div>
                <p className="text-gray-500 max-w-md mx-auto font-light leading-relaxed">
                  Tell me about the type of photos you'd like to create, and I'll design personalized concept cards for you.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${
                  msg.type === 'user' 
                    ? 'bg-black text-white p-6 ml-8' 
                    : 'bg-white text-black border border-gray-100 p-6 mr-8'
                }`}>
                  {msg.type === 'maya' && (
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-4">
                      Maya
                    </div>
                  )}
                  
                  <div className="text-sm leading-relaxed font-light whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {/* Concept Cards */}
                  {msg.conceptCards && msg.conceptCards.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500">
                        Concept Cards
                      </div>
                      {msg.conceptCards.map((card) => (
                        <div key={card.id} className="border border-gray-200 p-4 bg-gray-50">
                          <div className="font-medium text-sm mb-2">{card.title}</div>
                          <div className="text-xs text-gray-600 mb-3 leading-relaxed">
                            {card.description}
                          </div>
                          {card.fluxPrompt && (
                            <div className="text-xs text-gray-500 bg-white p-3 border border-gray-200 font-mono">
                              FLUX: {card.fluxPrompt}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-6 mr-8 max-w-[70%]">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-4">
                    Maya
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-20 bg-gradient-to-t from-gray-50 to-transparent border-t border-gray-100">
            <div className="flex gap-6 items-end max-w-4xl">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell Maya about the photos you'd like to create..."
                className="flex-1 border border-gray-200 p-6 text-sm resize-none bg-white font-light leading-relaxed transition-all duration-300 focus:outline-none focus:border-black focus:shadow-lg focus:-translate-y-1"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="bg-black text-white px-8 py-6 text-xs font-semibold uppercase tracking-[0.5em] transition-all duration-300 hover:bg-gray-800 hover:-translate-y-1 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}