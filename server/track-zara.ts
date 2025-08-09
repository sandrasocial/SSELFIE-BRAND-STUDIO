/**
 * ZARA TRACKING & ANALYSIS TOOL
 * Deep analysis of Zara's conversation patterns, context handling, and performance
 */

import { db } from './db.js';
import { claudeConversations, claudeMessages, agentLearning, agentSessionContexts } from '../shared/schema.js';
import { eq, desc, and } from 'drizzle-orm';

async function trackZara() {
  console.log('🔍 ZARA TRACKING & ANALYSIS');
  console.log('='.repeat(60));
  
  try {
    // Get Zara's recent conversations
    const conversations = await db
      .select()
      .from(claudeConversations)
      .where(eq(claudeConversations.agentName, 'zara'))
      .orderBy(desc(claudeConversations.updatedAt))
      .limit(3);
      
    console.log(`📊 Found ${conversations.length} recent conversations for Zara\n`);
    
    for (const conv of conversations) {
      console.log(`🗣️ CONVERSATION: ${conv.conversationId}`);
      console.log(`   User ID: ${conv.userId}`);
      console.log(`   Status: ${conv.status}`);
      console.log(`   Messages: ${conv.messageCount}`);
      console.log(`   Last Activity: ${conv.lastMessageAt?.toLocaleString() || 'Never'}`);
      console.log(`   Duration: ${conv.lastMessageAt && conv.createdAt ? 
        Math.round((conv.lastMessageAt.getTime() - conv.createdAt.getTime()) / 1000) + 's' : 'Unknown'}`);
      
      // Get messages for this conversation
      const messages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, conv.conversationId))
        .orderBy(desc(claudeMessages.createdAt))
        .limit(5);
        
      console.log(`   📝 RECENT MESSAGES:`);
      let contextIssues = 0;
      let toolUsage = 0;
      
      for (const msg of messages.reverse()) {
        const preview = msg.content.substring(0, 80).replace(/\n/g, ' ');
        console.log(`      ${msg.role}: ${preview}... (${msg.createdAt?.toLocaleString()})`);
        
        // Check for context issues
        if (msg.content.includes('previous') || 
            msg.content.includes('continuing') || 
            msg.content.includes('last task') ||
            msg.content.includes('from yesterday')) {
          contextIssues++;
        }
        
        // Check tool usage
        if (msg.toolCalls) {
          toolUsage++;
        }
      }
      
      console.log(`   🔍 ANALYSIS: ${contextIssues} context issues, ${toolUsage} tool uses\n`);
    }
    
    // Check Zara's memory and learning patterns
    console.log('🧠 ZARA MEMORY ANALYSIS');
    console.log('-'.repeat(40));
    
    const learningPatterns = await db
      .select()
      .from(agentLearning)
      .where(and(
        eq(agentLearning.agentName, 'zara'),
        eq(agentLearning.userId, '42585527')
      ))
      .orderBy(desc(agentLearning.lastSeen))
      .limit(10);
      
    console.log(`📚 Found ${learningPatterns.length} learning patterns for Zara`);
    
    for (const pattern of learningPatterns) {
      console.log(`   - ${pattern.category}: ${pattern.learningType} (freq: ${pattern.frequency}, conf: ${pattern.confidence})`);
    }
    
    // Check context preservation
    console.log('\n🏗️ CONTEXT PRESERVATION ANALYSIS');
    console.log('-'.repeat(40));
    
    const contextData = await db
      .select()
      .from(agentSessionContexts)
      .where(and(
        eq(agentSessionContexts.agentId, 'zara'),
        eq(agentSessionContexts.userId, '42585527')
      ))
      .orderBy(desc(agentSessionContexts.updatedAt))
      .limit(3);
      
    console.log(`🗃️ Found ${contextData.length} context sessions for Zara`);
    
    for (const ctx of contextData) {
      const contextObj = ctx.contextData as any;
      console.log(`   Session ${ctx.sessionId}:`);
      console.log(`     Task: ${contextObj?.currentTask || 'None'}`);
      console.log(`     Files Modified: ${contextObj?.filesModified?.length || 0}`);
      console.log(`     Admin Bypass: ${contextObj?.adminBypass || false}`);
      console.log(`     Updated: ${ctx.updatedAt?.toLocaleString()}`);
    }
    
    // Performance Analysis
    console.log('\n⚡ PERFORMANCE ANALYSIS');
    console.log('-'.repeat(40));
    
    const recentConv = conversations[0];
    if (recentConv && recentConv.lastMessageAt && recentConv.createdAt) {
      const duration = recentConv.lastMessageAt.getTime() - recentConv.createdAt.getTime();
      const avgMessageTime = duration / (recentConv.messageCount || 1);
      
      console.log(`📊 Latest Conversation Performance:`);
      console.log(`   Total Duration: ${Math.round(duration / 1000)}s`);
      console.log(`   Messages: ${recentConv.messageCount}`);
      console.log(`   Avg per Message: ${Math.round(avgMessageTime / 1000)}s`);
      
      if (avgMessageTime > 30000) {
        console.log(`   ⚠️ SLOW RESPONSE: Average > 30s per message`);
      } else {
        console.log(`   ✅ GOOD RESPONSE: Average < 30s per message`);
      }
    }
    
    console.log('\n🎯 TRACKING SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Analysis completed - Check logs above for issues');
    
  } catch (error) {
    console.error('❌ Error tracking Zara:', error);
  }
}

// Export for external use
export { trackZara };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  trackZara().catch(console.error);
}