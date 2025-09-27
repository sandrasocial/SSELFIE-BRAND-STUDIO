import { type AgentConversation, type AgentMessage } from '../../shared/types/agent';
import { type User } from '../../shared/schema';

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