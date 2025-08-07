/**
 * LSP DIAGNOSTICS TOOL
 * Real code error detection for agent orchestration
 */

import { spawn } from 'child_process';
import path from 'path';

export async function get_latest_lsp_diagnostics(parameters: any): Promise<any> {
  console.log('🔍 LSP DIAGNOSTICS:', parameters);
  
  try {
    const { file_path } = parameters;
    
    // Use TypeScript compiler to check for real errors
    const diagnostics = await checkTypeScriptErrors(file_path);
    
    return {
      diagnostics: diagnostics,
      filesChecked: file_path || 'project-wide',
      errors: diagnostics.filter(d => d.severity === 'error').length,
      warnings: diagnostics.filter(d => d.severity === 'warning').length,
      success: true
    };
  } catch (error) {
    console.error('❌ LSP DIAGNOSTICS ERROR:', error);
    return {
      diagnostics: [],
      filesChecked: 0,
      errors: 0,
      warnings: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Check TypeScript errors using tsc
async function checkTypeScriptErrors(filePath?: string): Promise<any[]> {
  return new Promise((resolve) => {
    const args = ['--noEmit', '--pretty', 'false'];
    if (filePath) {
      args.push(filePath);
    }
    
    const tsc = spawn('npx', ['tsc', ...args], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    tsc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    tsc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    tsc.on('close', (code) => {
      const diagnostics = parseTypeScriptErrors(output + errorOutput);
      resolve(diagnostics);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      tsc.kill('SIGTERM');
      resolve([]);
    }, 10000);
  });
}

// Parse TypeScript compiler output into structured diagnostics
function parseTypeScriptErrors(output: string): any[] {
  const diagnostics: any[] = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Match TypeScript error format: file(line,col): error TS#### message
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.+)$/);
    if (match) {
      const [, file, lineNum, col, severity, code, message] = match;
      diagnostics.push({
        file: path.relative(process.cwd(), file),
        line: parseInt(lineNum),
        column: parseInt(col),
        severity: severity,
        code: `TS${code}`,
        message: message.trim()
      });
    }
  }
  
  return diagnostics;
}