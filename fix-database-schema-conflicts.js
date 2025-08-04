/**
 * CRITICAL DATABASE SCHEMA UNIFICATION
 * Fixes remaining agentConversations references to use claudeConversations/claudeMessages
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'server/workflows/agent-coordination-system.ts',
  'server/workflows/enhanced-handoff-system.ts',
  'server/agents/predictive-intelligence-system.ts'
];

const replacements = [
  // Fix database inserts
  {
    from: /await db\.insert\(agentConversations\)\.values\(\{[\s\S]*?\}\);/g,
    to: (match) => {
      // Convert agentConversations insert to claudeConversations/claudeMessages
      if (match.includes('agentName: \'system\'')) {
        return `const convId = \`system_\${workflowId || Date.now()}\`;
    await db.insert(claudeConversations).values({
      userId,
      agentName: 'system',
      conversationId: convId,
      title: 'System workflow',
      status: 'active'
    });
    await db.insert(claudeMessages).values({
      conversationId: convId,
      role: 'system',
      content: JSON.stringify(conversationData || {}),
      metadata: { type: 'workflow' }
    });`;
      } else {
        return `const convId = \`\${agentName}_\${Date.now()}\`;
    await db.insert(claudeConversations).values({
      userId,
      agentName,
      conversationId: convId,
      title: \`Chat with \${agentName}\`,
      status: 'active'
    });
    await db.insert(claudeMessages).values({
      conversationId: convId,
      role: 'user',
      content: userMessage || '',
      metadata: { type: 'handoff' }
    });
    await db.insert(claudeMessages).values({
      conversationId: convId,
      role: 'assistant',
      content: agentResponse || '',
      metadata: { type: 'handoff' }
    });`;
      }
    }
  },
  
  // Fix database queries
  {
    from: /\.from\(agentConversations\)/g,
    to: '.from(claudeConversations).innerJoin(claudeMessages, eq(claudeMessages.conversationId, claudeConversations.conversationId))'
  },
  
  // Fix where clauses
  {
    from: /eq\(agentConversations\.(\w+),/g,
    to: 'eq(claudeConversations.$1,'
  },
  
  // Fix property access in workflow systems
  {
    from: /conv\.agentId/g,
    to: 'conv.claudeConversations.agentName'
  },
  
  {
    from: /conv\.userMessage/g,
    to: 'conv.claudeMessages.content'
  },
  
  {
    from: /conv\.agentResponse/g,
    to: 'conv.claudeMessages.content'
  },
  
  {
    from: /c\.agentName/g,
    to: 'c.agentName'
  }
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  replacements.forEach(({ from, to }) => {
    const originalContent = content;
    if (typeof to === 'function') {
      content = content.replace(from, to);
    } else {
      content = content.replace(from, to);
    }
    if (content !== originalContent) {
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed schema conflicts in ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed in ${filePath}`);
  }
}

console.log('🔧 Starting database schema unification...');
filesToFix.forEach(fixFile);
console.log('✅ Database schema unification complete!');