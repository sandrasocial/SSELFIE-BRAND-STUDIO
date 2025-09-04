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
      {/* Editorial Hero Header - Magazine Style */}
      <div className="hero relative min-h-[60vh] bg-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="hero-bg absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-20 btn light text-xs tracking-[0.3em] uppercase px-6 py-3 hover:scale-105 transition-all duration-300"
        >
          Close
        </button>

        {/* Hero Content */}
        <div className="hero-content relative z-10 flex flex-col justify-center items-center text-center h-full px-8 py-20">
          {/* Editorial Eyebrow */}
          <div className="hero-tagline eyebrow text-white/70 mb-6">
            AI Styling Intelligence
          </div>

          {/* Main Title - Editorial Size */}
          <h1 className="hero-title-main font-serif text-[clamp(5rem,12vw,10rem)] font-extralight uppercase tracking-[0.5em] leading-[0.8] mb-4">
            MAYA
          </h1>

          {/* Subtitle */}
          <div className="hero-title-sub font-serif text-[clamp(1.5rem,4vw,2.5rem)] font-extralight uppercase tracking-[0.3em] opacity-80 mb-8">
            Personal Brand Architect
          </div>

          {/* Description */}
          <p className="hero-description max-w-2xl text-sm font-light leading-relaxed opacity-90 tracking-[0.05em]">
            Creating bespoke concept cards with intelligent FLUX prompts for your luxury personal brand photography. 
            Each session is tailored to your vision, style, and professional goals.
          </p>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50 animate-bounce">
            <div className="text-xs tracking-[0.2em] uppercase mb-2">Scroll to Chat</div>
            <div className="w-px h-8 bg-white/30 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex min-h-0">
        {/* Editorial Sidebar - Magazine Style */}
        <div className="w-96 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 overflow-y-auto">
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-8">
            <h2 className="font-serif text-2xl font-extralight uppercase tracking-[0.2em] text-black mb-2">
              Quick Start
            </h2>
            <div className="eyebrow text-gray-500 mb-0">
              Choose your direction
            </div>
          </div>

          <div className="p-8 space-y-12">
            {/* Editorial Quick Actions */}
            <div className="space-y-6">
              {quickActions.map((action, index) => (
                <div key={index} className="editorial-card group cursor-pointer" onClick={() => setMessage(action)}>
                  <div className="card-content p-6 border border-gray-200 hover:border-black transition-all duration-500">
                    <div className="card-number text-6xl font-serif opacity-10 absolute top-2 right-4">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="relative z-10">
                      <div className="eyebrow text-gray-500 mb-3 group-hover:text-white transition-colors duration-500">
                        Session {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="text-sm font-light leading-relaxed group-hover:text-white transition-colors duration-500">
                        {action}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Editorial Style Categories */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="font-serif text-xl font-extralight uppercase tracking-[0.2em] text-black mb-6">
                Categories
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Business', desc: 'Executive portraits' },
                  { name: 'Lifestyle', desc: 'Personal brand' },
                  { name: 'Travel', desc: 'Location shoots' },
                  { name: 'Fashion', desc: 'Editorial style' },
                  { name: 'Instagram', desc: 'Social content' },
                  { name: 'Editorial', desc: 'Magazine style' }
                ].map((category, index) => (
                  <div key={index} className="text-center py-6 border border-gray-200 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer group">
                    <div className="text-xs font-normal uppercase tracking-[0.3em] mb-2 group-hover:text-white">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-white/70">
                      {category.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editorial Statistics */}
            <div className="border-t border-gray-200 pt-8">
              <div className="text-center space-y-4">
                <div className="font-serif text-4xl font-extralight text-black">295</div>
                <div className="eyebrow text-gray-500">Photos Generated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50 min-h-0">
          {/* Messages - Magazine Layout */}
          <div className="flex-1 overflow-y-auto px-20 py-16 space-y-16 min-h-0">
            {messages.length === 0 && (
              <div className="section text-center py-32">
                <div className="eyebrow text-gray-500 mb-8">
                  Welcome to your styling session
                </div>
                <div className="font-serif text-[clamp(2rem,5vw,4rem)] font-extralight text-black mb-8 italic">
                  "Ready to create something extraordinary?"
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto font-light leading-relaxed text-lg">
                  Tell me about your vision, and I'll craft personalized concept cards with intelligent FLUX prompts 
                  that bring your brand story to life.
                </p>
                
                {/* Editorial Decorative Element */}
                <div className="mt-12 flex justify-center">
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="animate-fadeIn">
                {msg.type === 'user' ? (
                  // User Message - Editorial Style
                  <div className="flex justify-end mb-12">
                    <div className="max-w-2xl">
                      <div className="eyebrow text-right text-gray-500 mb-4">
                        Your Vision
                      </div>
                      <div className="editorial-card bg-black text-white">
                        <div className="card-content p-8">
                          <div className="text-lg leading-relaxed font-light">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Maya Message - Magazine Layout
                  <div className="max-w-5xl">
                    <div className="eyebrow text-gray-500 mb-6">
                      Maya • Personal Brand Architect
                    </div>
                    
                    <div className="bg-white border border-gray-200 shadow-lg">
                      <div className="p-12">
                        <div className="text-lg leading-relaxed font-light text-gray-800 whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        
                        {/* Editorial Concept Cards */}
                        {msg.conceptCards && msg.conceptCards.length > 0 && (
                          <div className="mt-12 pt-12 border-t border-gray-200">
                            <div className="font-serif text-2xl font-extralight uppercase tracking-[0.2em] text-black mb-8">
                              Concept Cards
                            </div>
                            
                            <div className="grid gap-8">
                              {msg.conceptCards.map((card, index) => (
                                <div key={card.id} className="editorial-card group border border-gray-200">
                                  <div className="card-content p-8 relative">
                                    <div className="card-number text-8xl font-serif opacity-5 absolute -top-4 -right-2">
                                      {String(index + 1).padStart(2, '0')}
                                    </div>
                                    
                                    <div className="relative z-10">
                                      <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                          <div className="eyebrow text-gray-500 mb-3">
                                            Concept {String(index + 1).padStart(2, '0')} • {card.category || 'Editorial'}
                                          </div>
                                          <h3 className="font-serif text-xl font-light uppercase tracking-[0.1em] text-black mb-4">
                                            {card.title}
                                          </h3>
                                        </div>
                                        {card.imageUrl && (
                                          <div className="w-20 h-20 ml-6 bg-gray-100 border border-gray-200"></div>
                                        )}
                                      </div>
                                      
                                      <p className="text-base leading-relaxed font-light text-gray-700 mb-6">
                                        {card.description}
                                      </p>
                                      
                                      {card.fluxPrompt && (
                                        <div className="bg-black text-white p-6 transition-all duration-500 group-hover:bg-gray-900">
                                          <div className="eyebrow text-white/70 mb-3">
                                            FLUX Prompt • Optimized
                                          </div>
                                          <div className="text-sm font-mono leading-relaxed text-white/90">
                                            {card.fluxPrompt}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Maya Typing Indicator - Editorial Style */}
            {isLoading && (
              <div className="animate-fadeIn">
                <div className="eyebrow text-gray-500 mb-6">
                  Maya • Crafting your concepts
                </div>
                <div className="bg-white border border-gray-200 shadow-lg">
                  <div className="p-12 flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <div className="text-sm font-light text-gray-600">
                      Creating your personalized concept cards...
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Luxury Message Board Input - Integrated */}
          <div className="px-20 pt-8 pb-16">
            <div className="max-w-5xl">
              {/* Message Board Style Input */}
              <div className="bg-white border border-gray-200 shadow-lg">
                <div className="p-8">
                  <div className="eyebrow text-gray-500 mb-6">
                    Continue Conversation • Tell Maya Your Vision
                  </div>
                  
                  <div className="space-y-6">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share your vision for the next photo session..."
                      className="w-full border-0 resize-none bg-transparent text-lg font-light leading-relaxed placeholder-gray-400 focus:outline-none"
                      rows={3}
                      disabled={isLoading}
                    />
                    
                    {/* Integrated Send Area */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="eyebrow text-gray-400">
                        Press Enter to send • Shift+Enter for new line
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isLoading}
                        className="editorial-card group bg-black text-white hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="card-content px-8 py-3 relative">
                          <div className="text-xs font-normal uppercase tracking-[0.3em] group-hover:text-white transition-colors duration-300">
                            {isLoading ? 'Creating...' : 'Send to Maya'}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}