import { db } from '../drizzle.js';
import { approvalQueue, agentHandoffRequests } from '../../shared/schema.js';
export class ApprovalService {
    static async requestApproval(agentId, userId, content) {
        const approval = await db.insert(approvalQueue).values({
            userId,
            agentId,
            contentType: content.type,
            contentTitle: content.title,
            contentPreview: content.preview,
            fullContent: content,
            impactLevel: this.calculateImpactLevel(content),
            estimatedCost: content.estimatedCost || "0.00"
        }).returning();
        return approval[0];
    }
    static async requestHandoff(agentId, conversationId, context, urgency = 'normal') {
        const handoff = await db.insert(agentHandoffRequests).values({
            fromAgentId: agentId,
            toTargetType: 'sandra',
            toTargetId: '42585527',
            requestType: 'guidance_required',
            contextSummary: context,
            urgencyLevel: urgency,
            conversationId
        }).returning();
        return handoff[0];
    }
    static calculateImpactLevel(content) {
        if (content.type === 'email' && content.recipientCount > 1000)
            return 'high';
        if (content.type === 'ad_campaign')
            return 'high';
        if (content.type === 'website_change')
            return 'critical';
        return 'medium';
    }
}
//# sourceMappingURL=approval-service.js.map