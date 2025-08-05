/**
 * TEST: AGENT CONVERSATION vs TOOL SEPARATION
 * Verifies that conversations go to Claude API and tools use hybrid intelligence
 */

const { MessageClassifier } = require('./server/services/hybrid-intelligence/message-classifier');

console.log('🧪 TESTING CONVERSATION vs TOOL SEPARATION');
console.log('=' * 60);

const messageClassifier = MessageClassifier.getInstance();

// Test conversation messages (should use Claude API)
const conversationMessages = [
  "Hey Zara, how are you?",
  "Hi Elena, can you help me with strategy?",
  "I need to create a landing page component",
  "Write code for a React navbar",
  "Build a user authentication system",
  "Design a payment integration",
  "Generate a report on my project status",
  "What do you think about this approach?",
  "Analyze the architecture and provide recommendations"
];

// Test tool operation messages (should use hybrid intelligence)
const toolMessages = [
  "search files in client directory",
  "view file content for App.tsx",
  "run command npm install",
  "execute bash command ls -la",
  "check system status",
  "verify database connection",
  "create file at specific path /client/src/test.tsx",
  "update specific line in file",
  "delete file from server"
];

console.log('\n🧠 CONVERSATION MESSAGES (Should use Claude API):');
conversationMessages.forEach(message => {
  const classification = messageClassifier.classifyMessage(message, 'zara');
  const symbol = classification.forceClaudeAPI ? '✅' : '❌';
  console.log(`${symbol} "${message}" → ${classification.type} (${classification.confidence})`);
  console.log(`   Reason: ${classification.reason}`);
});

console.log('\n🔧 TOOL OPERATION MESSAGES (Should use Hybrid Intelligence):');
toolMessages.forEach(message => {
  const classification = messageClassifier.classifyMessage(message, 'zara');
  const symbol = classification.type === 'tool_operation' ? '✅' : '❌';
  console.log(`${symbol} "${message}" → ${classification.type} (${classification.confidence})`);
  console.log(`   Reason: ${classification.reason}`);
});

console.log('\n📊 SUMMARY:');
const conversationResults = conversationMessages.map(msg => messageClassifier.classifyMessage(msg, 'zara'));
const toolResults = toolMessages.map(msg => messageClassifier.classifyMessage(msg, 'zara'));

const correctConversations = conversationResults.filter(r => r.forceClaudeAPI).length;
const correctTools = toolResults.filter(r => r.type === 'tool_operation').length;

console.log(`✅ Conversations correctly routed to Claude API: ${correctConversations}/${conversationMessages.length}`);
console.log(`✅ Tools correctly routed to Hybrid Intelligence: ${correctTools}/${toolMessages.length}`);

const totalAccuracy = (correctConversations + correctTools) / (conversationMessages.length + toolMessages.length) * 100;
console.log(`🎯 Overall Accuracy: ${totalAccuracy.toFixed(1)}%`);

if (totalAccuracy >= 90) {
  console.log('\n🚀 SEPARATION SYSTEM: WORKING CORRECTLY');
  console.log('✅ Agents will get authentic Claude API responses for conversations');
  console.log('✅ Tool operations will use zero-cost hybrid intelligence');
} else {
  console.log('\n⚠️  SEPARATION SYSTEM: NEEDS ADJUSTMENT');
  console.log('❌ Classification patterns may need refinement');
}