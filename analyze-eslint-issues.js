#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * ESLint Issue Analyzer
 * 
 * Analyzes ESLint output and categorizes issues by type and file.
 * Generates a detailed report to help prioritize cleanup work.
 * 
 * Usage: node analyze-eslint-issues.js
 * Output: Console summary + eslint-report.json file
 * 
 * CLEANUP STRATEGY GUIDE:
 * 
 * 1. Console Statements (~1,190):
 *    - Remove: Debug console.log statements
 *    - Keep: console.error for critical errors
 *    - Document: Use // eslint-disable-next-line no-console for intentional usage
 * 
 * 2. TypeScript any (~426):
 *    - Replace with proper types (interfaces, type aliases)
 *    - Use 'unknown' for truly unknown types
 *    - Document necessary 'any' with comments
 * 
 * 3. Unused Variables (~471):
 *    - Remove unused imports
 *    - Prefix unused params with '_'
 *    - Review destructured unused vars carefully
 * 
 * Example fixes:
 * 
 * // Console - Remove debug, keep errors
 * console.log('debug'); // DELETE
 * console.error('critical', err); // KEEP (add comment if needed)
 * 
 * // Any types - Add proper types
 * function foo(data: any) { ... } // BAD
 * function foo(data: UserData) { ... } // GOOD
 * 
 * // Unused vars - Prefix or remove
 * function onClick(event) { ... } // event unused
 * function onClick(_event) { ... } // GOOD - intentionally unused
 * function onClick() { ... } // BETTER - removed if not needed
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Analyzing ESLint issues...\n');

try {
  // Run ESLint with JSON output
  const eslintOutput = execSync('pnpm eslint . --ext ts,tsx --format json', {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024
  });

  const results = JSON.parse(eslintOutput);

  // Categorize issues
  const categories = {};
  const fileStats = [];

  results.forEach(result => {
    const file = result.filePath.replace(process.cwd() + '/', '');
    const issueCount = result.messages.length;

    if (issueCount > 0) {
      fileStats.push({ file, count: issueCount });
    }

    result.messages.forEach(msg => {
      const rule = msg.ruleId || 'unknown';
      if (!categories[rule]) {
        categories[rule] = [];
      }
      categories[rule].push({
        file,
        line: msg.line,
        message: msg.message,
        severity: msg.severity === 2 ? 'error' : 'warning'
      });
    });
  });

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    ESLINT SUMMARY                          ');
  console.log('═══════════════════════════════════════════════════════════\n');

  const totalErrors = Object.values(categories).flat().filter(i => i.severity === 'error').length;
  const totalWarnings = Object.values(categories).flat().filter(i => i.severity === 'warning').length;

  console.log(`Total Errors:   ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  console.log(`Total Issues:   ${totalErrors + totalWarnings}\n`);

  // By Rule
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                 ISSUES BY RULE TYPE                        ');
  console.log('═══════════════════════════════════════════════════════════\n');

  const sortedRules = Object.entries(categories)
    .sort((a, b) => b[1].length - a[1].length);

  sortedRules.forEach(([rule, issues]) => {
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    console.log(`${rule}`);
    console.log(`  Total: ${issues.length} (${errors} errors, ${warnings} warnings)\n`);
  });

  // Top files with most issues
  console.log('═══════════════════════════════════════════════════════════');
  console.log('              FILES WITH MOST ISSUES (Top 20)              ');
  console.log('═══════════════════════════════════════════════════════════\n');

  fileStats
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .forEach(({ file, count }) => {
      console.log(`${count.toString().padStart(4)} issues - ${file}`);
    });

  // Save detailed report
  const report = {
    summary: {
      totalErrors,
      totalWarnings,
      totalIssues: totalErrors + totalWarnings,
      timestamp: new Date().toISOString()
    },
    byRule: sortedRules.map(([rule, issues]) => ({
      rule,
      count: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length
    })),
    topFiles: fileStats.sort((a, b) => b.count - a.count).slice(0, 50),
    details: categories
  };

  fs.writeFileSync('eslint-report.json', JSON.stringify(report, null, 2));
  console.log('\n✅ Detailed report saved to: eslint-report.json\n');

} catch (error) {
  console.error('❌ Error running ESLint analysis:', error.message);
  process.exit(1);
}
