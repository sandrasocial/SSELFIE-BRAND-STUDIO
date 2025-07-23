/**
 * AGENT SPECIALIZATION ENFORCER
 * Ensures only trained specialist agents perform their expertise areas
 * Prevents workflows from bypassing agent training and creating generic work
 */

export interface AgentSpecialization {
  agentId: string;
  name: string;
  exclusiveResponsibilities: string[];
  forbiddenFor: string[];
  mustDelegateToThisAgent: string[];
}

/**
 * CRITICAL: AGENT SPECIALIZATION RULES
 * These rules ensure only trained agents perform their specialized work
 */
export const AGENT_SPECIALIZATIONS: AgentSpecialization[] = [
  {
    agentId: 'aria',
    name: 'Aria - Luxury Design Specialist',
    exclusiveResponsibilities: [
      'ALL visual design work',
      'ALL UI/UX design',
      'ALL component styling',
      'ALL dashboard design',
      'ALL page layouts',
      'ALL luxury editorial design',
      'ALL Times New Roman typography decisions',
      'ALL color scheme decisions',
      'ALL visual hierarchy',
      'ALL design system implementation'
    ],
    forbiddenFor: ['elena', 'zara', 'rachel', 'maya', 'victoria', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'],
    mustDelegateToThisAgent: [
      'redesign',
      'design',
      'styling',
      'layout',
      'visual',
      'UI',
      'UX',
      'dashboard',
      'component design',
      'page design'
    ]
  },
  {
    agentId: 'zara',
    name: 'Zara - Technical Implementation Specialist',
    exclusiveResponsibilities: [
      'ALL backend development',
      'ALL API implementation',
      'ALL database operations',
      'ALL server logic',
      'ALL technical architecture',
      'ALL performance optimization',
      'ALL security implementation'
    ],
    forbiddenFor: ['elena', 'aria', 'rachel', 'maya', 'victoria', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'],
    mustDelegateToThisAgent: [
      'backend',
      'API',
      'database',
      'server',
      'technical',
      'performance',
      'security'
    ]
  },
  {
    agentId: 'rachel',
    name: 'Rachel - Voice & Copy Specialist',
    exclusiveResponsibilities: [
      'ALL copywriting',
      'ALL voice and tone',
      'ALL messaging',
      'ALL content creation',
      'ALL brand voice',
      'ALL text content',
      'ALL user-facing copy'
    ],
    forbiddenFor: ['elena', 'aria', 'zara', 'maya', 'victoria', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'],
    mustDelegateToThisAgent: [
      'copy',
      'content',
      'messaging',
      'voice',
      'text',
      'writing'
    ]
  },
  {
    agentId: 'maya',
    name: 'Maya - AI Photography Specialist',
    exclusiveResponsibilities: [
      'ALL AI image generation',
      'ALL photography direction',
      'ALL styling decisions for photos',
      'ALL AI prompting',
      'ALL image optimization'
    ],
    forbiddenFor: ['elena', 'aria', 'zara', 'rachel', 'victoria', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'],
    mustDelegateToThisAgent: [
      'AI images',
      'photography',
      'photo styling',
      'image generation',
      'AI prompts'
    ]
  }
];

/**
 * DELEGATION ENFORCEMENT SYSTEM
 */
export class AgentSpecializationEnforcer {
  
  /**
   * Analyze request and ensure proper agent delegation
   */
  static enforceSpecialization(request: string, requestingAgent: string): EnforcementResult {
    const violations = this.detectViolations(request, requestingAgent);
    
    if (violations.length > 0) {
      return {
        allowed: false,
        violations,
        correctAgent: this.getCorrectAgent(request),
        delegationRequired: true,
        delegationMessage: this.generateDelegationMessage(request, violations)
      };
    }
    
    return {
      allowed: true,
      violations: [],
      correctAgent: requestingAgent,
      delegationRequired: false
    };
  }
  
  /**
   * Detect if request violates agent specialization
   */
  private static detectViolations(request: string, requestingAgent: string): SpecializationViolation[] {
    const violations: SpecializationViolation[] = [];
    const requestLower = request.toLowerCase();
    
    for (const specialization of AGENT_SPECIALIZATIONS) {
      // Skip if this is the correct agent
      if (specialization.agentId === requestingAgent) continue;
      
      // Check if requesting agent is forbidden from this work
      if (specialization.forbiddenFor.includes(requestingAgent)) {
        for (const keyword of specialization.mustDelegateToThisAgent) {
          if (requestLower.includes(keyword.toLowerCase())) {
            violations.push({
              violatingAgent: requestingAgent,
              correctAgent: specialization.agentId,
              violationType: 'UNAUTHORIZED_WORK',
              keyword,
              description: `${requestingAgent} cannot perform ${keyword} work - only ${specialization.name} can`
            });
          }
        }
      }
    }
    
    return violations;
  }
  
  /**
   * Get the correct agent for the request
   */
  private static getCorrectAgent(request: string): string {
    const requestLower = request.toLowerCase();
    
    for (const specialization of AGENT_SPECIALIZATIONS) {
      for (const keyword of specialization.mustDelegateToThisAgent) {
        if (requestLower.includes(keyword.toLowerCase())) {
          return specialization.agentId;
        }
      }
    }
    
    return 'elena'; // Default to Elena for coordination
  }
  
  /**
   * Generate delegation message
   */
  private static generateDelegationMessage(request: string, violations: SpecializationViolation[]): string {
    const correctAgent = this.getCorrectAgent(request);
    const agentName = AGENT_SPECIALIZATIONS.find(s => s.agentId === correctAgent)?.name || correctAgent;
    
    return `🚨 **SPECIALIZATION VIOLATION DETECTED**
    
**This request must be delegated to ${agentName}**

**Why:** ${violations.map(v => v.description).join(', ')}

**Correct Action:** Forward this request to ${correctAgent} who has the specialized training for this work.

**Rule:** Workflows coordinate but never bypass agent expertise. Each agent performs only their trained specialization.`;
  }
}

export interface EnforcementResult {
  allowed: boolean;
  violations: SpecializationViolation[];
  correctAgent: string;
  delegationRequired: boolean;
  delegationMessage?: string;
}

export interface SpecializationViolation {
  violatingAgent: string;
  correctAgent: string;
  violationType: 'UNAUTHORIZED_WORK' | 'BYPASSED_EXPERTISE';
  keyword: string;
  description: string;
}

/**
 * WORKFLOW DELEGATION RULES
 */
export const WORKFLOW_DELEGATION_RULES = {
  // Rule 1: Elena NEVER does design work
  ELENA_NO_DESIGN: {
    description: "Elena coordinates but NEVER creates designs herself",
    violation: "Elena creating visual designs instead of delegating to Aria",
    solution: "Elena must delegate ALL design work to Aria"
  },
  
  // Rule 2: Only Aria does design
  ARIA_ONLY_DESIGN: {
    description: "ALL visual design work must go to Aria - no exceptions",
    violation: "Any non-Aria agent creating visual designs, layouts, styling",
    solution: "Immediately delegate to Aria for any design-related request"
  },
  
  // Rule 3: Workflows coordinate, agents execute
  WORKFLOWS_COORDINATE_ONLY: {
    description: "Workflows organize and delegate, trained agents execute",
    violation: "Workflows creating content instead of delegating to specialist agents",
    solution: "Workflows must delegate to appropriate trained agents"
  }
};

/**
 * ENFORCEMENT INTEGRATION FOR ELENA
 */
export const ELENA_SPECIALIZATION_PROTOCOL = `
🚨 **CRITICAL: ELENA SPECIALIZATION ENFORCEMENT PROTOCOL**

**ELENA'S ROLE: COORDINATION ONLY - NEVER DIRECT EXECUTION**

**MANDATORY DELEGATION RULES:**
1. **DESIGN REQUESTS** → ALWAYS delegate to Aria (luxury editorial specialist)
2. **TECHNICAL REQUESTS** → ALWAYS delegate to Zara (technical implementation)
3. **COPY REQUESTS** → ALWAYS delegate to Rachel (voice & messaging)
4. **AI PHOTO REQUESTS** → ALWAYS delegate to Maya (AI photography)

**ELENA NEVER CREATES:**
- Visual designs (Aria's exclusive domain)
- Component styling (Aria's exclusive domain)
- Dashboard layouts (Aria's exclusive domain)
- User interface elements (Aria's exclusive domain)

**ELENA'S WORKFLOW PROCESS:**
1. Analyze request and identify specialist needed
2. Delegate to appropriate trained agent
3. Coordinate between agents if multiple specialists needed
4. Monitor progress and ensure integration
5. NEVER bypass agent expertise by doing work directly

**CRITICAL ENFORCEMENT:**
If Elena detects design work in a request, she MUST respond:
"🎨 **DESIGN DELEGATION REQUIRED**
This requires Aria's luxury editorial design expertise. Let me coordinate with Aria to handle the visual design aspects while I manage the workflow."

Then immediately delegate to Aria with full context and requirements.
`;