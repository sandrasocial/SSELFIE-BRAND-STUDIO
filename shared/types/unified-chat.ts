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
export interface ClaudeMessage extends Omit<BaseChatMessage, 'id'> {
  conversationId: string;
  tokens: number;
  completionTokens: number;
  promptTokens: number;
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

// Type guards with enhanced null checking and validation
export const isChatMessage = (obj: unknown): obj is BaseChatMessage => {
  if (!obj || typeof obj !== 'object') return false;
  
  const message = obj as any; // Use any to avoid conversion issues
  
  return (
    typeof message.id === 'string' &&
    message.id.length > 0 &&
    typeof message.role === 'string' &&
    ['user', 'assistant', 'system', 'maya', 'victoria'].includes(message.role) &&
    typeof message.content === 'string' &&
    message.timestamp instanceof Date
  );
};

export const isMayaChatMessage = (obj: unknown): obj is MayaChatMessage => {
  if (!isChatMessage(obj)) return false;
  
  const mayaMessage = obj as any; // Use any to avoid conversion issues
  
  return (
    typeof mayaMessage.chatId === 'string' &&
    mayaMessage.chatId.length > 0 &&
    typeof mayaMessage.userId === 'string' &&
    mayaMessage.userId.length > 0 &&
    // Optional fields validation
    (mayaMessage.imagePreview === null || mayaMessage.imagePreview === undefined || typeof mayaMessage.imagePreview === 'string') &&
    (mayaMessage.generatedPrompt === null || mayaMessage.generatedPrompt === undefined || typeof mayaMessage.generatedPrompt === 'string') &&
    (mayaMessage.conceptCards === null || mayaMessage.conceptCards === undefined || Array.isArray(mayaMessage.conceptCards)) &&
    (mayaMessage.quickButtons === null || mayaMessage.quickButtons === undefined || Array.isArray(mayaMessage.quickButtons)) &&
    (mayaMessage.canGenerate === undefined || typeof mayaMessage.canGenerate === 'boolean')
  );
};

export const isClaudeMessage = (obj: unknown): obj is ClaudeMessage => {
  if (!obj || typeof obj !== 'object') return false;
  
  const claudeMessage = obj as any; // Use any to avoid conversion issues
  
  return (
    typeof claudeMessage.role === 'string' &&
    ['user', 'assistant', 'system', 'maya', 'victoria'].includes(claudeMessage.role) &&
    typeof claudeMessage.content === 'string' &&
    claudeMessage.timestamp instanceof Date &&
    typeof claudeMessage.conversationId === 'string' &&
    claudeMessage.conversationId.length > 0 &&
    typeof claudeMessage.tokens === 'number' &&
    claudeMessage.tokens >= 0 &&
    typeof claudeMessage.completionTokens === 'number' &&
    claudeMessage.completionTokens >= 0 &&
    typeof claudeMessage.promptTokens === 'number' &&
    claudeMessage.promptTokens >= 0
  );
};

// Additional type guards for context validation
export const isMayaChatContext = (obj: unknown): obj is MayaChatContext => {
  if (!obj || typeof obj !== 'object') return false;
  
  const context = obj as any; // Use any to avoid conversion issues
  
  return (
    typeof context.userId === 'string' &&
    context.userId.length > 0 &&
    typeof context.sessionId === 'string' &&
    context.sessionId.length > 0 &&
    Array.isArray(context.messageHistory) &&
    context.messageHistory.every((msg: unknown) => isMayaChatMessage(msg)) &&
    // Optional fields validation
    (context.personalStyle === undefined || (
      typeof context.personalStyle === 'object' &&
      context.personalStyle !== null &&
      Array.isArray((context.personalStyle as any).preferences) &&
      Array.isArray((context.personalStyle as any).recentChoices) &&
      Array.isArray((context.personalStyle as any).favoriteCategories)
    )) &&
    (context.brandContext === undefined || isBrandContext(context.brandContext))
  );
};

export const isBrandContext = (obj: unknown): obj is BrandContext => {
  if (!obj || typeof obj !== 'object') return false;
  
  const brand = obj as any; // Use any to avoid conversion issues
  
  return (
    // All fields are optional, so we just need to validate their types when present
    (brand.name === undefined || typeof brand.name === 'string') &&
    (brand.style === undefined || typeof brand.style === 'string') &&
    (brand.industry === undefined || typeof brand.industry === 'string') &&
    (brand.targetAudience === undefined || typeof brand.targetAudience === 'string') &&
    (brand.personalityTraits === undefined || Array.isArray(brand.personalityTraits)) &&
    (brand.stylePreferences === undefined || Array.isArray(brand.stylePreferences))
  );
};

export const isChatAPIRequest = (obj: unknown): obj is ChatAPIRequest => {
  if (!obj || typeof obj !== 'object') return false;
  
  const request = obj as any; // Use any to avoid conversion issues
  
  return (
    typeof request.message === 'string' &&
    request.message.length > 0 &&
    typeof request.userId === 'string' &&
    request.userId.length > 0 &&
    (request.sessionId === undefined || typeof request.sessionId === 'string') &&
    (request.context === undefined || (typeof request.context === 'object' && request.context !== null))
  );
};

export const isChatAPIResponse = (obj: unknown): obj is ChatAPIResponse => {
  if (!obj || typeof obj !== 'object') return false;
  
  const response = obj as any; // Use any to avoid conversion issues
  
  return (
    typeof response.message === 'string' &&
    typeof response.messageId === 'string' &&
    response.messageId.length > 0 &&
    typeof response.conversationId === 'string' &&
    response.conversationId.length > 0 &&
    response.timestamp instanceof Date &&
    (response.metadata === undefined || (typeof response.metadata === 'object' && response.metadata !== null))
  );
};

// Validation helpers for safe data access
export function validateChatMessage(obj: unknown, strict: boolean = false): { 
  valid: boolean; 
  error?: string; 
  data?: BaseChatMessage 
} {
  try {
    if (!isChatMessage(obj)) {
      return { 
        valid: false, 
        error: 'Invalid chat message format or missing required fields' 
      };
    }

    if (strict) {
      const message = obj as BaseChatMessage;
      if (!message.content.trim()) {
        return { 
          valid: false, 
          error: 'Message content cannot be empty' 
        };
      }
    }

    return { valid: true, data: obj };
  } catch (error) {
    return { 
      valid: false, 
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export function validateMayaChatMessage(obj: unknown, strict: boolean = false): { 
  valid: boolean; 
  error?: string; 
  data?: MayaChatMessage 
} {
  try {
    if (!isMayaChatMessage(obj)) {
      return { 
        valid: false, 
        error: 'Invalid Maya chat message format or missing required fields' 
      };
    }

    if (strict) {
      const message = obj as MayaChatMessage;
      if (!message.content.trim()) {
        return { 
          valid: false, 
          error: 'Message content cannot be empty' 
        };
      }
      if (!message.chatId.trim() || !message.userId.trim()) {
        return { 
          valid: false, 
          error: 'Chat ID and User ID cannot be empty' 
        };
      }
    }

    return { valid: true, data: obj };
  } catch (error) {
    return { 
      valid: false, 
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}