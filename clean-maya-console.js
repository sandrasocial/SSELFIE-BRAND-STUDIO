#!/usr/bin/env node
/* eslint-disable no-undef */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/services/maya-service.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Remove console statements while preserving code structure
// Pattern 1: console.log/error/warn statements
content = content.replace(/\s*console\.(log|error|warn|info|debug)\([^;]*\);?/g, '');

// Pattern 2: Multi-line console statements
content = content.replace(/\s*console\.(log|error|warn|info|debug)\([^)]*\n[^)]*\);?/g, '');

// Clean up extra empty lines (more than 2 consecutive)
content = content.replace(/\n\n\n+/g, '\n\n');

// Write back the cleaned content
fs.writeFileSync(filePath, content);

console.log('✅ Cleaned maya-service.ts - removed console statements');