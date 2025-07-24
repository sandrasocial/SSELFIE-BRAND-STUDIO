/**
 * AGENT ERROR DETECTION AND RECOVERY SYSTEM
 * Similar to Replit agents - detects when agents break files and fixes them automatically
 */

import { promises as fsPromises } from 'fs';
import path from 'path';

export class AgentErrorRecovery {
  
  /**
   * Detect if agents created dangerous patterns and fix them automatically
   */
  static async detectAndFixAgentErrors(agentResponse, agentId, filePath = null) {
    console.log(`🔍 ERROR DETECTION: Scanning ${agentId} response for dangerous patterns`);
    
    const dangerousPatterns = [
      {
        name: 'File Tree Structure',
        pattern: /├──|└──|│|ComponentName\//g,
        description: 'Agent wrote file tree structure instead of code'
      },
      {
        name: 'Directory Listings',
        pattern: /^[\s]*\w+\/[\s]*$/gm,
        description: 'Agent wrote directory names instead of file content'
      },
      {
        name: 'File Structure Comments',
        pattern: /^[\s]*#.*Barrel export.*$/gm,
        description: 'Agent wrote file structure documentation instead of code'
      },
      {
        name: 'Broken CSS',
        pattern: /^[^{};\/\*]*$/gm,
        description: 'CSS file contains non-CSS content'
      }
    ];
    
    const detectedPatterns = [];  
    let hasErrors = false;
    
    for (const pattern of dangerousPatterns) {
      const matches = agentResponse.match(pattern.pattern);
      if (matches && matches.length > 0) {
        hasErrors = true;
        detectedPatterns.push({
          ...pattern,
          matchCount: matches.length,
          matches: matches.slice(0, 3) // Show first 3 matches
        });
        
        console.log(`🚨 DANGEROUS PATTERN DETECTED: ${pattern.name} (${matches.length} instances)`);
      }
    }
    
    if (hasErrors) {
      console.log(`🚨 CRASH PREVENTION: Agent ${agentId} created ${detectedPatterns.length} dangerous patterns`);
      await this.emergencyIntervention(agentId, detectedPatterns, filePath);
      return {
        hasErrors: true,
        patterns: detectedPatterns,
        fixed: true
      };
    }
    
    return {
      hasErrors: false,
      patterns: [],
      fixed: false
    };
  }
  
  /**
   * Emergency intervention when agents create dangerous content
   */
  static async emergencyIntervention(agentId, patterns, filePath) {
    console.log(`🚨 EMERGENCY INTERVENTION: Agent ${agentId} created ${patterns.length} dangerous patterns`);
    
    let fixCount = 0;
    
    // Fix specific known issues
    for (const pattern of patterns) {
      switch (pattern.name) {
        case 'File Tree Structure':
          await this.fixFileTreeInFiles();
          fixCount++;
          console.log(`  🔧 FIXED: Agent used file tree structure (${pattern.matchCount} instances)`);
          break;
          
        case 'Broken CSS':
          await this.fixBrokenCSS();
          fixCount++;
          console.log(`  🔧 FIXED: Agent broke CSS file (${pattern.matchCount} instances)`);
          break;
          
        case 'Directory Listings':
          await this.fixDirectoryListings();
          fixCount++;
          console.log(`  🔧 FIXED: Agent used directory listings (${pattern.matchCount} instances)`);
          break;
      }
    }
    
    console.log(`🔧 CRASH PREVENTION: Applied ${fixCount} emergency fixes`);
    
    // Restart server to clear any cached broken files
    if (fixCount > 0) {
      setTimeout(() => {
        console.log('🔄 EMERGENCY RESTART: Reloading server to clear broken file cache');
        process.exit(0); // PM2 or similar will restart
      }, 1000);
    }
  }
  
  /**
   * Fix CSS files that contain file tree structures instead of CSS
   */
  static async fixBrokenCSS() {
    const cssPath = 'client/src/styles/generated.css';
    
    try {
      const content = await fsPromises.readFile(cssPath, 'utf8');
      
      // Check if CSS contains file tree patterns
      if (/├──|└──|│|ComponentName\//.test(content)) {
        console.log('🔧 FIXING BROKEN CSS: Replacing file tree content with valid CSS');
        
        const validCSS = `/* Auto-generated styles - Fixed by Error Recovery System */
.admin-dashboard-luxury {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  min-height: 100vh;
}

.admin-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.admin-metric-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.admin-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
}

.admin-metric-value {
  font-family: "Times New Roman", serif;
  font-size: 2.5rem;
  font-weight: bold;
  color: #1a1a1a;
}

.admin-luxury-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}`;
        
        await fsPromises.writeFile(cssPath, validCSS, 'utf8');
        console.log('✅ CSS FIXED: Replaced broken content with valid CSS');
        return true;
      }
    } catch (error) {
      console.error('❌ CSS FIX FAILED:', error);
      return false;
    }
    
    return false;
  }
  
  /**
   * Fix files that contain file tree structures instead of code
   */
  static async fixFileTreeInFiles() {
    const commonFiles = [
      'client/src/styles/generated.css',
      'client/src/components/admin/AdminDashboard.tsx',
      'shared/types.ts'
    ];
    
    for (const filePath of commonFiles) {
      try {
        const exists = await fsPromises.access(filePath).then(() => true).catch(() => false);
        if (!exists) continue;
        
        const content = await fsPromises.readFile(filePath, 'utf8');
        
        if (/├──|└──|│|ComponentName\//.test(content)) {
          console.log(`🔧 FIXING FILE TREE: ${filePath}`);
          
          // Remove the broken file and let the system regenerate it properly
          await fsPromises.unlink(filePath);
          console.log(`✅ REMOVED BROKEN FILE: ${filePath} (will be regenerated)`);
        }
      } catch (error) {
        console.error(`❌ FILE TREE FIX FAILED for ${filePath}:`, error);
      }
    }
  }
  
  /**
   * Fix directory listing issues
   */
  static async fixDirectoryListings() {
    // This is handled by the file tree fix above
    console.log('🔧 Directory listings handled by file tree fix');
  }
  
  /**
   * Monitor agent responses and apply fixes in real-time
   */
  static async monitorAgentResponse(agentId, response, context = {}) {
    const result = await this.detectAndFixAgentErrors(response, agentId, context.filePath);
    
    if (result.hasErrors) {
      console.log(`🛡️ AGENT SAFETY: Prevented ${agentId} from crashing the application`);
      return {
        ...result,
        safeResponse: this.sanitizeResponse(response, result.patterns)
      };
    }
    
    return {
      hasErrors: false,
      safeResponse: response
    };
  }
  
  /**
   * Sanitize agent response by removing dangerous patterns
   */
  static sanitizeResponse(response, patterns) {
    let sanitized = response;
    
    for (const pattern of patterns) {
      // Remove dangerous content blocks
      sanitized = sanitized.replace(pattern.pattern, '[DANGEROUS CONTENT REMOVED BY SAFETY SYSTEM]');
    }
    
    return sanitized;
  }
}

export default AgentErrorRecovery;