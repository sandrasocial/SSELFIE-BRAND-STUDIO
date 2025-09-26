import { type User } from '../../shared/types/user.js';

export interface MayaChatCreateInput {
  userId: string;
  chatTitle: string;
  initialMessage?: string;
}

export interface MayaChatMessageInput {
  chatId: number;
  content: string;
  role: ChatMessageRole;
  imagePreview?: string | null;
  generatedPrompt?: string | null;
  conceptCards?: Record<string, unknown>[] | null;
  quickButtons?: string[] | null;
}

export type ChatMessageRole = 'user' | 'maya' | 'assistant' | 'system';

export interface ChatMessage extends MayaChatMessageInput {
  id: number;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

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

export type ChatMessageInput = Omit<ChatMessage, 'id' | 'createdAt'>;
export type GalleryImageInput = Omit<GalleryImage, 'id' | 'createdAt'>;

export interface ChatPreviewError {
  type: 'save_preview' | 'heart_image';
  message: string;
  chatId?: number;
  userId?: string;
  imageUrl?: string;
  error?: Error;
}