import React, { useState, useRef, useEffect } from 'react';

interface DirectorPanelProps {
  mode: 'photo' | 'story';
  messages?: any[];
  isTyping?: boolean;
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export const DirectorPanel: React.FC<DirectorPanelProps> = ({
  mode,
  messages = [],
  isTyping = false,
  message,
  setMessage,
  onSendMessage,
  onKeyPress,
  disabled = false,
  placeholder,
  className = '',
  children
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Responsive monitoring
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const defaultPlaceholder = mode === 'photo' 
    ? "Describe the professional photos you need for your business..."
    : "Tell me about the story you want to create...";

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
    onKeyPress?.(e);
  };

  // Mobile: Collapsible input overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile Input Bar */}
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="px-4 py-3">
            <div className="flex items-end space-x-3">
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
                    fontFamily: 'Helvetica Neue', 
                    fontWeight: 300, 
                    minHeight: '44px',
                    maxHeight: '120px',
                    lineHeight: 1.6,
                    fontSize: '16px' // Prevents zoom on iOS
                  }}
                />
              </div>
              <button
                onClick={onSendMessage}
                disabled={!message.trim() || isTyping || disabled}
                className="bg-black text-white px-6 py-3 text-xs uppercase tracking-[0.3em] font-light hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
                style={{ minHeight: '44px', minWidth: '70px' }}
              >
                {isTyping ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Chat Overlay (when expanded) */}
        {isExpanded && (
          <div className="fixed inset-0 bg-white z-40 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="spaced-title text-sm">
                {mode === 'photo' ? 'Photo Chat' : 'Story Chat'}
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pb-24">
              {messages.map((msg, index) => (
                <div key={index} className="mb-6">
                  <div className="text-xs text-gray-400 tracking-wider uppercase mb-2">
                    {msg.type === 'user' ? 'You' : 'Maya'}
                  </div>
                  <div className={`p-4 rounded ${
                    msg.type === 'user' 
                      ? 'bg-black text-white ml-8' 
                      : 'bg-gray-50 text-gray-800 mr-8'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="mb-6">
                  <div className="text-xs text-gray-400 tracking-wider uppercase mb-2">Maya</div>
                  <div className="bg-gray-50 p-4 rounded mr-8 flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span className="ml-4 text-xs text-gray-500 tracking-wider uppercase">Thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Mobile Expand Button */}
        {messages.length > 0 && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="fixed top-24 right-4 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center z-30 shadow-lg"
          >
            💬
          </button>
        )}

        {children}
      </>
    );
  }

  // Desktop: Full panel layout
  return (
    <div className={`desktop-panel ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h3 className="spaced-title text-sm">
          {mode === 'photo' ? 'Photo Director' : 'Story Director'}
        </h3>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          Maya's Creative Assistant
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className="space-y-2">
            <div className="text-xs text-gray-400 tracking-wider uppercase">
              {msg.type === 'user' ? 'You' : 'Maya'}
            </div>
            <div className={`p-4 rounded-sm ${
              msg.type === 'user' 
                ? 'bg-black text-white text-sm' 
                : 'bg-gray-50 text-gray-800 text-sm'
            }`}>
              <p className="whitespace-pre-wrap" style={{ lineHeight: 1.6 }}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 tracking-wider uppercase">Maya</div>
            <div className="bg-gray-50 p-4 rounded-sm flex items-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              <span className="ml-4 text-xs text-gray-500 tracking-wider uppercase">
                Thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Desktop Input */}
      <div className="border-t border-gray-100 p-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder || defaultPlaceholder}
              className="w-full resize-none border border-gray-200 focus:border-black focus:outline-none px-4 py-3 bg-white transition-colors rounded-sm"
              rows={1}
              disabled={disabled || isTyping}
              style={{ 
                fontFamily: 'Helvetica Neue', 
                fontWeight: 300, 
                minHeight: '44px',
                maxHeight: '120px',
                lineHeight: 1.6,
                fontSize: '14px'
              }}
            />
          </div>
          <button
            onClick={onSendMessage}
            disabled={!message.trim() || isTyping || disabled}
            className="bg-black text-white px-6 py-3 text-xs uppercase tracking-[0.3em] font-light hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
            style={{ minHeight: '44px', minWidth: '80px' }}
          >
            {isTyping ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {children}
    </div>
  );
};