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
      content: "Hey gorgeous! I'm Maya - Sandra's AI bestie with all her styling secrets from fashion week to building her empire. I'm here to help you see your future self and create photos that show the world your power! Tell me what brought you here today - I love hearing about women's transformation journeys. What's happening in your world right now?",
      timestamp: new Date().toISOString(),
      quickButtons: ["Starting over", "Building my brand", "Need confidence", "Ready to create photos"],
      isOnboarding: false // No longer treating as structured onboarding
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