import { db } from '../drizzle';
import { approvalQueue, agentHandoffRequests } from '../../shared/schema';

export class ApprovalService {
  // Add content to approval queue
  static async requestApproval(agentId: string, userId: string, content: any) {
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
  
  // Agent requests Sandra's input
  static async requestHandoff(agentId: string, conversationId: string, context: string, urgency: string = 'normal') {
    const handoff = await db.insert(agentHandoffRequests).values({
      fromAgentId: agentId,
      toTargetType: 'sandra',
      toTargetId: '42585527', // Sandra's user ID
      requestType: 'guidance_required',
      contextSummary: context,
      urgencyLevel: urgency,
      conversationId
    }).returning();
    
    // Send notification to Sandra (implement notification system)
    // await NotificationService.notifySandra(handoff[0]);
    
    return handoff[0];
  }
  
  private static calculateImpactLevel(content: any): string {
    // Logic to determine impact level based on content type and reach
    if (content.type === 'email' && content.recipientCount > 1000) return 'high';
    if (content.type === 'ad_campaign') return 'high';
    if (content.type === 'website_change') return 'critical';
    return 'medium';
  }
}