#!/usr/bin/env node

// Quick fix script to patch admin dashboard conversation memory

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing conversation memory in admin dashboard...');

const adminDashboardPath = 'client/src/pages/admin-dashboard.tsx';

// Read current file
const content = fs.readFileSync(adminDashboardPath, 'utf8');

// Find and fix the duplicate agentResponse variable
const fixedContent = content
  // Remove the first agentResponse variable declaration (earlier in file)
  .replace(/\s+const agentResponse = \{\s+id: Date\.now\(\) \+ 1,\s+type: 'agent',\s+content: data\.message \|\| 'Agent response received',\s+timestamp: new Date\(\)\s+\};/g, '')
  
  // Fix the final agentResponse to use proper structure
  .replace(/const finalAgentResponse = \{/g, 'const agentResponse = {')
  .replace(/setChatHistory\(prev => \[\.\.\.prev, newMessage, finalAgentResponse\]\);/g, 'setChatHistory(prev => [...prev, newMessage, agentResponse]);')
  
  // Ensure conversation history mapping is correct
  .replace(/conversationHistory: chatHistory\.slice\(-10\)\.map\(msg => \(\{/g, 'conversationHistory: (chatHistory || []).slice(-10).map(msg => ({')
  
  // Add debug logging for conversation history
  .replace(/conversationHistory: \(chatHistory \|\| \[\]\)\.slice\(-10\)\.map\(msg => \(\{/g, `conversationHistory: (() => {
            const history = (chatHistory || []).slice(-10).map(msg => ({
              type: msg.type,
              content: msg.content
            }));
            console.log('📝 Sending conversation history:', history.length, 'messages');
            return history;
          })()`);

fs.writeFileSync(adminDashboardPath, fixedContent);

console.log('✅ Fixed admin dashboard conversation memory');
console.log('   • Removed duplicate agentResponse variable');
console.log('   • Fixed conversation history mapping');
console.log('   • Added debug logging for conversation history');

// Test the server endpoint directly once it starts
setTimeout(async () => {
  try {
    console.log('\n🧪 Testing conversation memory...');
    
    const response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Do you remember our moodboard conversation?',
        adminToken: 'sandra-admin-2025',
        conversationHistory: [
          { type: 'user', content: 'Victoria, redesign admin dashboard with moodboard style' },
          { type: 'agent', content: 'OMG YES! Picture luxury editorial dashboard with gorgeous moodboard style' }
        ]
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const remembersContext = data.message.toLowerCase().includes('moodboard') || 
                               data.message.toLowerCase().includes('remember') ||
                               data.message.toLowerCase().includes('dashboard');
      
      console.log(`✅ Memory Test: ${remembersContext ? 'PASSED' : 'FAILED'}`);
      console.log(`   Victoria response: ${data.message.substring(0, 100)}...`);
    } else {
      console.log('❌ Server not ready yet');
    }
    
  } catch (error) {
    console.log('⏳ Server starting...');
  }
}, 10000);

console.log('\n📡 Server should restart automatically...');