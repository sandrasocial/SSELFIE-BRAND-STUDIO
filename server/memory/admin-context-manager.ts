/**
 * ADMIN CONTEXT MANAGER - PROJECT STRUCTURE AWARE (PHASE 2)
 * Integrates with existing project protection system and enhanced path intelligence
 * Connected to database with full project context awareness for safe agent work
 */

import { db } from '../db';
import { agentConversations, agentSessionContexts } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { EnhancedPathIntelligence } from '../services/enhanced-path-intelligence';

interface AdminAgentContext {
  agentId: string;
  userId: string;
  conversationId: string;
  personality: any;
  adminPrivileges: boolean;
  memoryContext: string[];
  lastActivity: Date;
  // PHASE 2: Project structure awareness
  projectContext: ProjectContextData;
}

interface ProjectContextData {
  protectedSystems: ProtectedSystem[];
  safeDevelopmentZones: SafeZone[];
  currentProjectState: ProjectState;
  agentCapabilities: string[];
  conflictPrevention: ConflictPreventionRules;
}

interface ProtectedSystem {
  name: string;
  paths: string[];
  protection_level: 'CRITICAL' | 'PROTECTED' | 'MONITORED';
  reason: string;
  icon: string;
}

interface SafeZone {
  name: string;
  paths: string[];
  permissions: string[];
  description: string;
}

interface ProjectState {
  revenueSystemsStatus: 'PROTECTED' | 'SAFE';
  activeAgents: string[];
  coordinationMode: 'PHASE_1' | 'PHASE_2' | 'PHASE_3';
  lastStructureUpdate: Date;
}

interface ConflictPreventionRules {
  neverModifyPaths: string[];
  requireApprovalPaths: string[];
  safeToModifyPaths: string[];
  autoCorrectEnabled: boolean;
}

export class AdminContextManager {
  private static instance: AdminContextManager;
  private activeContexts = new Map<string, AdminAgentContext>();
  private pathIntelligence: EnhancedPathIntelligence;
  private projectProtectionRules: ProjectContextData;

  private constructor() {
    this.pathIntelligence = new EnhancedPathIntelligence();
    this.initializeProjectContext();
  }

  public static getInstance(): AdminContextManager {
    if (!AdminContextManager.instance) {
      AdminContextManager.instance = new AdminContextManager();
    }
    return AdminContextManager.instance;
  }

  /**
   * PHASE 2: Initialize project structure protection rules
   */
  private initializeProjectContext(): void {
    this.projectProtectionRules = {
      protectedSystems: [
        {
          name: "Maya Revenue Systems",
          paths: [
            "server/unified-generation-service.ts",
            "server/model-training-service.ts", 
            "server/image-storage-service.ts",
            "server/routes/maya-ai-routes.ts",
            "server/agents/personalities/maya-personality.ts"
          ],
          protection_level: 'CRITICAL',
          reason: "Generate $97/month subscriptions - NEVER modify",
          icon: "🔒"
        },
        {
          name: "Database Schema",
          paths: ["shared/schema.ts"],
          protection_level: 'CRITICAL', 
          reason: "Core data structure - use migrations only",
          icon: "🔒"
        },
        {
          name: "Client Revenue Interface",
          paths: ["client/src"],
          protection_level: 'PROTECTED',
          reason: "User-facing revenue interface - careful modifications only",
          icon: "🔒"
        }
      ],
      safeDevelopmentZones: [
        {
          name: "Admin Agent Development",
          paths: [
            "server/agents/personalities/",
            "server/routes/consulting-agents-routes.ts",
            "admin-development/",
            "server/tools/",
            "server/services/agent-coordination-bridge.ts"
          ],
          permissions: ["CREATE", "MODIFY", "DELETE"],
          description: "Safe zone for admin agent coordination and tools"
        },
        {
          name: "Infrastructure Configuration",
          paths: ["infrastructure/", "_architecture/"],
          permissions: ["CREATE", "MODIFY"],
          description: "Configuration and utility systems"
        }
      ],
      currentProjectState: {
        revenueSystemsStatus: 'PROTECTED',
        activeAgents: [],
        coordinationMode: 'PHASE_2',
        lastStructureUpdate: new Date()
      },
      agentCapabilities: [],
      conflictPrevention: {
        neverModifyPaths: [
          "server/unified-generation-service.ts",
          "server/model-training-service.ts",
          "server/image-storage-service.ts", 
          "server/routes/maya-ai-routes.ts",
          "server/agents/personalities/maya-personality.ts",
          "shared/schema.ts"
        ],
        requireApprovalPaths: ["client/src"],
        safeToModifyPaths: [
          "server/agents/personalities/",
          "server/tools/",
          "server/services/agent-coordination-bridge.ts",
          "admin-development/",
          "infrastructure/",
          "_architecture/"
        ],
        autoCorrectEnabled: true
      }
    };
    
    console.log('🏗️ PROJECT CONTEXT: Initialized protection rules for Phase 2');
  }

  /**
   * PHASE 2: Create project-aware agent context with protection rules
   */
  async createAdminAgentContext(
    agentId: string, 
    userId: string, 
    conversationId: string, 
    personality: any
  ): Promise<AdminAgentContext> {
    console.log(`🤖 ADMIN AGENT ACTIVATION: ${personality.name || agentId} with Phase 2 project context`);
    console.log(`🏗️ PROJECT AWARE: Agent loaded with protection rules and safe development zones`);
    
    // LOAD EXISTING CONTEXT: Create fresh context for now to avoid parsing issues
    let existingMemory = {};

    // Generate agent-specific capabilities based on personality
    const agentCapabilities = this.generateAgentCapabilities(agentId, personality);
    
    const context: AdminAgentContext = {
      agentId,
      userId,
      conversationId,
      personality,
      adminPrivileges: true,
      memoryContext: (existingMemory as any)?.recentInteractions?.message ? 
        [(existingMemory as any).recentInteractions.message] : [],
      lastActivity: new Date(),
      projectContext: {
        ...this.projectProtectionRules,
        agentCapabilities,
        currentProjectState: {
          ...this.projectProtectionRules.currentProjectState,
          activeAgents: [...this.projectProtectionRules.currentProjectState.activeAgents, agentId]
        }
      }
    };

    // SAVE TO DATABASE: Temporarily disabled to fix JSON parsing issue
    // await this.saveContextToDatabase(context);
    
    this.activeContexts.set(`${agentId}-${userId}`, context);
    console.log(`✅ PHASE 2 CONTEXT: ${personality.name || agentId} loaded with project protection awareness`);
    console.log(`🛡️ PROTECTION: ${this.projectProtectionRules.protectedSystems.length} systems protected`);
    console.log(`✅ SAFE ZONES: ${this.projectProtectionRules.safeDevelopmentZones.length} development areas available`);
    return context;
  }

  /**
   * PHASE 2: Generate agent-specific capabilities based on personality and project context
   */
  private generateAgentCapabilities(agentId: string, personality: any): string[] {
    const baseCapabilities = [
      'project_structure_awareness',
      'revenue_system_protection',
      'safe_development_zone_access'
    ];

    // Agent-specific capabilities based on established personalities
    const agentSpecificCapabilities: { [key: string]: string[] } = {
      elena: [
        'workflow_coordination',
        'strategic_planning', 
        'multi_agent_delegation',
        'project_oversight',
        'phase_management'
      ],
      zara: [
        'technical_architecture',
        'backend_development',
        'database_operations',
        'performance_optimization',
        'system_debugging'
      ],
      aria: [
        'ui_design',
        'frontend_development',
        'luxury_design_systems',
        'component_creation',
        'user_experience'
      ],
      maya: [
        'content_creation',
        'brand_strategy',
        'user_engagement',
        'revenue_optimization'
      ],
      victoria: [
        'website_building',
        'business_setup',
        'template_creation',
        'user_onboarding'
      ]
    };

    const specificCapabilities = agentSpecificCapabilities[agentId] || ['general_assistance'];
    return [...baseCapabilities, ...specificCapabilities];
  }

  /**
   * PHASE 2: Check if agent can safely modify a given path
   */
  public canAgentModifyPath(agentId: string, filePath: string): {
    allowed: boolean;
    reason: string;
    suggestion?: string;
  } {
    const context = Array.from(this.activeContexts.values())
      .find(ctx => ctx.agentId === agentId);
    
    if (!context) {
      return {
        allowed: false,
        reason: 'Agent context not found - please activate agent first'
      };
    }

    const { conflictPrevention } = context.projectContext;

    // Check if path is never allowed to be modified
    const isProtected = conflictPrevention.neverModifyPaths.some(protectedPath => 
      filePath.includes(protectedPath) || protectedPath.includes(filePath)
    );

    if (isProtected) {
      return {
        allowed: false,
        reason: 'Path is protected revenue system - modification not allowed',
        suggestion: 'Work in safe development zones instead'
      };
    }

    // Check if path is in safe development zone
    const isSafe = conflictPrevention.safeToModifyPaths.some(safePath =>
      filePath.startsWith(safePath) || safePath.includes(filePath)
    );

    if (isSafe) {
      return {
        allowed: true,
        reason: 'Path is in safe development zone'
      };
    }

    // Check if requires approval
    const requiresApproval = conflictPrevention.requireApprovalPaths.some(approvalPath =>
      filePath.startsWith(approvalPath)
    );

    if (requiresApproval) {
      return {
        allowed: false,
        reason: 'Path requires approval before modification',
        suggestion: 'Use protected system modification tools or work in safe zones'
      };
    }

    // Use path intelligence for suggestion
    const pathCorrection = this.pathIntelligence.correctPath(filePath);
    const isCorrectedSafe = conflictPrevention.safeToModifyPaths.some(safePath =>
      pathCorrection.correctedPath.startsWith(safePath)
    );

    if (isCorrectedSafe) {
      return {
        allowed: true,
        reason: 'Path corrected to safe development zone',
        suggestion: `Consider using: ${pathCorrection.correctedPath}`
      };
    }

    return {
      allowed: false,
      reason: 'Path not in known safe development zones',
      suggestion: 'Work in designated safe zones for agent development'
    };
  }

  /**
   * PHASE 2: Get project context for agent
   */
  public getProjectContextForAgent(agentId: string): ProjectContextData | null {
    const contextKey = Array.from(this.activeContexts.keys())
      .find(key => key.startsWith(agentId));
    
    if (!contextKey) return null;
    
    const context = this.activeContexts.get(contextKey);
    return context?.projectContext || null;
  }

  /**
   * PHASE 2: Update agent's project understanding based on completed work
   */
  public async updateAgentProjectLearning(
    agentId: string,
    workCompleted: {
      filesModified: string[];
      tasksCompleted: string[];
      conflictsAvoided: string[];
    }
  ): Promise<void> {
    const contextKey = Array.from(this.activeContexts.keys())
      .find(key => key.startsWith(agentId));
    
    if (!contextKey) return;
    
    const context = this.activeContexts.get(contextKey);
    if (!context) return;

    // Update project state with agent's learning
    context.projectContext.currentProjectState.lastStructureUpdate = new Date();
    
    // Log learning for cross-agent sharing
    console.log(`🧠 PHASE 2 LEARNING: ${agentId} completed work safely`);
    console.log(`📁 FILES: ${workCompleted.filesModified.join(', ')}`);
    console.log(`✅ TASKS: ${workCompleted.tasksCompleted.join(', ')}`);
    console.log(`🛡️ CONFLICTS AVOIDED: ${workCompleted.conflictsAvoided.join(', ')}`);
  }

  /**
   * SAVE CONTEXT TO DATABASE: Persist admin agent context
   */
  private async saveContextToDatabase(context: AdminAgentContext): Promise<void> {
    try {
      const contextData = {
        timestamp: context.lastActivity.toISOString(),
        lastConversationId: context.conversationId,
        recentInteractions: {
          agentId: context.agentId,
          personality: context.personality?.name || context.agentId,
          memoryContext: context.memoryContext
        }
      };

      await db.insert(agentSessionContexts).values({
        userId: context.userId,
        agentId: context.agentId,
        sessionId: `${context.userId}_${context.agentId}_session`,
        contextData: contextData,
        workflowState: 'active',
        lastInteraction: context.lastActivity,
        adminBypass: context.adminPrivileges,
        unlimitedContext: true
      }).onConflictDoUpdate({
        target: [agentSessionContexts.userId, agentSessionContexts.agentId],
        set: {
          contextData: contextData,
          lastInteraction: context.lastActivity,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('❌ DATABASE ERROR: Failed to save admin context:', error);
    }
  }

  /**
   * UPDATE CONTEXT: Maintain agent memory and personality state
   */
  async updateContext(contextKey: string, message: string): Promise<void> {
    const context = this.activeContexts.get(contextKey);
    if (context) {
      context.memoryContext.push(message);
      context.lastActivity = new Date();
      
      // Keep last 50 messages for context
      if (context.memoryContext.length > 50) {
        context.memoryContext = context.memoryContext.slice(-50);
      }
    }
  }

  /**
   * GET AGENT CONTEXT: Retrieve full personality and memory context
   */
  getAgentContext(agentId: string, userId: string): AdminAgentContext | undefined {
    return this.activeContexts.get(`${agentId}-${userId}`);
  }
}