import { type BaseChatMessage } from '../../shared/types/unified-chat.js';

export interface ClaudeMessage extends BaseChatMessage {
  id: string;
  conversationId: string;
  timestamp: Date;
  role: 'user' | 'assistant' | 'system';
  metadata?: Record<string, unknown>;
}

export interface ClaudeConversation {
  id: string;
  userId: string;
  agentName: string;
  conversationId: string;
  title: string | null;
  status: string | null;
  lastMessageAt: Date | null;
  messageCount: number | null;
  context: Record<string, unknown>;
  adminBypassEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}