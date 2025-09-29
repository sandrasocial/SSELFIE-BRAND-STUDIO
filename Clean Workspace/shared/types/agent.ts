export interface AgentConversation {
  id: string;
  agentId: string;
  userId: string;
  messages: AgentMessage[];
  startedAt: Date;
  endedAt?: Date;
  metadata: Record<string, unknown>;
}

export interface AgentMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ClaudeConversation extends AgentConversation {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ClaudeMessage extends AgentMessage {
  tokens: number;
  completionTokens: number;
  promptTokens: number;
}