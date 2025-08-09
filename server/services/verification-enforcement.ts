/**
 * VERIFICATION-FIRST ENFORCEMENT SYSTEM
 * Enforces verification protocols at execution level, not just training level
 */

export class VerificationEnforcement {
  
  /**
   * Keywords that indicate an agent is claiming completion without verification
   */
  private static COMPLETION_CLAIMS = [
    'completed', 'finished', 'done', 'ready', 'implemented', 'built', 'created',
    '✅', 'success', 'working', 'operational', 'deployed', 'fixed', 'resolved'
  ];

  /**
   * Tool names that constitute actual verification
   */
  private static VERIFICATION_TOOLS = [
    'str_replace_based_edit_tool', 'bash', 'get_latest_lsp_diagnostics', 
    'web_search', 'execute_sql_tool'
  ];

  /**
   * Analyzes if agent response contains completion claims without verification
   */
  static analyzeResponse(response: string, toolsUsed: string[]): {
    hasCompletionClaims: boolean;
    hasVerificationTools: boolean;
    requiresVerification: boolean;
    violationDetails: string[];
  } {
    const hasCompletionClaims = this.COMPLETION_CLAIMS.some(claim => 
      response.toLowerCase().includes(claim.toLowerCase())
    );

    const hasVerificationTools = toolsUsed.some(tool => 
      this.VERIFICATION_TOOLS.includes(tool)
    );

    const requiresVerification = hasCompletionClaims && !hasVerificationTools;
    
    const violationDetails: string[] = [];
    if (requiresVerification) {
      violationDetails.push('Agent claims completion without using verification tools');
      violationDetails.push(`Completion claims found: ${this.COMPLETION_CLAIMS.filter(claim => 
        response.toLowerCase().includes(claim.toLowerCase())
      ).join(', ')}`);
      violationDetails.push(`Verification tools used: ${toolsUsed.length ? toolsUsed.join(', ') : 'NONE'}`);
    }

    return {
      hasCompletionClaims,
      hasVerificationTools,
      requiresVerification,
      violationDetails
    };
  }

  /**
   * Enforces verification requirements by injecting mandatory verification prompt
   */
  static enforceVerificationFirst(systemPrompt: string, message: string): string {
    // Check if this appears to be a work task that would benefit from verification
    const isWorkTask = this.isWorkTask(message);
    
    if (!isWorkTask) {
      return systemPrompt;
    }

    const verificationEnforcement = `

## 🔴 MANDATORY VERIFICATION-FIRST PROTOCOL ENFORCEMENT

**CRITICAL**: Before claiming ANY task is complete, working, or implemented, you MUST:

1. **USE TOOLS TO VERIFY** - Never claim completion without tool-based evidence
   - Use \`bash\` to search and explore actual files
   - Use \`str_replace_based_edit_tool\` to view actual file contents
   - Use \`get_latest_lsp_diagnostics\` to check for errors

2. **NO COMPLETION WITHOUT PROOF** - If you use words like "completed", "finished", "working", "implemented", "✅", etc., you MUST have tool evidence

3. **HONEST GAP REPORTING** - If verification reveals issues:
   - Say "NEEDS IMPLEMENTATION" not "VERIFIED" 
   - Report specific gaps found during verification
   - Provide evidence-based next steps

4. **FABRICATION PROHIBITION** - Never assume anything works without checking:
   ❌ "I've implemented the dashboard" (without viewing actual files)
   ✅ "I checked the dashboard files and found..." (after using tools)

**VIOLATION CONSEQUENCES**: Responses claiming completion without verification tools will be rejected and flagged as fabrication.

## VERIFICATION ENFORCEMENT ACTIVE ⚡
`;

    return systemPrompt + verificationEnforcement;
  }

  /**
   * Detects if message appears to be a work task requiring verification
   */
  private static isWorkTask(message: string): boolean {
    const workIndicators = [
      'implement', 'create', 'build', 'fix', 'add', 'update', 'deploy', 
      'test', 'check', 'verify', 'analyze', 'audit', 'review', 'setup',
      'configure', 'install', 'debug', 'troubleshoot', 'optimize'
    ];

    return workIndicators.some(indicator => 
      message.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * Creates enforcement report for logging/monitoring
   */
  static createEnforcementReport(
    agentId: string, 
    message: string, 
    response: string, 
    toolsUsed: string[],
    analysis: ReturnType<typeof VerificationEnforcement.analyzeResponse>
  ): string {
    return `
🔍 VERIFICATION ENFORCEMENT REPORT
Agent: ${agentId}
Task: ${message.substring(0, 100)}...
Tools Used: ${toolsUsed.join(', ') || 'NONE'}
Completion Claims: ${analysis.hasCompletionClaims ? 'YES' : 'NO'}
Verification Tools: ${analysis.hasVerificationTools ? 'YES' : 'NO'}
Requires Verification: ${analysis.requiresVerification ? 'YES' : 'NO'}
Violations: ${analysis.violationDetails.join(' | ')}
Status: ${analysis.requiresVerification ? '❌ BLOCKED' : '✅ APPROVED'}
`;
  }
}