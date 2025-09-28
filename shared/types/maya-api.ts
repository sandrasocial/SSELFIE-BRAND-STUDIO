// Maya API Type Definitions
// Based on User Journey Doc Section 11

export interface UserPreferences {
  stylePreferences?: string[];
  brandGuidelines?: string;
  contentTone?: string;
  targetAudience?: string;
}

export interface ConceptCard {
  title: string;
  prompt: string;
  category?: string;
  imageUrl?: string;
}

export interface MayaError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface MayaPromptRequest {
  input: string;
  context?: {
    userPreferences?: UserPreferences;
    previousResponses?: MayaResponse[];
    chatHistory?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  };
}

export interface MayaResponse {
  conceptCards?: ConceptCard[];
  suggestions?: string[];
  response?: string;
  error?: MayaError;
  metadata?: {
    processingTime?: number;
    model?: string;
    tokens?: number;
  };
}

export interface MayaChatRequest {
  message: string;
  chatId?: number;
  chatHistory?: Array<{
    user?: string;
    maya?: string;
    response?: string;
  }>;
  context?: Record<string, unknown>;
}

export interface MayaGenerateRequest {
  prompt: string;
  style?: string;
  count?: number;
  conceptName?: string;
  seed?: string;
}

export interface MayaCreateChatRequest {
  title?: string;
  initialMessage?: string;
}

export interface MayaVideoPromptRequest {
  imageUrl: string;
}

// Response types
export interface MayaChatResponse {
  id: number;
  userId: string;
  chatTitle: string;
  chatSummary: string;
  chatCategory: string;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MayaMessageResponse {
  id: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  conceptCards?: ConceptCard[];
  createdAt: Date;
}