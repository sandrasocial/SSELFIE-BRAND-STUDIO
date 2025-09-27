/** Claude conversation */
export interface ClaudeConversation {
  id: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  contextType: string;
  contextData: Record<string, unknown>;
  title: string;
  summary: string;
  status: string;
}

/** Claude message */
export interface ClaudeMessage {
  id: number;
  conversationId: number;
  createdAt: Date;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  status: string;
  version: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  finishReason: string;
}