export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  imagePreview?: string | null;
  generatedPrompt?: string | null;
  createdAt: Date;
}

export interface GalleryImage {
  id: string;
  userId: string;
  createdAt: Date;
  imageUrl: string;
  prompt: string;
  style: string;
  predictionId: string;
  generationStatus: 'completed' | 'pending' | 'processing' | 'failed';
  isSelected?: boolean;
  isFavorite?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ChatMessageInput {
  chatId: number;
  content: string;
  role: 'user' | 'assistant' | 'system';
  userId: string;
  imagePreview?: string | null;
  generatedPrompt?: string | null;
}

export interface GalleryImageInput {
  userId: string;
  generatedPrompt: string;
  imageUrl: string;
  prompt: string;
  style: string;
  category: string;
  source: string;
  predictionId: string;
  generationStatus: 'completed' | 'pending' | 'processing' | 'failed';
  isSelected?: boolean;
  isFavorite?: boolean;
}

export interface ChatPreviewError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  conceptCards?: Record<string, unknown>[] | null;
  quickButtons?: string[] | null;
  metadata?: Record<string, unknown>;
}

export interface GalleryImageInput {
  userId: string;
  imageUrl: string;
  prompt: string;
  style: string;
  generationStatus: 'pending' | 'processing' | 'completed' | 'failed';
  predictionId: string;
  isSelected?: boolean;
  isFavorite?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ServerChatMessage {
  id: number;
  chatId: number;
  userId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: Date;
}

export type ServerChatMessageCreate = Omit<ServerChatMessage, 'id' | 'createdAt'>;
export type ServerChatMessageUpdate = Partial<ServerChatMessageCreate> & { id: number };





