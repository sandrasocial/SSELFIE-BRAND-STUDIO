#!/usr/bin/env node

/**
 * COMPREHENSIVE REACT IMPORT FIXER
 * Systematically fixes all React. references across the codebase
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('🔧 Starting comprehensive React import fix...');

// Common React imports mapping
const reactMappings = {
  'React.forwardRef': 'forwardRef',
  'React.createContext': 'createContext', 
  'React.useContext': 'useContext',
  'React.useEffect': 'useEffect',
  'React.useState': 'useState',
  'React.useCallback': 'useCallback',
  'React.useMemo': 'useMemo',
  'React.useRef': 'useRef',
  'React.ReactNode': 'ReactNode',
  'React.FC': 'FC',
  'React.Component': 'Component',
  'React.ComponentProps': 'ComponentProps',
  'React.ElementRef': 'ElementRef',
  'React.HTMLAttributes': 'HTMLAttributes',
  'React.ComponentPropsWithoutRef': 'ComponentPropsWithoutRef'
};

function extractReactUsages(content) {
  const usages = new Set();
  
  // Find all React.* usages
  const reactRegex = /React\.([A-Za-z]+)/g;
  let match;
  while ((match = reactRegex.exec(content)) !== null) {
    usages.add(match[1]);
  }
  
  return Array.from(usages);
}

function buildImportStatement(usages) {
  if (usages.length === 0) return '';
  
  const importItems = [...new Set(usages)].sort();
  if (importItems.length <= 3) {
    return `import { ${importItems.join(', ')} } from 'react';`;
  } else {
    return `import { \n  ${importItems.join(',\n  ')}\n} from 'react';`;
  }
}

function fixReactImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Extract React usages from content
    const reactUsages = extractReactUsages(content);
    
    if (reactUsages.length === 0) return false;
    
    console.log(`📁 ${filePath}: Found ${reactUsages.length} React usages: ${reactUsages.join(', ')}`);
    
    // Remove existing React imports
    content = content.replace(/import\s+React\s*,?\s*\{[^}]*\}\s*from\s*['"]react['"];\s*/g, '');
    content = content.replace(/import\s+React\s*from\s*['"]react['"];\s*/g, '');
    content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"]react['"];\s*/g, '');
    
    // Replace React.* references
    reactUsages.forEach(usage => {
      const regex = new RegExp(`React\\.${usage}`, 'g');
      content = content.replace(regex, usage);
    });
    
    // Build new import statement
    const importStatement = buildImportStatement(reactUsages);
    
    // Add import at the top
    if (content.startsWith('"use client"')) {
      content = content.replace('"use client"', `"use client"\n\n${importStatement}`);
    } else if (content.startsWith("'use client'")) {
      content = content.replace("'use client'", `'use client'\n\n${importStatement}`);
    } else {
      content = `${importStatement}\n${content}`;
    }
    
    // Clean up multiple newlines
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Get all TSX files in client/src
const pattern = 'client/src/**/*.{ts,tsx}';
const files = glob.sync(pattern);

console.log(`📂 Found ${files.length} files to process`);

let fixedCount = 0;
files.forEach(file => {
  if (fixReactImports(file)) {
    fixedCount++;
  }
});

console.log(`🎉 React import fixes complete: ${fixedCount}/${files.length} files updated`);

// Trigger a rebuild
console.log('🔄 Rebuilding frontend...');
import { execSync } from 'child_process';

try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend rebuild complete');
} catch (error) {
  console.error('❌ Rebuild failed:', error.message);
}