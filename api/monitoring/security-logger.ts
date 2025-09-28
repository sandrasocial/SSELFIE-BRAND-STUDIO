import { SecurityEvent, SecurityEventType, SecurityEventSeverity } from '../../shared/security/types.js';
import winston from 'winston';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security-combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

/**
 * Security logger service
 */
class SecurityLogger {
  /**
   * Log a security event
   */
  log(event: SecurityEvent) {
    const level = this.getSeverityLevel(event.severity);
    
    logger.log({
      level,
      ...event,
      timestamp: event.timestamp || new Date(),
    });

    // Alert on high severity events
    if (event.severity === SecurityEventSeverity.HIGH || 
        event.severity === SecurityEventSeverity.CRITICAL) {
      this.alert(event);
    }
  }

  /**
   * Send alert for critical security events
   */
  private async alert(event: SecurityEvent) {
    const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      logger.error('Failed to send security alert', { error, event });
    }
  }

  /**
   * Map security event severity to Winston log level
   */
  private getSeverityLevel(severity: SecurityEventSeverity): string {
    switch (severity) {
      case SecurityEventSeverity.CRITICAL:
        return 'error';
      case SecurityEventSeverity.HIGH:
        return 'warn';
      case SecurityEventSeverity.MEDIUM:
        return 'info';
      case SecurityEventSeverity.LOW:
        return 'debug';
      default:
        return 'info';
    }
  }
}

export const securityLogger = new SecurityLogger();