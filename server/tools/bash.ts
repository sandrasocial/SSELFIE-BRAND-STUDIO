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
      const output = stdout || stderr || 'Command completed';
      console.log(`✅ BASH COMPLETED: Exit code ${code}`);
      resolve(output);
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