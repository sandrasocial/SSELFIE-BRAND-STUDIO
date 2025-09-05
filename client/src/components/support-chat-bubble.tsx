/**
 * MAYA SUPPORT CHAT BUBBLE
 * Phase 3: Frontend chat interface following SSELFIE editorial styleguide
 * 
 * Clean, minimalistic design with:
 * - Times New Roman headings
 * - Editorial color palette
 * - Subtle animations
 * - Mobile responsive
 */

import { useState, useRef, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SupportChatBubbleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SupportChatBubble({ isOpen, onToggle }: SupportChatBubbleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Send message to Support Maya
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message immediately
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Send to Support Maya with context
      const response = await apiRequest('POST', '/api/maya/chat', {
        message: userMessage,
        context: 'support', // PHASE 1: Support context
        conversationHistory: messages.slice(-6).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.content || data.message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Support chat error:', error);
      toast({
        title: "Connection Issue",
        description: "Unable to reach Maya right now. Please try again.",
      });
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStartConversation = () => {
    setInputValue("Hi Maya, I need help with my account");
    setTimeout(() => sendMessage(), 100);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggle}
          className="support-bubble-trigger"
          aria-label="Open support chat"
        >
          <div className="support-bubble-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.99 3.01 16.28L2 22L7.72 20.99C9.01 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                fill="currentColor"
              />
              <path
                d="M8 10H16M8 14H13"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="support-bubble-text">SUPPORT</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="support-chat-container">
        {/* Header */}
        <div className="support-chat-header">
          <div className="support-chat-title">
            <h3>MAYA SUPPORT</h3>
            <p>How can I help you today?</p>
          </div>
          <button
            onClick={onToggle}
            className="support-chat-close"
            aria-label="Close support chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="support-chat-messages">
          {messages.length === 0 ? (
            <div className="support-chat-welcome">
              <div className="support-welcome-content">
                <h4>Welcome to Maya Support</h4>
                <p>I'm here to help with your account, training, generations, and any technical questions.</p>
                <button
                  onClick={handleStartConversation}
                  className="support-welcome-button"
                >
                  Get Help with Account
                </button>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`support-message ${message.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="support-message-content">
                  {message.content}
                </div>
                <div className="support-message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="support-message assistant loading">
              <div className="support-message-content">
                <div className="support-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="support-chat-input">
          <div className="support-input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              disabled={isLoading}
              className="support-input-field"
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="support-send-button"
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}