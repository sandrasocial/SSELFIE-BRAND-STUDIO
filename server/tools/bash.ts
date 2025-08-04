import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BashInput {
  command: string;
  timeout?: number;
}

interface BashResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

export async function bash(input: BashInput, bypassMode = false): Promise<BashResult> {
  try {
    const { command, timeout = 30000 } = input;
    
    if (bypassMode) {
      console.log(`⚡ BYPASS MODE: Command execution with ZERO API cost: ${command}`);
    } else {
      console.log(`🔧 BASH: Executing command: ${command}`);
    }
    
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      encoding: 'utf8'
    });
    
    return {
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: 0,
      success: true
    };
  } catch (error: any) {
    console.error('❌ BASH ERROR:', error);
    
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message || 'Unknown error',
      exitCode: error.code || 1,
      success: false
    };
  }
}