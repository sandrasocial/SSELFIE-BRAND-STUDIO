/**
 * Agent Protocol Type Definitions
 */

import { Request } from 'express';
import { DatabaseUser } from './auth-types.js';

export interface AgentProtocolRegistration {
  protocol: string;
  version: string;
  data?: Record<string, unknown>;
}

export interface AgentCapabilities {
  id: string;
  name: string;
  version: string;
  protocols: string[];
  capabilities: {
    canChat: boolean;
    canGenerate: boolean;
    canAnalyze: boolean;
    canPlan: boolean;
    supportedFormats: string[];
  };
  canGenerateImages: boolean;
  canProcessText: boolean;
  canAnalyzeData: boolean;
  supportedFormats: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentMessage {
  id: string;
  type: string;
  content: string | Record<string, unknown>;
  timestamp: Date;
  agentId: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  capabilities: AgentCapabilities;
  lastActivity: Date;
}

export interface AgentStatus {
  state: 'active' | 'inactive' | 'error' | 'maintenance';
  status: 'active' | 'inactive' | 'busy' | 'error';
  message?: string;
  lastUpdate: Date;
  lastActivity?: string;
  health: {
    cpu: number;
    memory: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  errorMessage?: string;
}

export interface AgentUpdate {
  status?: AgentStatus;
  capabilities?: AgentCapabilities;
  metadata?: Record<string, unknown>;
}

export interface AuthenticatedRequest extends Request {
  user: DatabaseUser;
}

export interface SuccessResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}