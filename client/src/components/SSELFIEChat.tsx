import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast.js';
import { Camera, Send, MessageCircle, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'sselfie' | 'maya';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
}

import type { ConceptCard } from '../../../shared/types/concept-card.js';

// SSELFIE Chat Component - Mobile Optimized for Tab Layout  
export function SSELFIEChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'maya',
        content: "Hi! I'm your SSELFIE AI photo stylist. Tell me what kind of professional photos you need and I'll create custom concepts for you.",
        timestamp: new Date().toISOString()
      }]);
    }
  }, [messages.length]);

  // Send message to Maya
  const sendMessage = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          context: 'mobile_tab'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const mayaMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'maya',
        content: data.response || data.content || "I'd love to help you create amazing photos!",
        timestamp: new Date().toISOString(),
        conceptCards: data.conceptCards || []
      };
      
      setMessages(prev => [...prev, mayaMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Maya chat error:', error);
      setIsTyping(false);
      
      // Add fallback response for better UX
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'maya',
        content: "I'm having trouble connecting right now, but I'd love to help you create stunning professional photos! Try describing what kind of photos you need.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      toast({ 
        title: "Connection Issue", 
        description: "Maya will respond once connection is restored." 
      });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || isTyping) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    sendMessage.mutate(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGenerateImage = async (card: ConceptCard) => {
    toast({ title: "Creating Photos", description: "Maya is generating your professional photos..." });
    
    // Update card to show generating state
    setMessages(prev => prev.map(msg => {
      if (!msg.conceptCards) return msg;
      return {
        ...msg,
        conceptCards: msg.conceptCards.map(c => 
          c.id === card.id ? { ...c, isGenerating: true } : c
        )
      };
    }));

    try {
      const response = await fetch('/api/maya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: card.id,
          title: card.title,
          description: card.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update card with generated images
        setMessages(prev => prev.map(msg => {
          if (!msg.conceptCards) return msg;
          return {
            ...msg,
            conceptCards: msg.conceptCards.map(c => 
              c.id === card.id ? { 
                ...c, 
                isGenerating: false, 
                generatedImages: data.images || [] 
              } : c
            )
          };
        }));

        toast({ title: "Photos Ready!", description: "Your professional photos have been created." });
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      
      // Reset generating state on error
      setMessages(prev => prev.map(msg => {
        if (!msg.conceptCards) return msg;
        return {
          ...msg,
          conceptCards: msg.conceptCards.map(c => 
            c.id === card.id ? { ...c, isGenerating: false } : c
          )
        };
      }));

      toast({ 
        title: "Generation Error", 
        description: "Unable to generate photos right now. Please try again." 
      });
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Maya Header - Following Styleguide */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/30">
            <MessageCircle size={20} className="text-zinc-300" strokeWidth={1.2} />
          </div>
          <div>
            <h3 className="text-xl font-serif font-extralight tracking-[0.2em] text-white uppercase">Maya Studio</h3>
            <p className="text-xs text-zinc-500 tracking-[0.2em] uppercase font-light">AI Stylist & Brand Strategist</p>
          </div>
        </div>
      </div>

      {/* Chat Messages - Following Styleguide Design */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-4 rounded-xl ${
                msg.type === 'user' 
                  ? 'bg-zinc-700/30 border border-zinc-600/30' 
                  : 'bg-zinc-800/30 border border-zinc-700/30'
              }`}>
                <div className="space-y-2">
                  <p className="text-sm text-white leading-relaxed font-light">{msg.content}</p>
                  <div className="text-xs text-zinc-500 font-light">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {/* Concept Cards - Using Styleguide Design */}
              {msg.type === 'maya' && msg.conceptCards && msg.conceptCards.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-zinc-400 rounded-full"></div>
                    <span className="text-zinc-500 text-xs tracking-[0.2em] uppercase font-light">Concept Ideas</span>
                  </div>
                  {msg.conceptCards.map((card) => (
                    <div key={card.id} className="bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 rounded-2xl p-6 border border-zinc-700/20 transition-all duration-500 hover:border-zinc-600/30 hover:bg-gradient-to-br hover:from-zinc-800/30 hover:to-zinc-900/30">
                      <div className="space-y-5">
                        {/* Enhanced header with better hierarchy */}
                        <div className="flex items-center justify-between">
                          <div className="px-4 py-2 bg-zinc-700/30 rounded-full border border-zinc-600/20">
                            <span className="text-sm text-zinc-300 tracking-[0.1em] uppercase font-light">Photo</span>
                          </div>
                          <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                        </div>
                        
                        {/* Improved content hierarchy - Following Styleguide */}
                        <div className="space-y-4">
                          <h4 className="text-xl font-serif font-extralight tracking-[0.1em] text-white uppercase leading-tight">{card.title}</h4>
                          <p className="text-base text-zinc-300 leading-relaxed font-light">{card.description}</p>
                        </div>
                      </div>
                      
                      {/* Generate Button - Following Styleguide Design */}
                      {card.generatedImages && card.generatedImages.length > 0 ? (
                        <div className="mt-6 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            {card.generatedImages.map((imageUrl, index) => (
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`Generated ${card.title} ${index + 1}`}
                                className="w-full aspect-square object-cover rounded-xl"
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button className="px-5 py-3 bg-white text-black rounded-xl font-light tracking-[0.1em] uppercase text-sm transition-all duration-300 hover:bg-zinc-200 min-h-[48px]">
                              Save All
                            </button>
                            <button className="px-5 py-3 bg-zinc-800/30 text-white border border-zinc-700/20 rounded-xl font-light tracking-[0.1em] uppercase text-sm transition-all duration-300 hover:bg-zinc-800/50 min-h-[48px]">
                              Share
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-8">
                          <button 
                            onClick={() => handleGenerateImage(card)}
                            disabled={card.isGenerating}
                            className="group relative w-full bg-white text-black px-8 py-5 rounded-2xl font-light tracking-[0.2em] uppercase text-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden min-h-[56px] disabled:opacity-50"
                          >
                            <div className="absolute inset-0 bg-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                            <div className="relative z-10 group-hover:text-white transition-colors duration-500 flex items-center justify-center gap-3">
                              {card.isGenerating ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  <span>Creating Magic</span>
                                </>
                              ) : (
                                <>
                                  <Camera size={18} strokeWidth={1.2} />
                                  <span>Generate Photos</span>
                                </>
                              )}
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator - Following Styleguide */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/30 border border-zinc-700/30 p-4 rounded-xl max-w-[85%]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                </div>
                <span className="text-sm text-zinc-400 font-light">Maya is crafting your vision...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input - Following Styleguide Design */}
      <div className="border-t border-zinc-800/20 pt-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your vision to Maya..."
              className="w-full px-4 py-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600/50 pr-12 font-light"
              disabled={isTyping}
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Camera size={16} className="text-zinc-500" strokeWidth={1.2} />
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            className="group relative px-4 py-3 bg-white text-black rounded-xl font-light transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-black transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
            <Send size={16} strokeWidth={1.2} className="relative z-10 group-hover:text-white transition-colors duration-300" />
          </button>
        </form>
      </div>
    </div>
  );
}