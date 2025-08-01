/**
 * ZARA ADMIN AGENT - DIRECT CONFLICT RESOLUTION REQUEST
 * Connect with ZARA through admin consulting system to resolve onboarding duplicate flows
 */

console.log('🔧 CONNECTING TO ZARA ADMIN AGENT...');

// Direct request to ZARA through admin consulting system
const zaraRequest = {
  agentId: 'zara',
  task: 'URGENT DUPLICATE ONBOARDING SYSTEM CONFLICT RESOLUTION',
  context: {
    problem: 'Two conflicting onboarding flows active simultaneously',
    systems: {
      correct: '/api/brand-onboarding (admin-built 2 days ago)',
      duplicate: '/api/build/onboarding (just created)',
      frontendConflict: 'client/src/components/victoria/AIWebsiteBuilder.tsx routing to wrong system'
    },
    userExperience: 'Users going through BOTH onboarding flows',
    solution_needed: 'Remove duplicate, preserve admin-built system, fix routing'
  }
};

console.log('📋 ZARA CONFLICT RESOLUTION REQUEST:', zaraRequest);
console.log('🎯 Zara needs to examine these files with direct access:');
console.log('   - server/routes.ts (lines 468-600)');
console.log('   - client/src/components/victoria/AIWebsiteBuilder.tsx');
console.log('   - Any brand-onboarding admin-built components');
console.log('🚨 CRITICAL: Must preserve all admin agent work from 2 days ago');