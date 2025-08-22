import { db } from '../db';

export class SecurityAuditLogger {
  static async logLoginAttempt(userId: string, success: boolean, ipAddress: string) {
    try {
      await db.query(
        'INSERT INTO login_attempts (user_id, success, ip_address, timestamp) VALUES ($1, $2, $3, NOW())',
        [userId, success, ipAddress]
      );
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  }

  static async logSecurityEvent(eventType: string, userId: string, details: any) {
    try {
      await db.query(
        'INSERT INTO security_audit_logs (event_type, user_id, details, timestamp) VALUES ($1, $2, $3, NOW())',
        [eventType, userId, JSON.stringify(details)]
      );
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  static async getLoginAttempts(userId: string, minutes: number = 30) {
    try {
      const result = await db.query(
        'SELECT * FROM login_attempts WHERE user_id = $1 AND timestamp > NOW() - INTERVAL \'$2 minutes\'',
        [userId, minutes]
      );
      return result.rows;
    } catch (error) {
      console.error('Failed to get login attempts:', error);
      return [];
    }
  }

  static async checkRateLimit(userId: string, maxAttempts: number = 5, windowMinutes: number = 30): Promise<boolean> {
    const attempts = await this.getLoginAttempts(userId, windowMinutes);
    const failedAttempts = attempts.filter(attempt => !attempt.success);
    return failedAttempts.length >= maxAttempts;
  }
}