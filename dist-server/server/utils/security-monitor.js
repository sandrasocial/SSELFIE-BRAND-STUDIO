import { Logger } from './logger.js';
export class SecurityMonitor {
    logger;
    events;
    maxEvents;
    isEnabled;
    blockedIPs;
    suspiciousIPs;
    rateLimitTracker;
    constructor(maxEvents = 10000) {
        this.logger = new Logger('SecurityMonitor');
        this.events = [];
        this.maxEvents = maxEvents;
        this.isEnabled = true;
        this.blockedIPs = new Set();
        this.suspiciousIPs = new Map();
        this.rateLimitTracker = new Map();
    }
    monitorRequest(req, res) {
        if (!this.isEnabled) {
            return;
        }
        const ip = req.ip || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        const userId = req.user?.id;
        const sessionId = req.sessionID;
        if (this.blockedIPs.has(ip)) {
            this.logSecurityEvent({
                type: 'unauthorized_access',
                severity: 'high',
                description: 'Blocked IP attempted access',
                source: { ip, userAgent, userId, sessionId },
                details: {
                    endpoint: req.path,
                    method: req.method,
                    requestBody: req.body,
                    queryParams: req.query,
                    headers: req.headers,
                    responseCode: 403,
                    attackVector: 'blocked_ip',
                },
                riskScore: 90,
                blocked: true,
                actionTaken: 'Request blocked - IP in blocklist',
            });
            return;
        }
        const threats = this.detectThreats(req);
        if (threats.length > 0) {
            const highestThreat = threats.reduce((prev, current) => current.riskScore > prev.riskScore ? current : prev);
            this.logSecurityEvent({
                type: highestThreat.type,
                severity: highestThreat.severity,
                description: highestThreat.description,
                source: { ip, userAgent, userId, sessionId },
                details: {
                    endpoint: req.path,
                    method: req.method,
                    requestBody: req.body,
                    queryParams: req.query,
                    headers: req.headers,
                    responseCode: res.statusCode,
                    attackVector: highestThreat.attackVector,
                    payload: highestThreat.payload,
                },
                riskScore: highestThreat.riskScore,
                blocked: highestThreat.blocked,
                actionTaken: highestThreat.actionTaken,
            });
            this.updateSuspiciousIP(ip, highestThreat.riskScore);
        }
        this.checkRateLimit(ip, req.path);
    }
    detectThreats(req) {
        const threats = [];
        const { path, method, body, query, headers } = req;
        const requestString = JSON.stringify({ path, method, body, query, headers }).toLowerCase();
        const userAgent = req.get('User-Agent') || 'unknown';
        const sqlPatterns = [
            /union\s+select/i,
            /drop\s+table/i,
            /insert\s+into/i,
            /delete\s+from/i,
            /update\s+set/i,
            /or\s+1\s*=\s*1/i,
            /and\s+1\s*=\s*1/i,
            /';\s*drop/i,
            /--\s*$/i,
            /\/\*.*\*\//i,
        ];
        for (const pattern of sqlPatterns) {
            if (pattern.test(requestString)) {
                threats.push({
                    type: 'injection_attempt',
                    severity: 'high',
                    description: 'SQL injection attempt detected',
                    riskScore: 85,
                    blocked: true,
                    actionTaken: 'Request blocked - SQL injection detected',
                    attackVector: 'sql_injection',
                    payload: this.extractPayload(requestString, pattern),
                });
            }
        }
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe[^>]*>/i,
            /<object[^>]*>/i,
            /<embed[^>]*>/i,
            /<link[^>]*>/i,
            /<meta[^>]*>/i,
        ];
        for (const pattern of xssPatterns) {
            if (pattern.test(requestString)) {
                threats.push({
                    type: 'injection_attempt',
                    severity: 'high',
                    description: 'XSS attempt detected',
                    riskScore: 80,
                    blocked: true,
                    actionTaken: 'Request blocked - XSS detected',
                    attackVector: 'xss',
                    payload: this.extractPayload(requestString, pattern),
                });
            }
        }
        const pathTraversalPatterns = [
            /\.\.\//g,
            /\.\.\\/g,
            /%2e%2e%2f/gi,
            /%2e%2e%5c/gi,
        ];
        for (const pattern of pathTraversalPatterns) {
            if (pattern.test(requestString)) {
                threats.push({
                    type: 'malicious_request',
                    severity: 'medium',
                    description: 'Path traversal attempt detected',
                    riskScore: 70,
                    blocked: true,
                    actionTaken: 'Request blocked - Path traversal detected',
                    attackVector: 'path_traversal',
                    payload: this.extractPayload(requestString, pattern),
                });
            }
        }
        const commandPatterns = [
            /;\s*rm\s+-rf/i,
            /;\s*cat\s+\/etc\/passwd/i,
            /;\s*ls\s+-la/i,
            /;\s*whoami/i,
            /;\s*id/i,
            /;\s*uname/i,
            /;\s*ps\s+aux/i,
            /;\s*netstat/i,
        ];
        for (const pattern of commandPatterns) {
            if (pattern.test(requestString)) {
                threats.push({
                    type: 'injection_attempt',
                    severity: 'critical',
                    description: 'Command injection attempt detected',
                    riskScore: 95,
                    blocked: true,
                    actionTaken: 'Request blocked - Command injection detected',
                    attackVector: 'command_injection',
                    payload: this.extractPayload(requestString, pattern),
                });
            }
        }
        const suspiciousUserAgents = [
            /sqlmap/i,
            /nikto/i,
            /nmap/i,
            /masscan/i,
            /zap/i,
            /burp/i,
            /w3af/i,
            /havij/i,
            /acunetix/i,
            /nessus/i,
        ];
        for (const pattern of suspiciousUserAgents) {
            if (pattern.test(userAgent)) {
                threats.push({
                    type: 'suspicious_activity',
                    severity: 'medium',
                    description: 'Suspicious user agent detected',
                    riskScore: 60,
                    blocked: false,
                    actionTaken: 'Request flagged - Suspicious user agent',
                    attackVector: 'suspicious_user_agent',
                });
            }
        }
        if (this.isUnusualRequest(req)) {
            threats.push({
                type: 'suspicious_activity',
                severity: 'low',
                description: 'Unusual request pattern detected',
                riskScore: 40,
                blocked: false,
                actionTaken: 'Request flagged - Unusual pattern',
                attackVector: 'unusual_pattern',
            });
        }
        return threats;
    }
    isUnusualRequest(req) {
        const { path, method, headers } = req;
        const unusualHeaders = [
            'x-forwarded-for',
            'x-real-ip',
            'x-originating-ip',
            'x-remote-ip',
            'x-remote-addr',
        ];
        const hasUnusualHeaders = unusualHeaders.some(header => headers[header] && headers[header] !== req.ip);
        const unusualPaths = [
            /\.\./,
            /\/admin/,
            /\/wp-admin/,
            /\/phpmyadmin/,
            /\/adminer/,
            /\/\.env/,
            /\/config/,
            /\/backup/,
        ];
        const hasUnusualPath = unusualPaths.some(pattern => pattern.test(path));
        const unusualMethods = ['TRACE', 'OPTIONS', 'CONNECT'];
        const hasUnusualMethod = unusualMethods.includes(method);
        return hasUnusualHeaders || hasUnusualPath || hasUnusualMethod;
    }
    extractPayload(requestString, pattern) {
        const match = pattern.exec(requestString);
        return match ? match[0] : '';
    }
    checkRateLimit(ip, endpoint) {
        const key = `${ip}:${endpoint}`;
        const now = Date.now();
        const windowMs = 60 * 1000;
        const maxRequests = 100;
        const current = this.rateLimitTracker.get(key);
        if (!current) {
            this.rateLimitTracker.set(key, { count: 1, resetTime: now + windowMs });
            return;
        }
        if (now > current.resetTime) {
            this.rateLimitTracker.set(key, { count: 1, resetTime: now + windowMs });
            return;
        }
        current.count++;
        if (current.count > maxRequests) {
            this.logSecurityEvent({
                type: 'rate_limit_exceeded',
                severity: 'medium',
                description: `Rate limit exceeded for ${endpoint}`,
                source: { ip },
                details: {
                    endpoint,
                    attackVector: 'rate_limit_exceeded',
                },
                riskScore: 50,
                blocked: true,
                actionTaken: 'Request blocked - Rate limit exceeded',
            });
            this.blockedIPs.add(ip);
            setTimeout(() => {
                this.blockedIPs.delete(ip);
            }, 15 * 60 * 1000);
        }
    }
    updateSuspiciousIP(ip, riskScore) {
        const current = this.suspiciousIPs.get(ip);
        if (current) {
            current.count++;
            current.lastSeen = new Date();
            current.riskScore = Math.max(current.riskScore, riskScore);
        }
        else {
            this.suspiciousIPs.set(ip, {
                count: 1,
                lastSeen: new Date(),
                riskScore,
            });
        }
        if (riskScore > 80) {
            this.blockedIPs.add(ip);
            this.logger.warn('IP blocked due to high risk score', { ip, riskScore });
        }
    }
    logSecurityEvent(eventData) {
        const event = {
            timestamp: new Date().toISOString(),
            eventId: this.generateEventId(),
            environment: process.env['NODE_ENV'] || 'development',
            version: process.env.npm_package_version || '1.0.0',
            ...eventData,
        };
        if (this.events.length >= this.maxEvents) {
            this.events.shift();
        }
        this.events.push(event);
        this.logger.warn('Security event detected', {
            eventId: event.eventId,
            type: event.type,
            severity: event.severity,
            description: event.description,
            source: event.source,
            riskScore: event.riskScore,
            blocked: event.blocked,
        });
        if (event.severity === 'critical' || event.riskScore > 90) {
            this.sendSecurityAlert(event);
        }
    }
    generateEventId() {
        return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async sendSecurityAlert(event) {
        try {
            if (process.env.SLACK_WEBHOOK_URL) {
                await fetch(process.env.SLACK_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: '🚨 Security Alert',
                        attachments: [{
                                color: 'danger',
                                fields: [
                                    { title: 'Event ID', value: event.eventId, short: true },
                                    { title: 'Type', value: event.type, short: true },
                                    { title: 'Severity', value: event.severity, short: true },
                                    { title: 'Description', value: event.description, short: false },
                                    { title: 'Source IP', value: event.source.ip, short: true },
                                    { title: 'Risk Score', value: event.riskScore.toString(), short: true },
                                    { title: 'Blocked', value: event.blocked ? 'Yes' : 'No', short: true },
                                    { title: 'Action', value: event.actionTaken, short: false },
                                ],
                            }],
                    }),
                });
            }
            if (process.env.SECURITY_EMAIL) {
                this.logger.info('Security alert email sent', { eventId: event.eventId });
            }
        }
        catch (error) {
            this.logger.error('Failed to send security alert', { error });
        }
    }
    getSecurityStats(timeWindow) {
        const now = Date.now();
        const windowMs = timeWindow ? timeWindow * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const cutoffTime = now - windowMs;
        const recentEvents = this.events.filter(event => new Date(event.timestamp).getTime() > cutoffTime);
        if (recentEvents.length === 0) {
            return {
                totalEvents: 0,
                eventsByType: {},
                eventsBySeverity: {},
                eventsBySource: {},
                blockedRequests: 0,
                riskScoreDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
                topAttackVectors: [],
                topSourceIPs: [],
            };
        }
        const totalEvents = recentEvents.length;
        const blockedRequests = recentEvents.filter(e => e.blocked).length;
        const eventsByType = {};
        recentEvents.forEach(event => {
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        });
        const eventsBySeverity = {};
        recentEvents.forEach(event => {
            eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
        });
        const eventsBySource = {};
        recentEvents.forEach(event => {
            eventsBySource[event.source.ip] = (eventsBySource[event.source.ip] || 0) + 1;
        });
        const riskScoreDistribution = {
            low: recentEvents.filter(e => e.riskScore <= 25).length,
            medium: recentEvents.filter(e => e.riskScore > 25 && e.riskScore <= 50).length,
            high: recentEvents.filter(e => e.riskScore > 50 && e.riskScore <= 75).length,
            critical: recentEvents.filter(e => e.riskScore > 75).length,
        };
        const attackVectorCounts = new Map();
        recentEvents.forEach(event => {
            if (event.details.attackVector) {
                const existing = attackVectorCounts.get(event.details.attackVector) || { count: 0, lastSeen: event.timestamp };
                attackVectorCounts.set(event.details.attackVector, {
                    count: existing.count + 1,
                    lastSeen: event.timestamp > existing.lastSeen ? event.timestamp : existing.lastSeen,
                });
            }
        });
        const topAttackVectors = Array.from(attackVectorCounts.entries())
            .map(([vector, data]) => ({
            vector,
            count: data.count,
            lastSeen: data.lastSeen,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const sourceIPCounts = new Map();
        recentEvents.forEach(event => {
            const existing = sourceIPCounts.get(event.source.ip) || { count: 0, riskScore: 0, lastSeen: event.timestamp };
            sourceIPCounts.set(event.source.ip, {
                count: existing.count + 1,
                riskScore: Math.max(existing.riskScore, event.riskScore),
                lastSeen: event.timestamp > existing.lastSeen ? event.timestamp : existing.lastSeen,
            });
        });
        const topSourceIPs = Array.from(sourceIPCounts.entries())
            .map(([ip, data]) => ({
            ip,
            count: data.count,
            riskScore: data.riskScore,
            lastSeen: data.lastSeen,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            totalEvents,
            eventsByType,
            eventsBySeverity,
            eventsBySource,
            blockedRequests,
            riskScoreDistribution,
            topAttackVectors,
            topSourceIPs,
        };
    }
    getBlockedIPs() {
        return Array.from(this.blockedIPs);
    }
    getSuspiciousIPs() {
        return Array.from(this.suspiciousIPs.entries()).map(([ip, data]) => ({
            ip,
            ...data,
        }));
    }
    blockIP(ip, reason) {
        this.blockedIPs.add(ip);
        this.logger.warn('IP blocked manually', { ip, reason });
    }
    unblockIP(ip) {
        this.blockedIPs.delete(ip);
        this.logger.info('IP unblocked manually', { ip });
    }
    clearOldEvents(olderThanHours = 168) {
        const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
        const initialLength = this.events.length;
        this.events = this.events.filter(event => new Date(event.timestamp).getTime() > cutoffTime);
        const removedCount = initialLength - this.events.length;
        if (removedCount > 0) {
            this.logger.info(`Cleared ${removedCount} old security events`);
        }
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.logger.info(`Security monitoring ${enabled ? 'enabled' : 'disabled'}`);
    }
    getEventsCount() {
        return this.events.length;
    }
    exportEvents() {
        return [...this.events];
    }
}
export const securityMonitor = new SecurityMonitor();
//# sourceMappingURL=security-monitor.js.map