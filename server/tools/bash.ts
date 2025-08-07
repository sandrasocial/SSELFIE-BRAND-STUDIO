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
    
    const child = spawn('bash', ['-c', command], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      // SMART OUTPUT TRUNCATION: Prevent massive token usage from large outputs
      const output = stdout || stderr || 'Command completed';
      const truncatedOutput = truncateOutput(output, command);
      console.log(`✅ BASH COMPLETED: Exit code ${code}`);
      resolve(truncatedOutput);
    });
    
    child.on('error', (error) => {
      console.error(`❌ BASH ERROR:`, error);
      reject(new Error(`Bash execution failed: ${error.message}`));
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Command timeout after 30 seconds'));
    }, 30000);
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