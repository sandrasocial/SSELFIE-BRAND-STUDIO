/**
 * MAYA - INTENT-DRIVEN INTERFACE (Clean Implementation)
 * Replaces complex 1000+ line maya.tsx with streamlined intent-driven system
 * Uses Maya's operational intelligence to prevent mode confusion
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { useMayaGeneration } from '../hooks/useMayaGeneration';
import { useMayaPersistence } from '../hooks/useMayaPersistence';
import { MayaIntentInterface } from '../components/maya/MayaIntentInterface';
import { MemberNavigation } from '../components/member-navigation';

interface MayaMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  mode?: 'onboarding' | 'conversation' | 'concepts';
  conceptCards?: any[];
  onboardingUI?: any;
  quickActions?: string[];
}

export default function Maya() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use existing Maya persistence system
  const {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    clearConversation,
    isLoading: isPersistenceLoading
  } = useMayaPersistence(user?.id);

  // Use existing Maya generation system
  const { generateFromSpecificConcept } = useMayaGeneration(messages, setMessages, null, setIsLoading, toast);

  // Convert old messages to new format
  const mayaMessages: MayaMessage[] = messages.map(msg => ({
    id: msg.id || Math.random().toString(36),
    type: msg.type as 'user' | 'maya',
    content: msg.content,
    timestamp: msg.timestamp || new Date().toISOString(),
    mode: msg.isOnboarding ? 'onboarding' : (msg.conceptCards?.length ? 'concepts' : 'conversation'),
    conceptCards: msg.conceptCards,
    quickActions: msg.quickButtons
  }));

  // Handle new message sending with Maya's state machine
  const handleSendMessage = async (messageContent: string) => {
    if (!user?.id || !messageContent.trim()) return;

    setIsLoading(true);
    
    // Add user message
    const userMessage: MayaMessage = {
      id: Math.random().toString(36),
      type: 'user',
      content: messageContent.trim(),
      timestamp: new Date().toISOString()
    };

    addMessage({
      type: 'user',
      content: messageContent.trim(),
      timestamp: new Date().toISOString()
    });

    try {
      // Send to Maya's state machine for intent-driven response
      const response = await fetch('/api/maya/member/chat-state-machine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: messageContent.trim(),
          conversationHistory: mayaMessages.slice(-5) // Send last 5 messages for context
        })
      });

      if (!response.ok) {
        throw new Error(`Maya API error: ${response.status}`);
      }

      const mayaResponse = await response.json();
      
      // Add Maya's response
      addMessage({
        type: 'maya',
        content: mayaResponse.message || "I'm here to help! What would you like to know?",
        timestamp: new Date().toISOString(),
        conceptCards: mayaResponse.conceptCards,
        quickButtons: mayaResponse.quickActions,
        isOnboarding: mayaResponse.mode === 'onboarding'
      });

    } catch (error) {
      console.error('❌ Maya message error:', error);
      
      // Fallback to simple conversation
      addMessage({
        type: 'maya',
        content: "I'm having a small technical moment! Let me help you with that. What specifically are you looking for with your photos?",
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Connection Issue",
        description: "I had a brief technical moment, but I'm back! Try your message again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle concept card generation
  const handleConceptGeneration = async (concept: any) => {
    if (!concept?.fluxPrompt) {
      toast({
        title: "Concept Error",
        description: "This concept needs some technical adjustments. Let me create a new one for you!",
        variant: "destructive"
      });
      return;
    }

    try {
      await generateFromSpecificConcept(concept);
    } catch (error) {
      console.error('❌ Maya concept generation error:', error);
      toast({
        title: "Generation Error", 
        description: "I had trouble generating that concept. Let me try a different approach!",
        variant: "destructive"
      });
    }
  };

  // Show loading state while persistence initializes
  if (isPersistenceLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xs font-light tracking-wider mb-4 mx-auto">
            MAYA
          </div>
          <p className="text-gray-600 font-light tracking-wide">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!user) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-3xl font-light tracking-wider uppercase mb-4">Maya</h1>
          <p className="text-gray-600 font-light leading-relaxed">Please sign in to access your personal AI stylist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <MemberNavigation />
      
      <MayaIntentInterface
        userId={user.id}
        messages={mayaMessages}
        onSendMessage={handleSendMessage}
        onConceptGeneration={handleConceptGeneration}
        isLoading={isLoading}
      />
    </div>
  );
}