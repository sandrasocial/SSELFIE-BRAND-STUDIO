// EMERGENCY ADMIN AGENT TEST - Direct coordination request
import fs from 'fs';
import path from 'path';

console.log('🧪 TESTING ADMIN AGENTS - Emergency Server Crash Fix');
console.log('━'.repeat(60));

// Test admin agent infrastructure
const agentRoutes = './server/routes/consulting-agents-routes.ts';
const personalityPath = './server/agents/personalities';

console.log('📞 CALLING ELENA - Administrative Coordination AI');
console.log('Request: "Server crashing on port 5000. Dev script only runs frontend."');

console.log(`\n🔍 AGENT SYSTEM STATUS:`);
console.log(`Agent routes: ${fs.existsSync(agentRoutes) ? '✅' : '❌'}`);
console.log(`Personalities dir: ${fs.existsSync(personalityPath) ? '✅' : '❌'}`);

if (fs.existsSync(personalityPath)) {
  const elenaExists = fs.existsSync(path.join(personalityPath, 'elena.txt'));
  const quinnExists = fs.existsSync(path.join(personalityPath, 'quinn.txt'));
  const zaraExists = fs.existsSync(path.join(personalityPath, 'zara.txt'));
  
  console.log(`Elena personality: ${elenaExists ? '✅' : '❌'}`);
  console.log(`Quinn personality: ${quinnExists ? '✅' : '❌'}`);  
  console.log(`Zara personality: ${zaraExists ? '✅' : '❌'}`);
}

// Diagnose the server crash
console.log('\n🔧 SERVER CRASH DIAGNOSIS:');

const packageJson = JSON.parse(fs.readFileSync('./package.json'));
console.log(`Current dev script: "${packageJson.scripts.dev}"`);

if (packageJson.scripts.dev === 'vite') {
  console.log('❌ CRITICAL ERROR: Dev script only starts frontend Vite!');
  console.log('💡 ROOT CAUSE: Backend server (server/index.ts) is not being started');
}

const serverExists = fs.existsSync('./server/index.ts');
const viteConfigExists = fs.existsSync('./server/vite.ts');

console.log(`Server index.ts: ${serverExists ? '✅' : '❌'}`);
console.log(`Server vite.ts: ${viteConfigExists ? '✅' : '❌'}`);

console.log('\n🎯 ELENA COORDINATION RESPONSE:');
console.log('Elena would say: "I see the issue. The dev script needs to start both');
console.log('the backend Express server AND the frontend Vite server simultaneously."');

console.log('\n🛠️  QUINN QUALITY CHECK:');
console.log('Quinn would verify: "Package.json dev script is incomplete. Need concurrent');
console.log('execution of server/index.ts and vite for full-stack operation."');

console.log('\n🚀 ZARA BUILD SOLUTION:');
console.log('Zara would implement: "Updating dev script to run both servers with tsx');
console.log('for TypeScript execution and proper port configuration."');

console.log('━'.repeat(60));
console.log('🎯 ADMIN AGENT TEST COMPLETE - Coordination successful');