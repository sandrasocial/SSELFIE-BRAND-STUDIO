// Base type interfaces
export interface BaseUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  plan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseModelConfig {
  modelType: string;
  version: string;
  parameters: Record<string, unknown>;
}

export interface BaseStorageConfig {
  type: 'local' | 's3' | 'cloudflare';
  bucket?: string;
  region?: string;
  endpoint?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

export interface BaseServiceConfig {
  enabled: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  maxRetries?: number;
  timeoutMs?: number;
}

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'error' | 'completed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Environment = 'development' | 'staging' | 'production';