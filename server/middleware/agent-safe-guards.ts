import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

/**
 * Agent Safety Guards - Prevents agents from crashing the application
 * 
 * This middleware system ensures that agent code changes don't break
 * the core application functionality by implementing:
 * 1. Safe import validation 
 * 2. Dependency checking
 * 3. Graceful error handling
 * 4. Rollback capabilities
 */

// Track files that agents have modified for rollback
const agentModifiedFiles = new Set<string>();

// Safe dependency checker
export const checkDependencies = (filePath: string): { safe: boolean; missing: string[] } => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    const missing: string[] = [];
    
    for (const importLine of imports) {
      const match = importLine.match(/from\s+['"]([^'"]+)['"]/);
      if (match) {
        const moduleName = match[1];
        
        // Check if it's a node_modules dependency
        if (!moduleName.startsWith('./') && !moduleName.startsWith('../')) {
          try {
            require.resolve(moduleName);
          } catch {
            missing.push(moduleName);
          }
        }
        // Check if it's a local file
        else if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
          const resolvedPath = path.resolve(path.dirname(filePath), moduleName);
          const possibleExtensions = ['', '.ts', '.js', '.tsx', '.jsx'];
          
          let found = false;
          for (const ext of possibleExtensions) {
            if (fs.existsSync(resolvedPath + ext)) {
              found = true;
              break;
            }
          }
          
          if (!found) {
            missing.push(moduleName);
          }
        }
      }
    }
    
    return { safe: missing.length === 0, missing };
  } catch (error) {
    console.error(`Error checking dependencies for ${filePath}:`, error);
    return { safe: false, missing: ['file-read-error'] };
  }
};

// Agent file modification tracker with production safety
export const trackAgentModification = (filePath: string, agentName: string) => {
  // Check if file is in protected list
  const protectedFiles = [
    'package.json',
    'shared/schema.ts', 
    'server/index.ts',
    'drizzle.config.ts',
    '.env',
    'vite.config.ts',
    'tsconfig.json',
    'tailwind.config.ts'
  ];

  const isProtected = protectedFiles.some(file => 
    filePath.includes(file) || filePath.endsWith(file)
  );

  if (isProtected) {
    console.error(`🚨 CRITICAL: ${agentName} attempted to modify protected file: ${filePath}`);
    return { 
      safe: false, 
      issues: [`Protected file: ${filePath} - modifications blocked for system safety`],
      blocked: true 
    };
  }

  agentModifiedFiles.add(filePath);
  console.log(`🤖 ${agentName} modified: ${filePath}`);
  
  // Check if the modification is safe
  const depCheck = checkDependencies(filePath);
  if (!depCheck.safe) {
    console.warn(`⚠️ ${agentName}'s modification to ${filePath} has missing dependencies:`, depCheck.missing);
    return { safe: false, issues: depCheck.missing };
  }
  
  return { safe: true, issues: [] };
};

// Safe agent code execution wrapper
export const safeAgentExecution = async <T>(
  operation: () => Promise<T>,
  agentName: string,
  context: string
): Promise<{ success: boolean; result?: T; error?: string }> => {
  try {
    const result = await operation();
    return { success: true, result };
  } catch (error: any) {
    console.error(`🚨 ${agentName} error in ${context}:`, error.message);
    
    // Log error details without crashing
    const errorDetails = {
      agent: agentName,
      context,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5), // First 5 lines only
      timestamp: new Date().toISOString()
    };
    
    console.error('Agent error details:', errorDetails);
    
    return { 
      success: false, 
      error: `${agentName} encountered an error: ${error.message}` 
    };
  }
};

// Validate agent tool usage
export const validateAgentToolUsage = (toolName: string, params: any, agentName: string) => {
  const validationRules = {
    'str_replace_based_edit_tool': (params: any) => {
      if (params.command === 'create' && !params.file_text) {
        return { valid: false, reason: 'Missing file_text for create command' };
      }
      if (params.command === 'str_replace' && (!params.old_str || !params.new_str)) {
        return { valid: false, reason: 'Missing old_str or new_str for replace command' };
      }
      return { valid: true };
    },
    
    'execute_sql_tool': (params: any) => {
      if (!params.sql_query) {
        return { valid: false, reason: 'Missing sql_query parameter' };
      }
      // Prevent destructive operations in production
      const destructiveCommands = ['DROP TABLE', 'DELETE FROM', 'TRUNCATE'];
      const query = params.sql_query.toUpperCase();
      for (const cmd of destructiveCommands) {
        if (query.includes(cmd)) {
          return { valid: false, reason: `Potentially destructive SQL command: ${cmd}` };
        }
      }
      return { valid: true };
    }
  };
  
  const validator = validationRules[toolName as keyof typeof validationRules];
  if (validator) {
    const result = validator(params);
    if (!result.valid) {
      console.warn(`⚠️ ${agentName} tool validation failed for ${toolName}: ${result.reason}`);
    }
    return result;
  }
  
  return { valid: true }; // No specific validation for this tool
};

// Emergency safety check middleware
export const emergencySafetyCheck = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for critical system files
    const criticalFiles = [
      'package.json',
      'server/index.ts',
      'server/routes.ts'
    ];
    
    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        console.error(`🚨 CRITICAL: Missing system file: ${file}`);
        return res.status(500).json({
          error: 'System integrity compromised',
          message: `Critical file missing: ${file}`
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Emergency safety check failed:', error);
    next(); // Continue despite error to avoid blocking
  }
};

export { agentModifiedFiles };