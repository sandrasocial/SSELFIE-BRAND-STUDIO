/**
 * BASH COMMAND TOOL
 * Direct bash command execution for agent orchestration
 */

import { spawn } from 'child_process';

export async function bash(parameters: any): Promise<any> {
  console.log('⚡ BASH TOOL:', parameters);
  
  const { command, restart } = parameters;
  
  if (restart) {
    console.log('🔄 BASH: Restart flag detected, ignoring command');
    return 'Bash tool restarted';
  }
  
  if (!command) {
    throw new Error('Command parameter is required');
  }
  
  return new Promise((resolve, reject) => {
    console.log(`🔧 EXECUTING BASH: ${command}`);
    
    // SECURITY: Validate command before execution
    if (!command || typeof command !== 'string') {
      throw new Error('Invalid command format');
    }
    
    // SECURITY FIX: Enhanced command validation and safe execution
    const dangerousPatterns = [/[;&|`$()]/g, /\brm\s+-rf\b/, /\bsudo\b/, /\bsu\b/, />/g];
    const hasDangerousChars = dangerousPatterns.some(pattern => pattern.test(command));
    
    if (hasDangerousChars) {
      throw new Error('Command contains unsafe characters or patterns');
    }
    
    // Whitelist approach for allowed commands
    const allowedCommands = [
      /^ls\b/, /^cat\b/, /^grep\b/, /^find\b/, /^echo\b/, 
      /^npm\s+/, /^node\b/, /^curl\s+/, /^ps\b/, /^pwd$/,
      /^mkdir\b/, /^cp\b/, /^mv\b/, /^chmod\b/
    ];
    
    const isCommandAllowed = allowedCommands.some(pattern => pattern.test(command.trim()));
    if (!isCommandAllowed) {
      throw new Error('Command not in allowed list for security');
    }
    
    // Split command safely to prevent injection
    const commandParts = command.trim().split(/\s+/);
    const baseCommand = commandParts[0];
    const args = commandParts.slice(1).filter(arg => 
      arg.length < 200 && !/[;&|`$()]/.test(arg)
    );
    
    // AGENT NAVIGATION FIX: Auto-navigate to project root for file operations
    const isFileOperation = ['ls', 'find', 'cat', 'grep', 'head', 'tail'].includes(baseCommand);
    const workingDir = isFileOperation && process.cwd().includes('/server') 
      ? process.cwd().replace('/server', '') 
      : process.cwd();
    
    if (isFileOperation && workingDir !== process.cwd()) {
      console.log('🔧 AGENT NAVIGATION: Running from project root:', workingDir);
    }
    
    const child = spawn(baseCommand, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: workingDir,
      env: { ...process.env, PATH: process.env.PATH } // Controlled environment
    });
    
    let stdout = '';
    let stderr = '';
    
    // Smart timeout based on command type - declare before use
    const timeoutMs = getCommandTimeout(command);
    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timeout after ${timeoutMs/1000} seconds. Consider breaking down complex commands or using faster alternatives.`));
    }, timeoutMs);
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      clearTimeout(timeoutId);
      
      // ENHANCED ERROR HANDLING: Provide context and suggestions
      if (code !== 0) {
        const errorOutput = stderr || 'Command failed with no error output';
        const suggestion = getErrorSuggestion(command, code, errorOutput);
        console.log(`❌ BASH FAILED: Exit code ${code}`);
        reject(new Error(`Command failed (exit code ${code}): ${errorOutput}\n\nSuggestion: ${suggestion}`));
        return;
      }
      
      // SMART OUTPUT TRUNCATION: Prevent massive token usage from large outputs
      const output = stdout || stderr || 'Command completed';
      const truncatedOutput = truncateOutput(output, command);
      console.log(`✅ BASH COMPLETED: Exit code ${code}`);
      resolve(truncatedOutput);
    });
    
    child.on('error', (error) => {
      clearTimeout(timeoutId);
      console.error(`❌ BASH ERROR:`, error);
      reject(new Error(`Bash execution failed: ${error.message}`));
    });
  });
}

// SMART OUTPUT TRUNCATION: Prevent massive token usage from command outputs
function truncateOutput(output: string, command: string): string {
  const maxLength = getOutputLimit(command);
  
  if (output.length <= maxLength) {
    return output;
  }
  
  // For long output, show beginning and end with context
  const beginLength = Math.ceil(maxLength * 0.7);
  const endLength = maxLength - beginLength - 100; // Reserve space for truncation message
  
  const beginning = output.substring(0, beginLength);
  const ending = output.substring(output.length - endLength);
  
  return `${beginning}\n\n... [Output truncated - ${output.length} total characters] ...\n\n${ending}`;
}

// Get appropriate output limits based on command type
function getOutputLimit(command: string): number {
  // Large output commands get smaller limits
  if (command.includes('find') || command.includes('grep') || command.includes('ls -la')) {
    return 2000;
  }
  
  // Log files and data commands
  if (command.includes('cat') || command.includes('head') || command.includes('tail')) {
    return 3000;
  }
  
  // Build and install commands can be verbose
  if (command.includes('npm') || command.includes('build') || command.includes('install')) {
    return 1500;
  }
  
  // Default limit for other commands
  return 4000;
}

// SMART TIMEOUT: Different commands need different timeout periods
function getCommandTimeout(command: string): number {
  // Long-running operations
  if (command.includes('npm install') || command.includes('git clone') || command.includes('download')) {
    return 120000; // 2 minutes
  }
  
  // Database operations
  if (command.includes('psql') || command.includes('database') || command.includes('migration')) {
    return 60000; // 1 minute
  }
  
  // Search operations
  if (command.includes('find') && command.includes('-exec')) {
    return 45000; // 45 seconds
  }
  
  // Quick commands
  return 30000; // 30 seconds default
}

// ERROR SUGGESTIONS: Help agents understand and fix common issues
function getErrorSuggestion(command: string, exitCode: number, errorOutput: string): string {
  // Permission issues
  if (errorOutput.includes('Permission denied') || exitCode === 126) {
    return 'Try using relative paths or check file permissions. Avoid operations requiring sudo.';
  }
  
  // File not found
  if (errorOutput.includes('No such file') || exitCode === 127) {
    return 'Check if the file/command exists. Use `ls` to verify paths or `which` to check if commands are available.';
  }
  
  // Network issues
  if (errorOutput.includes('Connection refused') || errorOutput.includes('timeout')) {
    return 'Network issue detected. Check if services are running or try again later.';
  }
  
  // Syntax errors
  if (errorOutput.includes('syntax error') || exitCode === 2) {
    return 'Command syntax issue. Check command format and escape special characters.';
  }
  
  // Resource issues
  if (errorOutput.includes('No space left') || errorOutput.includes('out of memory')) {
    return 'Resource constraint detected. Try cleaning up temporary files or simplifying the operation.';
  }
  
  // Default suggestion
  return 'Try breaking the command into smaller parts or use an alternative approach. Check the error output for specific details.';
}