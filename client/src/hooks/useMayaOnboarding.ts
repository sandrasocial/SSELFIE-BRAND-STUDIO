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
      const response = await apiRequest('/api/maya/status');
      if (response?.success) {
        const status = {
          isCompleted: response.onboardingComplete,
          currentStep: 1, // Will be updated from chat history
          progress: response.onboardingComplete ? 100 : 0,
          hasStarted: true
        };
        setOnboardingStatus(status);
        
        // Enable onboarding for users who haven't completed it
        if (!status.isCompleted) {
          setIsOnboardingMode(true);
          setShowWelcome(true);
        } else {
          setIsOnboardingMode(false);
          setShowWelcome(false);
        }
      }
    } catch (error) {
      // If onboarding endpoint doesn't exist, proceed with regular Maya
      console.log('❌ Maya: Onboarding status error:', error);
      console.log('Onboarding system not available, proceeding with regular Maya');
      // Default to no onboarding if service unavailable
      setIsOnboardingMode(false);
    }
  };

  const initializeOnboarding = (setMessages: (messages: ChatMessage[]) => void) => {
    const welcomeMessage: ChatMessage = {
      role: 'maya',
      content: "Hey! I'm Maya. Ready to create some stunning photos? I help you look incredible in everything you need - LinkedIn, Instagram, websites. What are we working on today?",
      timestamp: new Date().toISOString(),
      quickButtons: ["Just starting out", "Need work photos", "Want to look better", "Ready to try this"],
      isOnboarding: true // Enable structured onboarding for new users
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