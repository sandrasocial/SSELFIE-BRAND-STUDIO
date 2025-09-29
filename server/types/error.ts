import { Request, Response } from 'express';

export interface ErrorDetails {
  req?: Request;
  res?: Response;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'validation' | 'authentication' | 'authorization' | 'database' | 'network' | 'system';
  additionalData?: Record<string, unknown>;
}

export interface ErrorEvent {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  details: ErrorDetails;
}

export interface ErrorTrackingConfig {
  enabled: boolean;
  logToConsole: boolean;
  logToFile: boolean;
  notifySlack: boolean;
  notifyEmail: boolean;
  minimumSeverity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorStats {
  total: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byTimeWindow: {
    lastHour: number;
    last24Hours: number;
    last7Days: number;
  };
}

export interface ErrorNotification {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: Record<string, unknown>;
  notificationTargets: Array<'slack' | 'email' | 'console'>;
}

export interface ErrorHandlerConfig {
  trackingEnabled: boolean;
  notificationsEnabled: boolean;
  minimumNotificationSeverity: 'low' | 'medium' | 'high' | 'critical';
  errorLogPath?: string;
  slackWebhookUrl?: string;
  errorEmailRecipients?: string[];
}