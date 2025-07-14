#!/usr/bin/env node

/**
 * CRITICAL FIX: Convert all Replit Auth user references to Google Auth format
 * 
 * Replit Auth: req.user.claims.sub
 * Google Auth: req.user.id (direct database user object)
 */

import fs from 'fs';
import path from 'path';

const filesToFix = [
  'server/routes.ts',
  'server/routes/ai-images.ts',
  'server/routes/automation.ts',
  'server/routes/styleguide-routes.ts',
  'server/routes/checkout.ts'
];

function fixAuthReferences(filePath) {
  console.log(`🔧 Fixing auth references in ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changesMade = 0;
  
  // Replace all instances of req.user.claims.sub with req.user.id
  const replacements = [
    {
      from: /req\.user\.claims\.sub/g,
      to: 'req.user.id',
      description: 'req.user.claims.sub → req.user.id'
    },
    {
      from: /req\.user\.claims\.email/g,
      to: 'req.user.email',
      description: 'req.user.claims.email → req.user.email'
    },
    {
      from: /\(req\.user as any\)\?\.claims\?\.sub/g,
      to: '(req.user as any)?.id',
      description: 'Typed claims.sub → id'
    },
    {
      from: /\(req\.user as any\)\?\.claims\?\.email/g,
      to: '(req.user as any)?.email',
      description: 'Typed claims.email → email'
    }
  ];
  
  replacements.forEach(replacement => {
    const beforeCount = (content.match(replacement.from) || []).length;
    content = content.replace(replacement.from, replacement.to);
    const afterCount = (content.match(replacement.from) || []).length;
    const replacedCount = beforeCount - afterCount;
    
    if (replacedCount > 0) {
      console.log(`   ✅ ${replacement.description}: ${replacedCount} replacements`);
      changesMade += replacedCount;
    }
  });
  
  if (changesMade > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${changesMade} auth references in ${filePath}`);
  } else {
    console.log(`   ℹ️  No changes needed in ${filePath}`);
  }
}

console.log('🚀 Starting Google Auth user reference fix...\n');

filesToFix.forEach(fixAuthReferences);

console.log('\n✅ Google Auth user reference fix completed!');
console.log('📝 All routes now use Google Auth format:');
console.log('   - req.user.id (instead of req.user.claims.sub)');
console.log('   - req.user.email (instead of req.user.claims.email)');