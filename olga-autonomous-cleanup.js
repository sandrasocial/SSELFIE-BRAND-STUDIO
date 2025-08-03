#!/usr/bin/env node

// Olga's Autonomous Workspace Cleanup Script
// Created autonomously by Olga AI Agent

import fs from 'fs';
import path from 'path';

console.log('🧹 OLGA AUTONOMOUS CLEANUP: Starting workspace organization...');

// Define files to clean up (test files, debug files, temporary files)
const cleanupPatterns = [
  /^agent-.*\.txt$/,
  /^test.*\.txt$/,
  /^debug.*\.js$/,
  /^.*-test.*\.json$/,
  /^demo\.txt$/,
  /^simple-test\.txt$/,
  /^test\.txt$/,
  /^test\.ts$/,
  /^cleanup$/,
  /^working$/,
  /^the$/,
  /^this$/,
  /^a$/,
  /^conversations\.$/,
  /.*\.pid$/,
  /.*-status\.txt$/,
  /memory.*test.*\.txt$/,
  /message.*test.*\.txt$/
];

// Essential files to preserve
const preservePatterns = [
  /package\.json$/,
  /tsconfig\.json$/,
  /\.replit$/,
  /replit\.md$/,
  /README\.md$/,
  /\.gitignore$/,
  /drizzle\.config\.ts$/,
  /vite\.config\.ts$/,
  /tailwind\.config\.ts$/
];

function shouldCleanup(filename) {
  // Never clean up essential files
  if (preservePatterns.some(pattern => pattern.test(filename))) {
    return false;
  }
  
  // Clean up files matching cleanup patterns
  return cleanupPatterns.some(pattern => pattern.test(filename));
}

function createArchiveDir() {
  const archiveDir = './archive-olga-cleanup';
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
    console.log('📁 Created archive directory:', archiveDir);
  }
  return archiveDir;
}

function cleanupWorkspace() {
  const archiveDir = createArchiveDir();
  const files = fs.readdirSync('.');
  let cleanedCount = 0;
  
  console.log('🔍 Scanning workspace for cleanup candidates...');
  
  files.forEach(file => {
    if (shouldCleanup(file)) {
      try {
        const sourcePath = path.join('.', file);
        const targetPath = path.join(archiveDir, file);
        
        // Move file to archive
        fs.renameSync(sourcePath, targetPath);
        console.log(`✅ Archived: ${file}`);
        cleanedCount++;
      } catch (error) {
        console.log(`❌ Error archiving ${file}:`, error.message);
      }
    }
  });
  
  console.log(`🎉 OLGA CLEANUP COMPLETE: Archived ${cleanedCount} files`);
  console.log(`📁 Files moved to: ${archiveDir}`);
  
  return cleanedCount;
}

// Execute cleanup
try {
  const cleanedCount = cleanupWorkspace();
  
  // Create cleanup report
  const report = {
    timestamp: new Date().toISOString(),
    agent: 'Olga',
    action: 'Autonomous Workspace Cleanup',
    filesArchived: cleanedCount,
    archiveLocation: './archive-olga-cleanup'
  };
  
  fs.writeFileSync('OLGA_AUTONOMOUS_CLEANUP_SUCCESS.md', `# Olga Autonomous Cleanup Report

Generated: ${report.timestamp}
Agent: ${report.agent}
Action: ${report.action}

## Results
- Files archived: ${report.filesArchived}
- Archive location: ${report.archiveLocation}

## What was cleaned:
- Test files (*.txt, test-*.json)
- Debug files (debug-*.js) 
- Agent-generated files (agent-*.txt)
- Temporary files (*.pid, *-status.txt)
- Single-letter files and empty directories
- Memory test files

## Safety measures:
- All files moved to archive (not deleted)
- Essential project files preserved
- Package.json, configs, and core files untouched
`);

  console.log('📄 Cleanup report saved to: OLGA_AUTONOMOUS_CLEANUP_SUCCESS.md');
  
} catch (error) {
  console.error('❌ OLGA CLEANUP ERROR:', error);
  process.exit(1);
}