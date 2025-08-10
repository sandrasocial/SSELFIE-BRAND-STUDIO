// Maya STYLE Interface - Core Chat Component
// August 10, 2025 - Redesign Implementation

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMayaState, useMayaActions } from '@/hooks/maya/useMayaState';
import { useMayaContent } from '@/hooks/maya/useMayaContent';
import { MayaAvatar, MayaStatusIndicator } from './MayaPersonality';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ChatMessage, MayaChat } from '@/types/maya/MayaTypes';
import { cn } from '@/lib/utils';

interface MayaChatInterfaceProps {
  className?: string;
}

export function MayaChatInterface({ className }: MayaChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { state } = useMayaState();
  const actions = useMayaActions();
  const content = useMayaContent();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chat.messages.length]);

  // Initialize with welcome message if no messages
  useEffect(() => {
    if (state.isInitialized && state.chat.messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'maya',
        content: content.getPersonalizedGreeting(),
        timestamp: new Date().toISOString(),
      };
      actions.receiveMessage(welcomeMessage);
    }
  }, [state.isInitialized, state.chat.messages.length, actions, content]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    actions.setInput(e.target.value);
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    const message = state.chat.input.trim();
    if (!message || state.chat.isTyping) return;

    // Send user message
    actions.sendMessage(message);

    try {
      // Call Maya API
      const response = await apiRequest('POST', '/api/maya/chat', {
        message,
        chatId: state.chat.currentChatId,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle different response types
        if (data.response) {
          const mayaMessage: ChatMessage = {
            role: 'maya',
            content: data.response,
            timestamp: new Date().toISOString(),
            canGenerate: data.canGenerate,
            generatedPrompt: data.generatedPrompt,
          };
          actions.receiveMessage(mayaMessage);
        }

        // Update chat ID if provided
        if (data.chatId && !state.chat.currentChatId) {
          actions.initialize(data.chatId);
        }

      } else {
        throw new Error('Failed to send message');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      actions.setTyping(false);
      
      const errorMessage: ChatMessage = {
        role: 'maya',
        content: content.getErrorRecoveryMessage('network_error'),
        timestamp: new Date().toISOString(),
      };
      actions.receiveMessage(errorMessage);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [state.chat.input]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <MayaAvatar mood={state.ui.mood} size="md" />
          <div>
            <h2 className="font-serif text-lg font-medium text-black">Maya</h2>
            <p className="text-sm text-gray-600">Your Celebrity Stylist</p>
          </div>
        </div>
        <MayaStatusIndicator mood={state.ui.mood} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {state.chat.messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === 'user'
                  ? "bg-black text-white ml-4"
                  : "bg-gray-50 text-gray-900 mr-4"
              )}
            >
              {message.role === 'maya' && (
                <div className="flex items-center space-x-2 mb-2">
                  <MayaAvatar mood={state.ui.mood} size="sm" />
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Maya</span>
                </div>
              )}
              
              <div className={cn(
                "text-sm leading-relaxed",
                message.role === 'user' ? "text-white" : "text-gray-900"
              )}>
                {message.content}
              </div>

              {/* Show generation button if Maya suggests it */}
              {message.role === 'maya' && message.canGenerate && message.generatedPrompt && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <MayaGenerateButton 
                    prompt={message.generatedPrompt}
                    disabled={state.generation.isGenerating}
                  />
                </div>
              )}

              {/* Show image previews if available */}
              {message.imagePreview && message.imagePreview.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <MayaImagePreview images={message.imagePreview} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {state.chat.isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-50 rounded-2xl px-4 py-3 mr-4">
              <div className="flex items-center space-x-2 mb-2">
                <MayaAvatar mood="thinking" size="sm" />
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Maya</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={state.chat.input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Tell Maya about your vision..."
              className="min-h-[44px] max-h-32 resize-none border-gray-200 focus:border-amber-400 focus:ring-amber-400"
              disabled={state.chat.isTyping}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!state.chat.input.trim() || state.chat.isTyping}
            className="px-6 bg-black hover:bg-gray-800 text-white"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

// Generate button component
interface MayaGenerateButtonProps {
  prompt: string;
  disabled?: boolean;
}

function MayaGenerateButton({ prompt, disabled }: MayaGenerateButtonProps) {
  const actions = useMayaActions();

  const handleGenerate = () => {
    // This will be handled by the MayaImageGeneration component
    actions.setPhase('GENERATING');
    // The actual generation logic will be implemented separately
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={disabled}
      size="sm"
      className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1"
    >
      ✨ Generate This Look
    </Button>
  );
}

// Image preview component
interface MayaImagePreviewProps {
  images: string[];
}

function MayaImagePreview({ images }: MayaImagePreviewProps) {
  return (
    <div className="grid grid-cols-2 gap-2 max-w-xs">
      {images.slice(0, 4).map((image, index) => (
        <div
          key={index}
          className="aspect-square rounded-lg overflow-hidden bg-gray-100"
        >
          <img
            src={image}
            alt={`Generated look ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}