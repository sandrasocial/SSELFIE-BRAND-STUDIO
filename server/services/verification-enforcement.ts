/**
 * OLGA'S REFORMED VERIFICATION SYSTEM
 * Balanced approach: Enforce verification for implementation claims, allow conversation flow
 * FIXED: No longer blocks normal conversational responses
 */

export class VerificationEnforcement {
  
  /**
   * OLGA'S FIX: Only flag MAJOR implementation claims, not conversational words
   * Allows normal conversation flow while protecting against fabrication
   */
  private static MAJOR_IMPLEMENTATION_CLAIMS = [
    'have implemented', 'have built', 'have created', 'have deployed',
    'is now implemented', 'is now built', 'is now deployed', 'is now operational',
    'implementation is complete', 'build is complete', 'deployment complete',
    'everything is working', 'all systems operational', 'fully implemented'
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
    // OLGA'S FIX: Only check for MAJOR implementation claims, not conversational words
    const responseText = response.toLowerCase();
    const hasCompletionClaims = this.MAJOR_IMPLEMENTATION_CLAIMS.some(claim => 
      responseText.includes(claim.toLowerCase())
    );

    const hasVerificationTools = toolsUsed.some(tool => 
      this.VERIFICATION_TOOLS.includes(tool)
    );

    // OLGA'S FIX: Only require verification for major implementation claims
    const requiresVerification = hasCompletionClaims && !hasVerificationTools;
    
    const violationDetails: string[] = [];
    if (requiresVerification) {
      violationDetails.push('Agent claims major implementation without using verification tools');
      violationDetails.push(`Implementation claims found: ${this.MAJOR_IMPLEMENTATION_CLAIMS.filter(claim => 
        responseText.includes(claim.toLowerCase())
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
   * OLGA'S FIX: Reformed verification enforcement for conversation flow
   * Only enforces verification for major implementation tasks, allows normal conversation
   */
  static enforceVerificationFirst(systemPrompt: string, message: string): string {
    // OLGA'S FIX: Only enforce for major implementation tasks, not all conversations
    const isMajorImplementation = this.isMajorImplementationTask(message);
    
    if (!isMajorImplementation) {
      return systemPrompt; // Allow normal conversation flow
    }

    const verificationEnforcement = `

## 🔄 VERIFICATION GUIDANCE FOR IMPLEMENTATION TASKS

When implementing major features or claiming systems are "fully implemented":

1. **Use tools to verify your work** - Check actual files and test functionality
2. **Be honest about gaps** - If something needs work, say so clearly
3. **Provide evidence** - Show what you actually found/built

**Note**: This applies to major implementation claims, not general conversation or analysis.
`;

    return systemPrompt + verificationEnforcement;
  }

  /**
   * OLGA'S FIX: Only detects MAJOR implementation tasks requiring verification
   * Allows normal conversation, analysis, and minor tasks to flow naturally
   */
  private static isMajorImplementationTask(message: string): boolean {
    const majorImplementationIndicators = [
      'implement the entire', 'build the complete', 'deploy the full',
      'create the whole system', 'implement all features', 'build everything',
      'deploy all components', 'complete implementation of'
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