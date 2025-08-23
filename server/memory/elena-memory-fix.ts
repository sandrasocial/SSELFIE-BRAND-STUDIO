/**
 * ELENA MEMORY CONTINUITY FIX
 * Ensures Elena remembers conversations across sessions by fixing context loading
 */

import { db } from '../db';
import { claudeMessages, claudeConversations } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

export class ElenaMemoryFix {
  
  /**
   * Force reload Elena's conversation context
   */
  static async reloadElenaContext(userId: string = '42585527'): Promise<{
    conversationId: string;
    messageCount: number;
    recentMessages: any[];
  }> {
    console.log('🔧 ELENA MEMORY FIX: Reloading conversation context...');
    
    const conversationId = `admin_elena_${userId}`;
    
    // Get Elena's complete message history
    const messages = await db
      .select()
      .from(claudeMessages)
      .where(eq(claudeMessages.conversationId, conversationId))
      .orderBy(desc(claudeMessages.createdAt))
      .limit(100); // Get more context for Elena
    
    console.log(`💾 ELENA MEMORY: Found ${messages.length} messages for conversation ${conversationId}`);
    
    // Format recent messages for display
    const recentMessages = messages
      .slice(0, 10)
      .reverse() // Chronological order
      .map(msg => ({
        role: msg.role,
        content: msg.content.substring(0, 100) + '...',
        timestamp: msg.createdAt
      }));
    
    return {
      conversationId,
      messageCount: messages.length,
      recentMessages
    };
  }
  
  /**
   * Verify Elena's conversation exists and create if needed
   */
  static async ensureElenaConversation(userId: string = '42585527'): Promise<void> {
    const conversationId = `admin_elena_${userId}`;
    
    // Check if conversation record exists
    const existing = await db
      .select()
      .from(claudeConversations)
      .where(eq(claudeConversations.conversationId, conversationId))
      .limit(1);
    
    if (existing.length === 0) {
      // Create conversation record
      await db.insert(claudeConversations).values({
        conversationId,
        userId,
        agentName: 'elena',
        title: 'Elena Admin Consultation',
        lastMessageAt: new Date()
      });
      console.log(`✅ ELENA MEMORY: Created conversation record ${conversationId}`);
    } else {
      console.log(`✅ ELENA MEMORY: Conversation ${conversationId} exists`);
    }
  }
}