/**
 * ZARA WORKFLOW ANALYSIS
 * Check if Zara is actually working vs just having conversations
 */

import { db } from './db.js';
import { claudeMessages } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

async function checkZaraWorkflow() {
  console.log('🔧 ZARA WORKFLOW & PRODUCTIVITY ANALYSIS');
  console.log('='.repeat(60));
  
  try {
    // Get Zara's latest conversation messages
    const messages = await db
      .select()
      .from(claudeMessages)
      .where(eq(claudeMessages.conversationId, 'admin_zara_1754716825334'))
      .orderBy(desc(claudeMessages.createdAt))
      .limit(15);
      
    console.log(`📊 Analyzing ${messages.length} messages from latest conversation\n`);
    
    let toolUsageCount = 0;
    let workIndicators = 0;
    let greetingResponses = 0;
    let contextReferenceCount = 0;
    let actualWorkDone = false;
    
    const workKeywords = [
      'str_replace_based_edit_tool', 'search_filesystem', 'bash',
      'create', 'modify', 'implement', 'build', 'fix', 'debug',
      'component', 'function', 'file', 'code', 'database'
    ];
    
    const greetingKeywords = [
      'hello', 'hi', 'how are you', 'good', 'thanks', 'great'
    ];
    
    const contextKeywords = [
      'previous', 'last time', 'yesterday', 'before', 'continuing',
      'from earlier', 'old task', 'previous work'
    ];
    
    console.log('📝 MESSAGE ANALYSIS:');
    console.log('-'.repeat(40));
    
    for (const msg of messages.reverse()) {
      const content = msg.content.toLowerCase();
      console.log(`\n${msg.role.toUpperCase()} (${msg.createdAt?.toLocaleTimeString()}):`);
      console.log(`${msg.content.substring(0, 150)}...`);
      
      // Check for tool usage
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        toolUsageCount++;
        actualWorkDone = true;
        console.log(`🔧 TOOLS USED: ${msg.toolCalls.length} tools`);
      }
      
      // Check for work indicators
      if (workKeywords.some(keyword => content.includes(keyword))) {
        workIndicators++;
        if (content.includes('str_replace') || content.includes('search_filesystem') || content.includes('bash')) {
          actualWorkDone = true;
        }
      }
      
      // Check for greeting responses
      if (greetingKeywords.some(keyword => content.includes(keyword))) {
        greetingResponses++;
      }
      
      // Check for context references
      if (contextKeywords.some(keyword => content.includes(keyword))) {
        contextReferenceCount++;
        console.log(`⚠️ CONTEXT REFERENCE: References old context`);
      }
      
      // Check for specific issues
      if (content.includes('looking for') && content.length > 1000) {
        console.log(`🔍 SEARCH BEHAVIOR: Long response about searching`);
      }
      
      if (content.includes('files found') || content.includes('search results')) {
        console.log(`📊 SEARCH RESULTS: Providing search information`);
      }
    }
    
    console.log('\n🎯 WORKFLOW ANALYSIS RESULTS');
    console.log('='.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Tool Usage: ${toolUsageCount} messages`);
    console.log(`   Work Indicators: ${workIndicators} messages`);
    console.log(`   Greeting Responses: ${greetingResponses} messages`);
    console.log(`   Context References: ${contextReferenceCount} messages`);
    
    console.log(`\n🔍 Analysis:`);
    if (actualWorkDone) {
      console.log(`✅ ACTUAL WORK: Zara used development tools and performed tasks`);
    } else {
      console.log(`❌ NO ACTUAL WORK: Zara only had conversations, no development work`);
    }
    
    if (contextReferenceCount > workIndicators) {
      console.log(`⚠️ CONTEXT POLLUTION: Too many references to old context vs actual work`);
    }
    
    if (greetingResponses > 0 && toolUsageCount > 3) {
      console.log(`🤔 MIXED BEHAVIOR: Both greeting responses and work - context detector may need tuning`);
    }
    
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (!actualWorkDone) {
      console.log(`- Zara is not performing development tasks, only having conversations`);
    }
    if (contextReferenceCount > 2) {
      console.log(`- Context detector may need improvement to prevent old context loading`);
    }
    if (toolUsageCount === 0) {
      console.log(`- Check if tools are properly available to Zara`);
    }
    
  } catch (error) {
    console.error('❌ Error checking Zara workflow:', error);
  }
}

// Export for external use
export { checkZaraWorkflow };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkZaraWorkflow().catch(console.error);
}