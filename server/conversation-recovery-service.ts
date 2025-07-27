/**
 * CONVERSATION RECOVERY SERVICE
 * Restores Sandra's agent conversations from last 2 days
 */

import { db } from './db';
import { claudeConversations, claudeMessages } from '../shared/schema';
import { eq, and, gte } from 'drizzle-orm';

export class ConversationRecoveryService {
  
  /**
   * Get Sandra's conversation history for an agent (last 2 days)
   */
  static async getAgentConversationHistory(agentName: string, userId: string = '42585527'): Promise<any[]> {
    try {
      console.log(`🔄 RECOVERY: Loading ${agentName} conversation history for last 2 days`);
      
      // Get conversation IDs for this agent from last 2 days
      const conversations = await db
        .select()
        .from(claudeConversations)
        .where(
          and(
            eq(claudeConversations.userId, userId),
            eq(claudeConversations.agentName, agentName),
            gte(claudeConversations.createdAt, new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
          )
        )
        .orderBy(claudeConversations.lastMessageAt);

      if (conversations.length === 0) {
        console.log(`📝 RECOVERY: No conversations found for ${agentName} in last 2 days`);
        return [];
      }

      console.log(`✅ RECOVERY: Found ${conversations.length} conversations for ${agentName}`);

      // Get all messages from these conversations
      let allMessages: any[] = [];
      
      for (const conversation of conversations) {
        const messages = await db
          .select()
          .from(claudeMessages)
          .where(eq(claudeMessages.conversationId, conversation.id))
          .orderBy(claudeMessages.timestamp);

        const mappedMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
          conversationId: conversation.conversationId
        }));

        allMessages = [...allMessages, ...mappedMessages];
      }

      console.log(`✅ RECOVERY: Restored ${allMessages.length} messages for ${agentName}`);
      return allMessages;

    } catch (error) {
      console.error(`❌ RECOVERY ERROR for ${agentName}:`, error);
      return [];
    }
  }

  /**
   * Get Sandra's main Elena conversation (192 messages)
   */
  static async getElenaMainConversation(): Promise<any[]> {
    try {
      console.log('🔄 RECOVERY: Loading Elena main conversation (192 messages)');
      
      const conversation = await db
        .select()
        .from(claudeConversations)
        .where(
          and(
            eq(claudeConversations.userId, '42585527'),
            eq(claudeConversations.conversationId, 'elena-42585527-1753433901733')
          )
        )
        .limit(1);

      if (conversation.length === 0) {
        console.log('❌ RECOVERY: Elena main conversation not found');
        return [];
      }

      const messages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, conversation[0].id))
        .orderBy(claudeMessages.timestamp);

      const mappedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
        conversationId: conversation[0].conversationId
      }));

      console.log(`✅ RECOVERY: Elena main conversation restored - ${mappedMessages.length} messages`);
      return mappedMessages;

    } catch (error) {
      console.error('❌ RECOVERY ERROR for Elena main conversation:', error);
      return [];
    }
  }

  /**
   * Restore all Sandra's agent conversations from last 2 days
   */
  static async restoreAllAgentConversations(): Promise<{ [agentName: string]: any[] }> {
    const agents = ['elena', 'zara', 'olga', 'victoria', 'rachel', 'aria', 'maya', 'diana', 'martha', 'quinn', 'sophia', 'wilma'];
    const restoredConversations: { [agentName: string]: any[] } = {};

    console.log('🔄 RECOVERY: Starting full conversation restoration for all agents');

    for (const agentName of agents) {
      restoredConversations[agentName] = await this.getAgentConversationHistory(agentName);
    }

    // Special handling for Elena main conversation
    const elenaMain = await this.getElenaMainConversation();
    if (elenaMain.length > 0) {
      restoredConversations['elena'] = [...(restoredConversations['elena'] || []), ...elenaMain];
    }

    const totalMessages = Object.values(restoredConversations).reduce((sum, messages) => sum + messages.length, 0);
    console.log(`✅ RECOVERY COMPLETE: Restored ${totalMessages} total messages across all agents`);

    return restoredConversations;
  }
}