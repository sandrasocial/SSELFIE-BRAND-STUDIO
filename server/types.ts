// Server-side type definitions

export interface WebsiteData {
  businessName: string;
  businessDescription: string;
  businessType: string;
  brandPersonality: string;
  targetAudience: string;
  keyFeatures: string[];
  colorPreferences?: string;
  contentStrategy: string;
}

export interface OnboardingData {
  brandStory?: string;
  targetAudience?: string;
  brandVoice?: string;
}

export interface ColorScheme {
  [key: string]: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Fix for ContextPreservationSystem replacement
export interface AgentContext {
  filesModified: string[];
  lastWorkingState?: {
    suggestedActions: string[];
  };
}