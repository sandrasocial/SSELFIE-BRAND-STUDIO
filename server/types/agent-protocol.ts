/**
 * Type definitions for agent protocol
 */

import { Request } from 'express';
import { AuthenticatedUser } from '../../api/_shared/auth-types.js';

/** Agent protocol registration data */
export interface AgentProtocolRegistration {
  protocol: string;
  version: string;
  data?: Record<string, unknown>;
}

/** Agent capabilities */
export interface AgentCapabilities {
  agentId: string;
  capabilities: string[];
  metadata?: Record<string, unknown>;
}

/** Agent message */
export interface AgentMessage {
  agentId: string;
  message: string;
  type?: 'text' | 'command' | 'event';
}

/** Agent details */
export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  capabilities?: string[];
  metadata?: Record<string, unknown>;
  lastSeen?: string;
}

/** Agent status */
export interface AgentStatus {
  agentId: string;
  status: 'active' | 'inactive' | 'error';
  lastSeen: string;
  metadata?: Record<string, unknown>;
}

/** Agent update data */
export interface AgentUpdate {
  name?: string;
  status?: Agent['status'];
  config?: Record<string, unknown>;
}

/** Authenticated request with user */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/** Success response data */
export interface SuccessResponse<T> {
  data: T;
  message?: string;
}

/** Error response data */
export interface ErrorResponse {
  error: string;
  details?: unknown;
}