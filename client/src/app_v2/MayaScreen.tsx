import React, { useState, useRef, useEffect } from 'react';
import { useMayaChat } from '../hooks/useMayaChat.js';
import { Button } from '../components/ui/button.js';
import { Loader2, Send, Sparkles, Camera, Heart } from 'lucide-react';

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

  // Welcome message state - show if there are no messages from the hook
  const [showWelcome] = useState(true);
  const welcomeMessage: MayaChatMessage = {
    id: 0,
    role: 'maya',
    content: "Hi! I'm Maya, your personal AI styling consultant. I specialize in creating editorial-quality photo concepts that tell your unique brand story. What kind of visual story would you like to create today?",
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
    <div className="max-w-4xl mx-auto p-6 h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-stone-800 to-stone-900 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Maya
          </h1>
        </div>
        <p className="text-gray-600">
          Your personal AI styling consultant for editorial-quality photo concepts
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-6 space-y-6">
        {allMessages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl ${
                message.role === 'user'
                  ? 'bg-stone-900 text-stone-50'
                  : 'bg-stone-100 text-stone-900'
              } rounded-2xl px-6 py-4`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Concept Cards */}
              {message.conceptCards && message.conceptCards.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Photo Concept Cards:
                  </div>
                  {message.conceptCards.map((card, cardIndex) => (
                    <div
                      key={card.id || cardIndex}
                      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{card.emoji || '✨'}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {card.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {card.description}
                          </p>
                          <div className="flex gap-2">
                            {/* Add concept card actions here if needed, e.g. Save, Share, etc. */}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {/* Message Input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            data-testid="maya-chat-input"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Maya for styling concepts, photo ideas, or brand direction..."
            className="w-full resize-none rounded-lg border border-stone-300 px-4 py-3 pr-12 focus:ring-2 focus:ring-stone-500 focus:border-transparent bg-stone-50 text-stone-900"
            rows={3}
            disabled={isTyping}
          />
        </div>
        <Button
          data-testid="maya-chat-send"
          onClick={handleSendMessage}
          disabled={!messageInput.trim() || isTyping}
          className="self-end bg-stone-900 hover:bg-stone-800"
        >
          {isTyping ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MayaScreen;
