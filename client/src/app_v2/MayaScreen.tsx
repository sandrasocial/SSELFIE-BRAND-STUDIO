import React, { useState, useRef, useEffect } from 'react';
import { useMayaChat } from '../hooks/useMayaChat.js';
import { Send, Camera } from 'lucide-react';

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

const MayaScreen: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isTyping, error } = useMayaChat();

  const [showWelcome] = useState(true);
  const welcomeMessage: MayaChatMessage = {
    id: 0,
    role: 'maya',
    content: "I help people get amazing photos that actually look like them.\n\nI create 5 different shots every time - some close-ups, some full body, and some lifestyle scenes that work together like a perfect feed. What kind of photos are you dreaming of?",
    timestamp: new Date().toISOString()
  };

  // Combine welcome message with actual messages
  const allMessages = showWelcome && messages.length === 0 ? [welcomeMessage, ...messages] : messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isTyping) return;

    const messageText = messageInput.trim();
    setMessageInput('');

    try {
      await sendMessage(messageText);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 pb-2">
      {/* Maya Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-stone-200/60 overflow-hidden flex-shrink-0">
            <img 
              src="https://i.postimg.cc/fTtCnzZv/out-1-22.png" 
              alt="Maya" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.25em] text-stone-950 uppercase">Maya</h3>
            <p className="text-xs tracking-[0.15em] uppercase font-light text-stone-500">Your Photo Stylist</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <div className="w-2 h-2 bg-stone-900 rounded-full"></div>
          <span className="text-xs font-light text-stone-600">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {allMessages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border ${
                message.role === 'user' 
                  ? 'bg-stone-200/40 border-stone-300/40' 
                  : 'bg-stone-100/40 border-stone-200/40'
              }`}>
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-stone-950 leading-relaxed font-light whitespace-pre-wrap">{message.content}</p>
                  <div className="text-xs font-light text-stone-500 opacity-60">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {/* Concept Cards */}
              {message.role === 'maya' && message.conceptCards && message.conceptCards.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-stone-600"></div>
                    <span className="text-xs tracking-[0.15em] uppercase font-light text-stone-600">Photo Ideas</span>
                  </div>
                  {message.conceptCards.map((card, cardIndex) => (
                    <div
                      key={card.id || cardIndex}
                      className="bg-stone-100/40 border border-stone-200/50 rounded-2xl p-5 transition-all duration-200 hover:bg-stone-100/60 hover:border-stone-300/60"
                    >
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="px-3 py-1.5 bg-stone-500/10 rounded-full border border-stone-400/20">
                            <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-600">
                              {card.type || 'Concept'}
                            </span>
                          </div>
                          {card.emoji && <span className="text-2xl">{card.emoji}</span>}
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-base font-serif font-extralight tracking-[0.1em] text-stone-950 uppercase leading-tight">
                            {card.title}
                          </h4>
                          <p className="text-sm font-light leading-relaxed text-stone-600">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-stone-100/40 border border-stone-200/40 p-4 rounded-2xl max-w-[90%]">
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full animate-bounce bg-stone-600"></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-stone-600" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-stone-600" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-sm font-light text-stone-600">Maya is creating your photos...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50/50 border border-red-200/50 rounded-2xl">
          <p className="text-red-700 text-sm font-light">{error}</p>
        </div>
      )}

      {/* Chat Input */}
      <div className="border-t border-stone-200/30 pt-4 mt-auto flex-shrink-0">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              data-test-id="chat-input"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your vision to Maya..."
              className="w-full resize-none px-4 py-4 bg-stone-100/40 border border-stone-200/60 rounded-2xl text-stone-950 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 pr-12 font-light text-sm min-h-[52px]"
              rows={3}
              disabled={isTyping}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Camera size={16} className="text-stone-500" strokeWidth={1.5} />
            </div>
          </div>
          <button 
            data-testid="maya-chat-send"
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isTyping}
            className="group relative px-4 py-4 bg-stone-950 text-stone-50 rounded-2xl font-light transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-sm min-h-[52px] min-w-[52px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-stone-800 transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
            <Send size={16} strokeWidth={1.5} className="relative z-10 group-hover:text-stone-50 transition-colors duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MayaScreen;
