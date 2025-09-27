import { type AgentConversation, type AgentMessage } from '../../shared/types/agent.js';
import { type User } from '../../shared/schema.js';

export interface UserUsageStats {
  totalGenerations: number;
  remainingGenerations: number;
  totalImageCount: number;
  hasVideoAccess: boolean;
  hasWebAccess: boolean;
  plan: string;
  role: string;
  monthlyLimit: number;
  generationsThisMonth: number;
  lastReset: Date | null;
}