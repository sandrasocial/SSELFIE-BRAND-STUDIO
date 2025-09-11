import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
}

interface DirectorPanelProps {
  mode: 'photo' | 'story';
  messages: ChatMessage[];
  isTyping: boolean;
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
  chatContainerRef?: React.RefObject<HTMLDivElement>;
}

export const DirectorPanel: React.FC<DirectorPanelProps> = ({
  mode,
  messages,
  isTyping,
  message,
  setMessage,
  onSendMessage,
  onKeyPress,
  disabled = false,
  placeholder,
  className = '',
  messagesEndRef,
  chatContainerRef
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  // Default placeholders based on Maya's voice
  const defaultPlaceholder = mode === 'photo' 
    ? "What is the goal for this creative session?"
    : "What story do you want to tell today?";

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Track if conversation has started
  useEffect(() => {
    setHasStartedChat(messages.length > 0);
  }, [messages.length]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
    onKeyPress?.(e);
  };

  // Maya's guided prompts for getting started
  const guidedPrompts = mode === 'photo' ? [
    "I need professional headshots for my LinkedIn profile",
    "Create lifestyle content for my brand's social media",
    "Professional team photos for our company website",
    "Executive portraits that command respect and trust"
  ] : [
    "A quick video showcasing my brand's mission",
    "Behind-the-scenes content for social media",
    "Professional introduction video for my website",
    "Client testimonial story format"
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>

      {/* Welcome State - Maya's Warm Introduction */}
      {!hasStartedChat && (
        <div className="flex-1 flex flex-col justify-center p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 
              className="text-lg mb-2"
              style={{ 
                fontFamily: 'Times New Roman, serif', 
                fontWeight: 300,
                letterSpacing: '0.1em'
              }}
            >
              Hello! I'm Maya
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {mode === 'photo' 
                ? "I'm your personal brand strategist. Let's create professional photos that tell your unique story and build trust with your audience."
                : "I'm here to help you craft compelling video stories. Together, we'll bring your brand's message to life in a way that truly connects."
              }
            </p>
          </div>

          {/* Guided Prompts */}
          <div className="space-y-3">
            <p 
              className="text-xs text-gray-500 mb-3"
              style={{ 
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 300
              }}
            >
              Try asking me about:
            </p>
            {guidedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setMessage(prompt)}
                className="w-full text-left px-4 py-3 text-sm border border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-200 rounded"
                style={{ 
                  fontWeight: 300,
                  lineHeight: 1.5
                }}
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {hasStartedChat && (
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((msg, index) => (
            <div key={msg.id} className="space-y-2">
              <div 
                className="text-xs text-gray-400"
                style={{ 
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 300
                }}
              >
                {msg.type === 'user' ? 'You' : 'Maya'}
              </div>
              <div className={`p-4 rounded-lg max-w-[85%] ${
                msg.type === 'user' 
                  ? 'bg-black text-white ml-auto' 
                  : 'bg-gray-50 text-gray-800'
              }`}>
                <p 
                  className="whitespace-pre-wrap leading-relaxed"
                  style={{ 
                    fontWeight: 300,
                    fontSize: '14px',
                    lineHeight: 1.6
                  }}
                >
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {/* Maya's Typing Indicator */}
          {isTyping && (
            <div className="space-y-2">
              <div 
                className="text-xs text-gray-400"
                style={{ 
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 300
                }}
              >
                Maya
              </div>
              <div className="bg-gray-50 p-4 rounded-lg max-w-[85%] flex items-center">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span 
                  className="ml-4 text-xs text-gray-500"
                  style={{ 
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 300
                  }}
                >
                  Creating concepts...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message Input - Always Present */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder || defaultPlaceholder}
              className="w-full resize-none border border-gray-200 focus:border-black focus:outline-none px-4 py-3 bg-white transition-colors rounded"
              rows={1}
              disabled={disabled || isTyping}
              style={{ 
                fontFamily: 'inherit', 
                fontWeight: 300, 
                minHeight: '48px',
                maxHeight: '120px',
                lineHeight: 1.5,
                fontSize: '14px'
              }}
            />
          </div>
          <button
            onClick={onSendMessage}
            disabled={!message.trim() || isTyping || disabled}
            className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 rounded"
            style={{ 
              minHeight: '48px',
              minWidth: '100px'
            }}
          >
            <Send className="w-4 h-4" />
            <span 
              className="text-xs"
              style={{ 
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 300
              }}
            >
              {isTyping ? 'Sending...' : 'Send'}
            </span>
          </button>
        </div>

        {/* Helpful tips */}
        <p className="text-xs text-gray-400 mt-3 text-center" style={{ fontWeight: 300 }}>
          {hasStartedChat 
            ? "Press Enter to send, Shift+Enter for new line"
            : `Tell Maya about your ${mode === 'photo' ? 'photo goals' : 'story vision'} and she'll create custom concepts`
          }
        </p>
      </div>
    </div>
  );
};