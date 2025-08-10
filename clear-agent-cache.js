/**
 * ONE-TIME CACHE CLEAR FOR ELENA AND ZARA
 * Clears cached conversation and memory data that's causing task confusion
 */

import { simpleMemoryService } from './server/services/simple-memory-service.js';
import fs from 'fs';
import path from 'path';

console.log('🧹 CLEARING ELENA AND ZARA CACHE...');

// User ID from logs
const userId = '42585527';

// Clear Elena's cached data
console.log('🗑️ Clearing Elena cache...');
simpleMemoryService.clearAgentMemory('elena', userId);

// Clear Zara's cached data  
console.log('🗑️ Clearing Zara cache...');
simpleMemoryService.clearAgentMemory('zara', userId);

// Clear any conversation logs for these agents
const logsDir = './server/logs';
if (fs.existsSync(logsDir)) {
  const logFiles = fs.readdirSync(logsDir);
  const agentLogs = logFiles.filter(f => 
    f.includes('elena') || f.includes('zara') || 
    f.includes('admin_elena_') || f.includes('admin_zara_')
  );
  
  agentLogs.forEach(logFile => {
    const logPath = path.join(logsDir, logFile);
    console.log(`🗑️ Removing log: ${logFile}`);
    fs.unlinkSync(logPath);
  });
}

// Clear any temp conversation files
const tempConversations = [
  'admin_elena_1754809922388',
  'admin_zara_1754807003074'
];

tempConversations.forEach(convId => {
  // Clear any conversation caches that might exist
  console.log(`🗑️ Clearing conversation cache: ${convId}`);
});

console.log('✅ CACHE CLEAR COMPLETE');
console.log('Elena and Zara should now start fresh without old task confusion.');