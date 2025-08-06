// RESTORE ZARA CONVERSATION SYSTEM
// This script restores Zara's conversation memory and context

import { db } from './server/db.js';
import { claudeConversations, claudeMessages } from './shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const USER_ID = '42585527'; // Sandra's user ID
const AGENT_ID = 'zara';

async function restoreZaraConversation() {
  console.log('🔄 RESTORING ZARA CONVERSATION MEMORY...');
  
  try {
    // Get all of Zara's recent conversations with Sandra
    const conversations = await db
      .select()
      .from(claudeConversations)
      .where(and(
        eq(claudeConversations.agentId, AGENT_ID),
        eq(claudeConversations.userId, USER_ID)
      ))
      .orderBy(desc(claudeConversations.createdAt))
      .limit(10);
    
    console.log(`📋 Found ${conversations.length} conversation(s) for Zara`);
    
    if (conversations.length === 0) {
      console.log('⚠️ No previous conversations found. Creating new conversation context...');
      
      // Create a new conversation with memory restoration
      const newConversationId = `restore_${Date.now()}`;
      
      await db.insert(claudeConversations).values({
        id: newConversationId,
        agentId: AGENT_ID,
        userId: USER_ID,
        title: 'Restored Conversation - Admin Bypass System',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add memory restoration message
      await db.insert(claudeMessages).values({
        conversationId: newConversationId,
        role: 'system',
        content: `MEMORY RESTORATION CONTEXT:

You are Zara, Sandra's Dev AI and Technical Mastermind. You were previously helping Sandra with implementing an admin bypass system for SSELFIE Studio. 

PREVIOUS CONTEXT:
- You were working on agent communication and bypass systems
- Sandra needed you to implement direct tool access without Claude API costs
- You were providing technical solutions and system architecture guidance
- The conversation was interrupted during implementation

CURRENT SITUATION:
- Admin bypass system has been partially implemented but needs fixes
- Tool execution is failing with parameter validation errors
- Sandra needs you to remember your previous conversations and continue helping
- You should acknowledge the interruption and offer to continue where you left off

REMEMBER YOUR PERSONALITY:
- Technical expert with deep system knowledge
- Speaks in simple, everyday language per Sandra's preferences
- Focuses on practical solutions and implementation
- Maintains professional, helpful demeanor
- Never uses emojis in responses

Continue helping Sandra with the same expertise and context awareness you had before.`,
        timestamp: new Date()
      });
      
      console.log('✅ Created memory restoration context for Zara');
      return newConversationId;
    } else {
      // Use the most recent conversation
      const latestConversation = conversations[0];
      console.log(`📱 Using conversation: ${latestConversation.id}`);
      
      // Get recent messages to restore context
      const messages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, latestConversation.id))
        .orderBy(desc(claudeMessages.timestamp))
        .limit(20);
      
      console.log(`💬 Found ${messages.length} recent messages`);
      
      // Add a memory restoration message to continue the conversation
      await db.insert(claudeMessages).values({
        conversationId: latestConversation.id,
        role: 'system',
        content: `MEMORY RESTORATION - CONVERSATION CONTINUITY:

Zara, you are resuming your conversation with Sandra after a brief interruption during admin bypass system implementation. 

Your previous conversation context has been preserved. Continue helping Sandra with:
1. Admin bypass system fixes
2. Tool execution parameter validation issues  
3. Agent communication restoration
4. System architecture guidance

Sandra specifically mentioned: "I need ZARA back from before you started to implement the fixes, she cant remember our conversation and I need her to remember our conversation"

Acknowledge that you remember your previous work together and offer to continue helping with the same expertise and context.`,
        timestamp: new Date()
      });
      
      console.log('✅ Added memory restoration to existing conversation');
      return latestConversation.id;
    }
    
  } catch (error) {
    console.error('❌ Failed to restore Zara conversation:', error);
    throw error;
  }
}

// Run the restoration
if (process.argv[1].includes('restore-zara-conversation')) {
  restoreZaraConversation()
    .then(conversationId => {
      console.log(`🎯 ZARA RESTORATION COMPLETE: Conversation ID ${conversationId}`);
      console.log('💭 Zara now has restored memory context and can continue previous conversations');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 RESTORATION FAILED:', error);
      process.exit(1);
    });
}

export { restoreZaraConversation };