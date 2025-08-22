import { Pool } from 'pg';
import { config } from '../config';

export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool(config.database);
  }

  public static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }

  async logSecurityEvent(eventType: string, userId: string, details: any): Promise<void> {
    try {
      await this.pool.query(
        'INSERT INTO security_audit_logs (event_type, user_id, event_details, timestamp, ip_address) VALUES ($1, $2, $3, NOW(), $4)',
        [eventType, userId, JSON.stringify(details), details.ipAddress]
      );
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async logSuspiciousActivity(userId: string, activityType: string, severity: string, details: any): Promise<void> {
    try {
      await this.pool.query(
        'INSERT INTO suspicious_activities (user_id, activity_type, severity, details, detected_at) VALUES ($1, $2, $3, $4, NOW())',
        [userId, activityType, severity, JSON.stringify(details)]
      );
    } catch (error) {
      console.error('Failed to log suspicious activity:', error);
    }
  }

  async getRecentSecurityEvents(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM security_audit_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
        [userId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Failed to retrieve security events:', error);
      return [];
    }
  }
}

export const securityLogger = SecurityAuditLogger.getInstance();