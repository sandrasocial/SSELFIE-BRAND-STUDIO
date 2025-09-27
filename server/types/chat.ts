import { type User } from '../../shared/types/user';

export interface MayaChatCreateInput {
  userId: string;
  chatTitle: string;
  initialMessage?: string;
}

import type { BaseChatMessage } from '../../shared/types/unified-chat';

export type ChatMessageRole = BaseChatMessage['role'];

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