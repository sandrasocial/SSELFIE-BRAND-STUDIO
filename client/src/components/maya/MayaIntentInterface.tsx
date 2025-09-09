/**
 * MAYA INTENT-DRIVEN INTERFACE - Breakthrough Solution
 * Integrates visual onboarding, conversation, and concept generation
 * Uses Maya's operational intelligence to seamlessly switch modes
 */

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../hooks/use-toast';
import { MayaVisualOnboarding } from './MayaVisualOnboarding';

type MayaMode = 'onboarding' | 'conversation' | 'concepts';

interface MayaMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  mode?: MayaMode;
  conceptCards?: any[];
  onboardingUI?: any;
  quickActions?: string[];
}

interface MayaIntentInterfaceProps {
  userId: string;
  messages: MayaMessage[];
  onSendMessage: (message: string) => void;
  onConceptGeneration: (concept: any) => void;
  isLoading?: boolean;
}

export const MayaIntentInterface: React.FC<MayaIntentInterfaceProps> = ({
  userId,
  messages,
  onSendMessage,
  onConceptGeneration,
  isLoading = false
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [currentMode, setCurrentMode] = useState<MayaMode>('conversation');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect if we need to show onboarding
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.mode === 'onboarding' || lastMessage?.onboardingUI) {
      setShowOnboarding(true);
      setCurrentMode('onboarding');
    } else {
      setShowOnboarding(false);
      setCurrentMode(lastMessage?.mode || 'conversation');
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;
    
    onSendMessage(inputMessage.trim());
    setInputMessage('');
    setIsTyping(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    onSendMessage(action);
    setIsTyping(true);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (onboardingData: any) => {
    setIsTyping(true);
    try {
      // Send onboarding completion to backend
      const response = await fetch('/api/maya/member/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(onboardingData)
      });

      if (response.ok) {
        const result = await response.json();
        setShowOnboarding(false);
        setCurrentMode('conversation');
        toast({
          title: "Welcome to SSELFIE Studio!",
          description: result.message || "You're all set! Ready to create amazing photos together!"
        });
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast({
        title: "Oops!",
        description: "There was an issue completing your setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Show visual onboarding if needed
  if (showOnboarding) {
    return (
      <div className="h-screen bg-white">
        <MayaVisualOnboarding
          onComplete={handleOnboardingComplete}
          isLoading={isTyping}
          initialMessage={messages[messages.length - 1]?.content}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Maya Chat Header */}
      <div className="border-b border-gray-100 bg-white px-8 py-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xs font-light tracking-wider">
            MAYA
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        
        <div>
          <h1 className="font-serif text-xl font-light tracking-wider uppercase">
            Personal AI Stylist
          </h1>
          <p className="text-sm text-gray-600 tracking-wide">
            {currentMode === 'conversation' && 'Ready to help with styling advice'}
            {currentMode === 'concepts' && 'Creating personalized photo concepts'}
            {currentMode === 'onboarding' && 'Getting to know your style'}
          </p>
        </div>

        <div className="ml-auto">
          <div className="text-xs text-gray-500 tracking-wider uppercase">
            SSELFIE Studio
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.map((message, index) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              
              {/* Message Content */}
              <div className={`p-6 ${
                message.type === 'user' 
                  ? 'bg-black text-white ml-auto' 
                  : 'bg-gray-50 text-gray-900'
              }`}>
                <p className="font-light leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                
                {/* Concept Cards */}
                {message.conceptCards && message.conceptCards.length > 0 && (
                  <div className="mt-6 grid gap-4">
                    {message.conceptCards.map((concept: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => onConceptGeneration(concept)}
                        className="p-6 border border-gray-200 hover:border-black transition-all duration-300 cursor-pointer group"
                      >
                        <h3 className="font-serif text-lg font-light tracking-wide mb-3 group-hover:text-black">
                          {concept.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-light leading-relaxed mb-4">
                          {concept.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs tracking-wider uppercase text-gray-500">
                            Click to Generate
                          </span>
                          <span className="text-gray-400 group-hover:text-black transition-colors">
                            📸
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {message.quickActions && message.quickActions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action)}
                      className="px-4 py-2 border border-gray-200 hover:border-black text-sm tracking-wide transition-all duration-300 hover:bg-gray-50"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className={`mt-2 text-xs text-gray-500 tracking-wider ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {(isLoading || isTyping) && (
          <div className="flex justify-start">
            <div className="bg-gray-50 p-6 rounded-none">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 tracking-wider">Maya is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 bg-white px-8 py-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Maya about styling, concepts, or anything brand-related..."
              className="w-full p-4 border border-gray-200 focus:border-black resize-none transition-colors font-light leading-relaxed focus:outline-none"
              rows={2}
              disabled={isLoading || isTyping}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isTyping}
            className="bg-black text-white px-8 py-4 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm tracking-wider uppercase font-light">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};