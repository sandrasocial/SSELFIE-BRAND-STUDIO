import type { ChatMessage } from './chat-message.js';

export interface ConversationData {
  messages: ChatMessage[];
  id: string;
  userId: string;
  lastMessageAt: string;
  status: 'active' | 'archived' | 'deleted';
}