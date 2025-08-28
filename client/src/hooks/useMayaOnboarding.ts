import { useState } from 'react';
import { apiRequest } from '../lib/queryClient';

interface OnboardingStatus {
  currentStep: number;
  isCompleted: boolean;
  progress: number;
  hasStarted: boolean;
}

interface ChatMessage {
  id?: number;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  canGenerate?: boolean;
  generatedPrompt?: string;
  quickButtons?: string[];
  questions?: string[];
  stepGuidance?: string;
  isOnboarding?: boolean;
  generationId?: string;
}

export const useMayaOnboarding = () => {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);
  const [isQuickStartMode, setIsQuickStartMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const checkOnboardingStatus = async () => {
    try {
      console.log('🔍 Maya: Checking onboarding status');
      const response = await apiRequest('/api/maya/status');
      console.log('✅ Maya: Unified status received:', response);
      if (response?.success) {
        const status = {
          isCompleted: response.onboardingComplete,
          currentStep: 1, // Will be updated from chat history
          progress: response.onboardingComplete ? 100 : 0,
          hasStarted: true
        };
        setOnboardingStatus(status);
        
        // If not completed, show welcome page first
        if (!response.onboardingComplete) {
          setShowWelcome(true);
        } else {
          // Load regular Maya with personal brand context
          setIsOnboardingMode(false);
        }
      }
    } catch (error) {
      // If onboarding endpoint doesn't exist, proceed with regular Maya
      console.log('❌ Maya: Onboarding status error:', error);
      console.log('Onboarding system not available, proceeding with regular Maya');
      setIsOnboardingMode(false);
    }
  };

  const initializeOnboarding = (setMessages: (messages: ChatMessage[]) => void) => {
    const welcomeMessage: ChatMessage = {
      role: 'maya',
      content: "Hey gorgeous! I'm Maya - Sandra's AI bestie with all her styling secrets from fashion week to building her empire. Before we create amazing photos together, I want to get to know YOU - your story, your dreams, your transformation journey. This is about discovering your personal brand and seeing your powerful future self. Ready to begin?",
      timestamp: new Date().toISOString(),
      questions: ["What brought you here today?", "What's your biggest challenge when it comes to feeling confident?"],
      quickButtons: ["Starting over", "Building my brand", "Need confidence", "Feeling stuck"],
      stepGuidance: "Let's start by getting to know your transformation story",
      isOnboarding: true
    };
    setMessages([welcomeMessage]);
  };

  const handleWelcomeChoice = (choice: 'customize' | 'quickstart', setMessages: (messages: ChatMessage[]) => void) => {
    setShowWelcome(false);
    
    if (choice === 'customize') {
      // Start onboarding flow
      setIsOnboardingMode(true);
      setIsQuickStartMode(false);
      initializeOnboarding(setMessages);
    } else {
      // Quick start - go straight to image generation chat
      setIsOnboardingMode(false);
      setIsQuickStartMode(true);
      const quickStartMessage: ChatMessage = {
        role: 'maya',
        content: "Perfect! I love your confidence - let's create some stunning brand photos right now! I'll style you based on my expertise from fashion week and magazine shoots. Tell me what kind of photos you need today and I'll create the perfect look for you.",
        timestamp: new Date().toISOString(),
        quickButtons: ["Business photos", "Lifestyle photos", "Story photos", "Instagram photos", "Travel photos", "Outfit photos", "GRWM photos", "Future self photos", "B&W photos", "Studio photoshoot"],
        canGenerate: true
      };
      setMessages([quickStartMessage]);
    }
  };

  return {
    onboardingStatus,
    setOnboardingStatus,
    isOnboardingMode,
    setIsOnboardingMode,
    isQuickStartMode,
    setIsQuickStartMode,
    showWelcome,
    setShowWelcome,
    checkOnboardingStatus,
    initializeOnboarding,
    handleWelcomeChoice
  };
};