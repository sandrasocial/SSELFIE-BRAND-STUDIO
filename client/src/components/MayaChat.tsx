import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { Camera, Send, MessageCircle, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
}

interface ConceptCard {
  id: string;
  title: string;
  description: string;
  isGenerating?: boolean;
  generatedImages?: string[];
}

// Maya Chat Component - Mobile Optimized for Tab Layout
export function MayaChat() {
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
        content: "Hi! I'm Maya, your AI photo stylist. Tell me what kind of professional photos you need and I'll create custom concepts for you.",
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
    setMessages(prev => prev.map(msg => ({
      ...msg,
      conceptCards: msg.conceptCards?.map(c => 
        c.id === card.id ? { ...c, isGenerating: true } : c
      )
    })));

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
        setMessages(prev => prev.map(msg => ({
          ...msg,
          conceptCards: msg.conceptCards?.map(c => 
            c.id === card.id ? { 
              ...c, 
              isGenerating: false, 
              generatedImages: data.images || [] 
            } : c
          )
        })));

        toast({ title: "Photos Ready!", description: "Your professional photos have been created." });
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      
      // Reset generating state on error
      setMessages(prev => prev.map(msg => ({
        ...msg,
        conceptCards: msg.conceptCards?.map(c => 
          c.id === card.id ? { ...c, isGenerating: false } : c
        )
      })));

      toast({ 
        title: "Generation Error", 
        description: "Unable to generate photos right now. Please try again." 
      });
    }
  };

  return (
    <div className="luxury-tab-content">
      {/* Header */}
      <div className="luxury-tab-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800/40 rounded-full flex items-center justify-center">
            <MessageCircle size={20} className="text-zinc-300" />
          </div>
          <div>
            <h2 className="luxury-heading-2">MAYA</h2>
            <p className="luxury-text-caption">AI Photo Stylist</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="luxury-chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`luxury-message ${msg.type === 'user' ? 'luxury-message-user' : 'luxury-message-maya'}`}>
            <div className="luxury-message-content">
              <p className="luxury-text-body">{msg.content}</p>
              
              {/* Concept Cards */}
              {msg.conceptCards && msg.conceptCards.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="luxury-heading-3">Photo Concepts</h3>
                  {msg.conceptCards.map((card) => (
                    <div key={card.id} className="luxury-card">
                      <h4 className="luxury-heading-4 mb-2">{card.title}</h4>
                      <p className="luxury-text-body mb-4">{card.description}</p>
                      
                      {card.generatedImages && card.generatedImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {card.generatedImages.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Generated ${card.title} ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateImage(card)}
                          disabled={card.isGenerating}
                          className="luxury-button-primary w-full"
                        >
                          {card.isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Creating...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Camera size={16} />
                              Generate Photos
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="luxury-message luxury-message-maya">
            <div className="luxury-message-content">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                </div>
                <span className="luxury-text-caption">Maya is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="luxury-chat-input">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the photos you need..."
              className="luxury-input w-full pr-12"
              disabled={isTyping}
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Camera size={16} className="text-zinc-500" />
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            className="luxury-button-primary px-4"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}