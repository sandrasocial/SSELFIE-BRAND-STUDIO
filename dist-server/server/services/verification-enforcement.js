export class VerificationEnforcement {
    static MAJOR_IMPLEMENTATION_CLAIMS = [
        'have implemented', 'have built', 'have created', 'have deployed',
        'is now implemented', 'is now built', 'is now deployed', 'is now operational',
        'implementation is complete', 'build is complete', 'deployment complete',
        'everything is working', 'all systems operational', 'fully implemented'
    ];
    static VERIFICATION_TOOLS = [
        'str_replace_based_edit_tool', 'bash', 'get_latest_lsp_diagnostics',
        'web_search', 'execute_sql_tool'
    ];
    static analyzeResponse(response, toolsUsed) {
        const responseText = response.toLowerCase();
        const hasCompletionClaims = this.MAJOR_IMPLEMENTATION_CLAIMS.some(claim => responseText.includes(claim.toLowerCase()));
        const hasVerificationTools = toolsUsed.some(tool => this.VERIFICATION_TOOLS.includes(tool));
        const requiresVerification = hasCompletionClaims && !hasVerificationTools;
        const violationDetails = [];
        if (requiresVerification) {
            violationDetails.push('Agent claims major implementation without using verification tools');
            violationDetails.push(`Implementation claims found: ${this.MAJOR_IMPLEMENTATION_CLAIMS.filter(claim => responseText.includes(claim.toLowerCase())).join(', ')}`);
            violationDetails.push(`Verification tools used: ${toolsUsed.length ? toolsUsed.join(', ') : 'NONE'}`);
        }
        return {
            hasCompletionClaims,
            hasVerificationTools,
            requiresVerification,
            violationDetails
        };
    }
    static enforceVerificationFirst(systemPrompt, message) {
        const isMajorImplementation = this.isMajorImplementationTask(message);
        if (!isMajorImplementation) {
            return systemPrompt;
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
    static isMajorImplementationTask(message) {
        const majorImplementationIndicators = [
            'implement the entire', 'build the complete', 'deploy the full',
            'create the whole system', 'implement all features', 'build everything',
            'deploy all components', 'complete implementation of'
        ];
        return majorImplementationIndicators.some(indicator => message.toLowerCase().includes(indicator.toLowerCase()));
    }
    static createEnforcementReport(agentId, message, response, toolsUsed, analysis) {
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
//# sourceMappingURL=verification-enforcement.js.map