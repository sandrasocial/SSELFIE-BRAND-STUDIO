import { type User } from '../../shared/types/user.js';

export interface MayaChatCreateInput {
  userId: string;
  chatTitle: string;
  initialMessage?: string;
  metadata?: Record<string, unknown>;
}

// Base chat message interface
export interface BaseChatMessage {
  id: string;
  content: string;
  role: string;
  timestamp: Date;
  context?: string;
  metadata?: Record<string, unknown>;
}

// Victoria message type
export interface VictoriaMessage extends BaseChatMessage {
  role: 'victoria';
}

// User message type
export interface UserMessage extends BaseChatMessage {
  role: 'user';
}

// Database Claude message type
export interface DbClaudeMessage {
  id: number;
  role: string;
  metadata?: unknown;
  content: string;
  createdAt?: Date | null;
  conversationId: string;
  toolCalls?: unknown;
  toolResults?: unknown;
  timestamp?: Date | null;
}

// Claude message type
export interface ClaudeMessage extends Omit<BaseChatMessage, 'id'>, Omit<DbClaudeMessage, 'metadata'> {
  role: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export type ChatMessageRole = 'user' | 'victoria' | 'claude' | 'system';

// Base server chat types (using numeric IDs)
export interface ServerChatMessageInput {
  chatId: number;
  content: string;
  role: ChatMessageRole;
  userId: string;
  imagePreview?: string | null;
  generatedPrompt?: string | null;
  conceptCards?: Record<string, unknown>[] | null;
  quickButtons?: string[] | null;
  metadata?: Record<string, unknown>;
}

export interface ServerChatMessage extends ServerChatMessageInput {
  id: number;
  createdAt: Date;
}

export type ServerChatMessageCreate = Omit<ServerChatMessage, 'id' | 'createdAt'>;
export type ServerChatMessageUpdate = Partial<ServerChatMessageCreate> & { id: number };

export interface GalleryImage {
  id: number;
  userId: string;
  imageUrl: string;
  prompt: string;
  style: string;
  generationStatus: 'pending' | 'processing' | 'completed' | 'failed';
  predictionId: string;
  isSelected: boolean;
  isFavorite: boolean;
  createdAt?: Date;
  metadata?: Record<string, unknown>;
}

export type GalleryImageInput = Omit<GalleryImage, 'id' | 'createdAt'>;

export interface ChatPreviewError {
  type: 'save_preview' | 'heart_image';
  message: string;
  chatId?: number;
  userId?: string;
  imageUrl?: string;
  error?: Error;
}