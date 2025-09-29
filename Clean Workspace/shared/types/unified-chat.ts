import type {
  MayaChat as DbMayaChat,
  MayaChatMessage as DbMayaChatMessage,
  ClaudeConversation as DbClaudeConversation,
  ClaudeMessage as DbClaudeMessage,
  User,
  BrandOnboarding,
  AgentConversation,
} from '../schema.js';

// Base chat message interface
export interface BaseChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'maya' | 'victoria';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Maya chat specific interfaces
export interface MayaChatMessage extends BaseChatMessage {
  chatId: string;
  userId: string;
  imagePreview?: string | null;
  generatedPrompt?: string | null;
  conceptCards?: Record<string, unknown>[] | null;
  quickButtons?: string[] | null;
  canGenerate?: boolean;
}

export interface MayaChat extends DbMayaChat {
  messages: MayaChatMessage[];
  context?: MayaChatContext;
}

export interface MayaChatContext {
  userId: string;
  sessionId: string;
  messageHistory: MayaChatMessage[];
  personalStyle?: {
    preferences: string[];
    recentChoices: string[];
    favoriteCategories: string[];
  };
  brandContext?: BrandContext;
}

// Claude chat specific interfaces
export interface ClaudeMessage extends Omit<BaseChatMessage, 'id' | 'metadata' | 'role'>, Omit<DbClaudeMessage, 'metadata' | 'role'> {
  conversationId: string;
  tokens: number;  
  completionTokens: number;
  promptTokens: number;
  metadata?: Record<string, unknown>;
  role: BaseChatMessage['role']; // Use BaseChatMessage role type explicitly
}

export interface ClaudeConversation extends DbClaudeConversation {
  messages: ClaudeMessage[];
  model: string;
  temperature: number;
  maxTokens: number;
}

// Brand context interfaces
export interface BrandContext {
  name?: string;
  style?: string;
  industry?: string;
  targetAudience?: string;
  onboarding?: BrandOnboarding;
  personalityTraits?: string[];
  stylePreferences?: string[];
}

// Agent interaction interfaces
export interface ChatAPIRequest {
  message: string;
  userId: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface ChatAPIResponse {
  message: string;
  messageId: string;
  conversationId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Chat session management interfaces
export interface ChatSession {
  id: string;
  userId: string;
  agent: 'maya' | 'victoria' | 'claude';
  startedAt: Date;
  endedAt?: Date;
  metadata?: Record<string, unknown>;
}

// Type guards
export const isChatMessage = (obj: unknown): obj is BaseChatMessage => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'role' in obj &&
    'content' in obj &&
    typeof (obj as BaseChatMessage).content === 'string' &&
    ['user', 'assistant', 'system', 'maya', 'victoria'].includes((obj as BaseChatMessage).role)
  );
};

export const isMayaChatMessage = (obj: unknown): obj is MayaChatMessage => {
  return isChatMessage(obj) && 'chatId' in obj && 'userId' in obj;
};

export const isClaudeMessage = (obj: unknown): obj is ClaudeMessage => {
  return (
    isChatMessage(obj) &&
    'conversationId' in obj &&
    'tokens' in obj &&
    'completionTokens' in obj &&
    'promptTokens' in obj
  );
};