// Maya module types - unified definitions for type safety
export interface MayaChatMessage {
  id?: number | string;
  role: 'user' | 'maya' | 'system';
  content: string;
  timestamp: string;
  showUpload?: boolean;
  conceptCards?: ConceptCard[];
  isStreaming?: boolean;
  showExamples?: boolean;
}

export interface ConceptCard {
  id: string;
  title: string;
  description: string;
  emoji?: string;
  creativeLook?: string;
  fluxPrompt?: string;
  fullPrompt?: string;
  category?: string;
  imageUrl?: string;
  generatedImages?: string[];
  isGenerating?: boolean;
  isLoading?: boolean;
  hasGenerated?: boolean;
  type?: 'portrait' | 'flatlay' | 'lifestyle';
}

export interface MayaContextData {
  stylePreferences?: string[];
  businessType?: string;
  trainingComplete?: boolean;
}

export interface MayaChatState {
  messages: MayaChatMessage[];
  isTyping: boolean;
  sendMessage: (messageText: string) => Promise<void>;
  setIsTyping: (typing: boolean) => void;
  error: string | null;
}

// API response types for better error handling
export interface MayaAPIResponse {
  response?: string;
  reply?: string;
  conceptCards?: ConceptCard[];
  success?: boolean;
  error?: string;
  message?: string;
  code?: string;
}

export interface MayaAPIError extends Error {
  code?: string;
  status?: number;
}