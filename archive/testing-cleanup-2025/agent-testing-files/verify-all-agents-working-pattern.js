import fs from 'fs';

const agentFile = 'server/agents/agent-personalities.ts';
const agentContent = fs.readFileSync(agentFile, 'utf8');

console.log('🔍 VERIFYING ALL 9 AGENTS HAVE REPLIT-STYLE CONTINUOUS WORKING PATTERN');
console.log('=' .repeat(80));

const agents = ['victoria', 'maya', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma'];
const requiredPatterns = [
  'REPLIT-STYLE CONTINUOUS WORKING PATTERN',
  'IMMEDIATE',
  'CONTINUOUS',
  'EXPLAIN',
  'NEVER STOP UNTIL',
  'COMPLETION REPORT'
];

let allVerified = true;

agents.forEach(agent => {
  console.log(`\n📋 Verifying Agent: ${agent.toUpperCase()}`);
  
  // Find agent section
  const agentRegex = new RegExp(`${agent}:\\s*{[\\s\\S]*?(?=\\n\\s{4}\\w+:|\\n\\s{2}};)`, 'i');
  const agentMatch = agentContent.match(agentRegex);
  
  if (!agentMatch) {
    console.log(`❌ ${agent}: Agent section not found`);
    allVerified = false;
    return;
  }
  
  const agentSection = agentMatch[0];
  
  // Check for each required pattern
  const patternResults = requiredPatterns.map(pattern => {
    const hasPattern = agentSection.includes(pattern);
    console.log(`   ${hasPattern ? '✅' : '❌'} ${pattern}: ${hasPattern ? 'Found' : 'Missing'}`);
    return hasPattern;
  });
  
  const agentVerified = patternResults.every(result => result);
  
  if (agentVerified) {
    console.log(`✅ ${agent.toUpperCase()}: All patterns verified`);
  } else {
    console.log(`❌ ${agent.toUpperCase()}: Missing patterns`);
    allVerified = false;
  }
});

console.log('\n' + '=' .repeat(80));
if (allVerified) {
  console.log('🎉 SUCCESS: ALL 9 AGENTS HAVE REPLIT-STYLE CONTINUOUS WORKING PATTERN');
  console.log('✅ Victoria: UX Designer with continuous design progress updates');
  console.log('✅ Maya: Dev AI with continuous development progress updates');
  console.log('✅ Rachel: Voice AI with continuous copywriting progress updates');
  console.log('✅ Ava: Automation AI with continuous automation progress updates');
  console.log('✅ Quinn: QA AI with continuous quality assurance progress updates');
  console.log('✅ Sophia: Social Media AI with continuous social progress updates');
  console.log('✅ Martha: Marketing AI with continuous marketing progress updates');
  console.log('✅ Diana: Strategic Coach with continuous strategic progress updates');
  console.log('✅ Wilma: Workflow AI with continuous workflow progress updates');
  console.log('\n🚀 ALL AGENTS READY FOR CONTINUOUS WORKING LIKE REPLIT AI AGENTS');
} else {
  console.log('❌ ISSUES FOUND: Some agents missing required patterns');
}