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
        
        // Always start with direct Maya interface - no welcome gate
        setShowWelcome(false);
        setIsOnboardingMode(false);
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

  const handlePersonalizationChoice = (setMessages: (messages: ChatMessage[]) => void) => {
    // Start optional onboarding flow
    setIsOnboardingMode(true);
    setIsQuickStartMode(false);
    initializeOnboarding(setMessages);
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
    handlePersonalizationChoice
  };
};