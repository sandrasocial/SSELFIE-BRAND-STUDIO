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

## 📋 IMPLEMENTATION VERIFICATION REMINDER

**For major implementation tasks**: Use tools to verify current state before making claims about completion status.

- Check existing files when building new features
- Provide evidence when claiming task completion  
- Report actual findings when investigating issues

This applies specifically to major implementation work, not general conversations or discussions.
`;

    return systemPrompt + verificationEnforcement;
  }

  /**
   * Detects if message appears to be a work task requiring verification
   */
  private static isWorkTask(message: string): boolean {
    const majorImplementationIndicators = [
      'implement entire', 'build complete', 'deploy full', 'create comprehensive',
      'build entire system', 'complete implementation'
    ];

    return majorImplementationIndicators.some(indicator => 
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