/**
 * SIMPLIFIED PROTOCOL ENFORCEMENT SYSTEM  
 * OLGA's Plan Step B: Removed excessive validation checks
 * Keeps only essential safety protocols, allows personalities to flow naturally
 * Updated: August 10, 2025 - Simplified for natural agent interaction
 */

export interface AgentTask {
  agentId: string;
  taskDescription: string;
  targetComponents?: string[];
  timestamp: number;
}

export interface SafetyCheck {
  type: 'DESTRUCTIVE_ACTION' | 'SECURITY_RISK';
  severity: 'CRITICAL';
  description: string;
  preventAction: boolean;
}

export interface SimpleValidationResult {
  isValid: boolean;
  safetyChecks: SafetyCheck[];
  approvedActions: string[];
}

/**
 * SIMPLIFIED PROTOCOL ENFORCER  
 * OLGA's Step B: Only essential safety checks, personalities flow naturally
 */
export class ActiveProtocolEnforcer {
  
  /**
   * SIMPLIFIED: Basic safety validation only
   */
  static validateAgentTask(task: AgentTask): SimpleValidationResult {
    const safetyChecks: SafetyCheck[] = [];
    const approvedActions: string[] = [];
    
    // ONLY ESSENTIAL SAFETY: Prevent destructive actions only
    const destructiveCheck = this.checkForDestructiveActions(task);
    if (destructiveCheck) safetyChecks.push(destructiveCheck);
    
    // ONLY ESSENTIAL SAFETY: Prevent security risks only  
    const securityCheck = this.checkSecurityRisks(task);
    if (securityCheck) safetyChecks.push(securityCheck);
    
    // SIMPLIFIED: Allow all non-destructive tasks to proceed naturally
    const criticalIssues = safetyChecks.filter(check => check.preventAction);
    const isValid = criticalIssues.length === 0;
    
    if (isValid) {
      approvedActions.push(`✅ ${task.agentId} approved - natural personality flow enabled`);
    }
    
    return {
      isValid,
      safetyChecks,
      approvedActions
    };
  }
  
  /**
   * SIMPLIFIED: Only check for truly destructive actions
   */
  private static checkForDestructiveActions(task: AgentTask): SafetyCheck | null {
    const { taskDescription } = task;
    
    // Only prevent clearly destructive actions
    const destructivePatterns = [
      /delete.*database/i,
      /drop.*table/i,
      /rm\s+-rf/i,
      /remove.*production/i,
      /delete.*user.*data/i
    ];
    
    const isDestructive = destructivePatterns.some(pattern => 
      pattern.test(taskDescription)
    );
    
    if (isDestructive) {
      return {
        type: 'DESTRUCTIVE_ACTION',
        severity: 'CRITICAL',
        description: `Potentially destructive action detected`,
        preventAction: true
      };
    }
    
    return null;
  }
  
  /**
   * SIMPLIFIED: Only check for security risks
   */
  private static checkSecurityRisks(task: AgentTask): SafetyCheck | null {
    const { taskDescription } = task;
    
    // Only prevent obvious security risks
    const securityPatterns = [
      /expose.*api.*key/i,
      /hardcode.*password/i,
      /disable.*auth/i,
      /public.*private.*key/i
    ];
    
    const hasSecurityRisk = securityPatterns.some(pattern => 
      pattern.test(taskDescription)
    );
    
    if (hasSecurityRisk) {
      return {
        type: 'SECURITY_RISK',
        severity: 'CRITICAL',
        description: `Security risk detected`,
        preventAction: true
      };
    }
    
    return null;
  }
  
  /**
   * SIMPLIFIED: Basic file safety check only
   */
  static validateFileCreation(
    fileContent: string,
    filePath: string
  ): { canProceed: boolean; message: string } {
    
    // SIMPLIFIED: Only basic safety checks
    if (fileContent.includes('rm -rf') || fileContent.includes('DROP TABLE')) {
      return { 
        canProceed: false, 
        message: 'File contains potentially destructive commands' 
      };
    }
    
    return { canProceed: true, message: 'File content is safe' };
  }

  /**
   * SIMPLIFIED: Basic protocol check only
   */
  static enforceProtocols(
    agentId: string,
    action: 'create' | 'modify',
    filePath: string,
    content: string
  ): { success: boolean; message: string } {
    
    const validation = this.validateFileCreation(content, filePath);
    
    if (!validation.canProceed) {
      return {
        success: false,
        message: `Safety check failed: ${validation.message}`
      };
    }
    
    return { 
      success: true, 
      message: `✅ ${agentId} - natural personality flow enabled for ${action}` 
    };
  }
  
}