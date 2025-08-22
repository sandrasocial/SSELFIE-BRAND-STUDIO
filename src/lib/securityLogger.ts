import { pool } from '../config/db';
import { securityConfig } from '../config/security';

export async function logSecurityEvent(eventData: {
    eventType: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    requestMethod?: string;
    requestPath?: string;
    requestBody?: any;
    responseStatus?: number;
    additionalData?: any;
}) {
    try {
        const query = `
            INSERT INTO security_audit_logs (
                event_type, user_id, ip_address, user_agent,
                request_method, request_path, request_body,
                response_status, additional_data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        
        const values = [
            eventData.eventType,
            eventData.userId,
            eventData.ipAddress,
            eventData.userAgent,
            eventData.requestMethod,
            eventData.requestPath,
            eventData.requestBody,
            eventData.responseStatus,
            eventData.additionalData
        ];

        await pool.query(query, values);
    } catch (error) {
        console.error('Security logging error:', error);
        // Fallback to file logging if database fails
        securityConfig.audit.enabled && 
            require('fs').appendFileSync(
                securityConfig.audit.logPath,
                JSON.stringify({ ...eventData, timestamp: new Date() }) + '\n'
            );
    }
}