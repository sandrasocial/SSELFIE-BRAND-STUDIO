/**
 * PHASE 5: Smart Escalation Handler
 * Manages email handoffs and escalation triggers for Maya Support
 */

import { sendEmail } from '../utils/email-service';

export interface EscalationRequest {
  userId: string;
  userEmail: string;
  userName: string;
  reason: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  userContext?: string;
}

export class EscalationHandler {
  
  /**
   * Process escalation request and send email to Sandra
   */
  async handleEscalation(request: EscalationRequest): Promise<boolean> {
    try {
      // Format conversation history for email
      const conversationText = request.conversationHistory
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');

      // Email content for Sandra
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

      // Send escalation email to Sandra
      const emailSent = await sendEmail({
        to: 'ssa@ssasocial.com', // Sandra's email
        subject: `🚨 Maya Support Escalation: ${request.reason}`,
        content: emailContent,
        priority: 'high'
      });

      if (emailSent) {
        // Log escalation for analytics
        await this.logEscalation(request);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Escalation handler error:', error);
      return false;
    }
  }

  /**
   * Log escalation for support analytics
   */
  private async logEscalation(request: EscalationRequest): Promise<void> {
    try {
      // Simple logging to console for now
      // In production, this would go to analytics service
      console.log('📊 SUPPORT ESCALATION LOGGED:', {
        userId: request.userId,
        reason: request.reason,
        timestamp: new Date().toISOString()
      });
      
      // Future: Send to analytics service
      // await analyticsService.track('support_escalation', { ... });
    } catch (error) {
      console.error('Failed to log escalation:', error);
    }
  }

  /**
   * Check if message contains escalation triggers
   */
  static detectEscalationTriggers(message: string): string | null {
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