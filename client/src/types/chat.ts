// Shared chat interface types used across the application

export interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt?: string;
  fullPrompt?: string;
  category?: string;
  imageUrl?: string;
  generatedImages?: string[];
  isGenerating?: boolean;
  isLoading?: boolean;
  hasGenerated?: boolean;
  originalContext?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'maya' | 'upload' | 'examples';
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  isStreaming?: boolean;
  imagePreview?: string[];
  quickButtons?: string[];
  generationId?: string;
  showUpload?: boolean;
  showExamples?: boolean;
}

export interface ConversationData {
  messages: ChatMessage[];
  [key: string]: unknown;
}

// Utility function used across components
export const cleanDisplayTitle = (title: string): string => {
  return title.replace(/[✨💫🔥🌟💎🌅🏢💼🌊👑💃📸🎬♦️🚖]/g, '').trim();
};