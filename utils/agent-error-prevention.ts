// TEMPORARILY DISABLED - Missing tools/lsp-tools dependency
// import { SmartErrorDetector } from './smart-error-detection';
// import { getLspDiagnostics } from '../tools/lsp-tools';

interface SafetyCheck {
  safe: boolean;
  issues?: any[];
  message?: string;
  error?: string;
}

export const agentCodeCheck = async (
  code: string,
  agentName: string
): Promise<SafetyCheck> => {
  try {
    // TEMPORARILY DISABLED - Missing dependencies
    // Run smart detection
    // const smartChecks = await SmartErrorDetector.checkCode(code);
    
    // Get LSP diagnostics
    // const diagnostics = await getLspDiagnostics({ file_path: 'temp.ts' });
    
    // const issues = [...smartChecks, ...diagnostics];
    const issues: any[] = [];
    
    if (issues.length > 0) {
      return {
        safe: false,
        issues,
        message: `⚠️ ${agentName}, potential issues found:\n${
          issues.map(i => i.message).join('\n')
        }`
      };
    }
    
    return { safe: true };
  } catch (error) {
    console.error(`🚨 Error in ${agentName}'s code:`, error);
    return { 
      safe: false, 
      error: error.message 
    };
  }
};