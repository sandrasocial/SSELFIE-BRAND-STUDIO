export interface MayaChatCreateInput {
  title: string;
  description?: string;
  initialMessage?: string;
  contextId?: string;
  purpose?: string;
  mode?: 'standard' | 'creative' | 'factual';
}

export interface MayaChatMessage {
  id: string;
  chatId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}