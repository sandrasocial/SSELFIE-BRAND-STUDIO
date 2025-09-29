import { sendEmail } from '../utils/email-service.js';
export class EscalationHandler {
    async handleEscalation(request) {
        try {
            const conversationText = request.conversationHistory
                .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
                .join('\n\n');
            const emailContent = `
MAYA SUPPORT ESCALATION REQUEST

USER: ${request.userName} (${request.userEmail})
REASON: ${request.reason}
TIME: ${new Date().toISOString()}

USER CONTEXT:
${request.userContext || 'No additional context available'}

CONVERSATION HISTORY:
${conversationText}

---
Please follow up with this user within 24 hours.
Login to admin panel for full user details: ${process.env.APP_URL}/admin
`;
            const emailSent = await sendEmail({
                to: 'ssa@ssasocial.com',
                subject: `🚨 Maya Support Escalation: ${request.reason}`,
                content: emailContent,
                priority: 'high'
            });
            if (emailSent) {
                await this.logEscalation(request);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Escalation handler error:', error);
            return false;
        }
    }
    async logEscalation(request) {
        try {
            console.log('📊 SUPPORT ESCALATION LOGGED:', {
                userId: request.userId,
                reason: request.reason,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Failed to log escalation:', error);
        }
    }
    static detectEscalationTriggers(message) {
        const triggers = [
            { pattern: /refund|money back|cancel subscription|billing issue/i, reason: 'Billing Issue' },
            { pattern: /training fail|model not working|technical error/i, reason: 'Technical Issue' },
            { pattern: /frustrated|angry|urgent|asap|immediate/i, reason: 'Priority Support' },
            { pattern: /business strategy|feature request|roadmap/i, reason: 'Strategic Guidance' }
        ];
        for (const trigger of triggers) {
            if (trigger.pattern.test(message)) {
                return trigger.reason;
            }
        }
        return null;
    }
}
export const escalationHandler = new EscalationHandler();
//# sourceMappingURL=escalation-handler.js.map