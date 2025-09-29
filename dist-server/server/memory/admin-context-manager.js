import { db } from '../drizzle.js';
import { agentSessionContexts } from '../../shared/schema.js';
import { EnhancedPathIntelligence } from '../services/enhanced-path-intelligence.js';
export class AdminContextManager {
    static instance;
    activeContexts = new Map();
    pathIntelligence;
    projectProtectionRules;
    constructor() {
        this.pathIntelligence = new EnhancedPathIntelligence();
        this.initializeProjectContext();
    }
    static getInstance() {
        if (!AdminContextManager.instance) {
            AdminContextManager.instance = new AdminContextManager();
        }
        return AdminContextManager.instance;
    }
    initializeProjectContext() {
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
    async createAdminAgentContext(agentId, userId, conversationId, personality) {
        if (!this.isValidAgentId(agentId)) {
            throw new Error('Invalid agent ID provided');
        }
        if (!this.isValidUserId(userId)) {
            throw new Error('Invalid user ID provided');
        }
        if (!this.isValidConversationId(conversationId)) {
            throw new Error('Invalid conversation ID provided');
        }
        const personalityName = personality?.name || agentId;
        console.log(`🤖 ADMIN AGENT ACTIVATION: ${personalityName} with Phase 2 project context`);
        console.log(`🏗️ PROJECT AWARE: Agent loaded with protection rules and safe development zones`);
        let existingMemory = {};
        const agentCapabilities = this.generateAgentCapabilities(agentId, personality);
        const context = {
            agentId,
            userId,
            conversationId,
            personality,
            adminPrivileges: true,
            memoryContext: this.extractMemoryContext(existingMemory),
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
        this.activeContexts.set(`${agentId}-${userId}`, context);
        console.log(`✅ PHASE 2 CONTEXT: ${personalityName} loaded with project protection awareness`);
        console.log(`🛡️ PROTECTION: ${this.projectProtectionRules.protectedSystems.length} systems protected`);
        console.log(`✅ SAFE ZONES: ${this.projectProtectionRules.safeDevelopmentZones.length} development areas available`);
        return context;
    }
    isValidAgentId(agentId) {
        return typeof agentId === 'string' && agentId.trim().length > 0;
    }
    isValidUserId(userId) {
        return typeof userId === 'string' && userId.trim().length > 0;
    }
    isValidConversationId(conversationId) {
        return typeof conversationId === 'string' && conversationId.trim().length > 0;
    }
    extractMemoryContext(existingMemory) {
        try {
            const recentInteractions = existingMemory.recentInteractions;
            const message = recentInteractions?.message;
            if (typeof message === 'string') {
                return [message];
            }
            return [];
        }
        catch (error) {
            console.warn('⚠️ Failed to extract memory context, using empty array:', error);
            return [];
        }
    }
    generateAgentCapabilities(agentId, personality) {
        const baseCapabilities = [
            'project_structure_awareness',
            'revenue_system_protection',
            'safe_development_zone_access'
        ];
        const agentSpecificCapabilities = {
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
        const personalityCapabilities = personality?.capabilities || [];
        const specificCapabilities = agentSpecificCapabilities[agentId] || ['general_assistance'];
        return [...baseCapabilities, ...personalityCapabilities, ...specificCapabilities];
    }
    canAgentModifyPath(agentId, filePath) {
        if (!this.isValidAgentId(agentId)) {
            return {
                allowed: false,
                reason: 'Invalid agent ID provided'
            };
        }
        if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
            return {
                allowed: false,
                reason: 'Invalid file path provided'
            };
        }
        const context = Array.from(this.activeContexts.values())
            .find(ctx => ctx.agentId === agentId);
        if (!context) {
            return {
                allowed: false,
                reason: 'Agent context not found - please activate agent first'
            };
        }
        const { conflictPrevention } = context.projectContext;
        if (!conflictPrevention || !Array.isArray(conflictPrevention.neverModifyPaths)) {
            console.warn('⚠️ Invalid conflict prevention rules detected');
            return {
                allowed: false,
                reason: 'Configuration error: invalid protection rules'
            };
        }
        const isProtected = conflictPrevention.neverModifyPaths.some(protectedPath => typeof protectedPath === 'string' &&
            (filePath.includes(protectedPath) || protectedPath.includes(filePath)));
        if (isProtected) {
            return {
                allowed: false,
                reason: 'Path is protected revenue system - modification not allowed',
                suggestion: 'Work in safe development zones instead'
            };
        }
        const isSafe = Array.isArray(conflictPrevention.safeToModifyPaths) &&
            conflictPrevention.safeToModifyPaths.some(safePath => typeof safePath === 'string' &&
                (filePath.startsWith(safePath) || safePath.includes(filePath)));
        if (isSafe) {
            return {
                allowed: true,
                reason: 'Path is in safe development zone'
            };
        }
        const requiresApproval = Array.isArray(conflictPrevention.requireApprovalPaths) &&
            conflictPrevention.requireApprovalPaths.some(approvalPath => typeof approvalPath === 'string' && filePath.startsWith(approvalPath));
        if (requiresApproval) {
            return {
                allowed: false,
                reason: 'Path requires approval before modification',
                suggestion: 'Use protected system modification tools or work in safe zones'
            };
        }
        try {
            const pathCorrection = this.pathIntelligence.correctPath(filePath);
            const isCorrectedSafe = Array.isArray(conflictPrevention.safeToModifyPaths) &&
                conflictPrevention.safeToModifyPaths.some(safePath => typeof safePath === 'string' &&
                    pathCorrection.correctedPath.startsWith(safePath));
            if (isCorrectedSafe) {
                return {
                    allowed: true,
                    reason: 'Path corrected to safe development zone',
                    suggestion: `Consider using: ${pathCorrection.correctedPath}`
                };
            }
        }
        catch (error) {
            console.warn('⚠️ Path intelligence correction failed:', error);
        }
        return {
            allowed: false,
            reason: 'Path not in known safe development zones',
            suggestion: 'Work in designated safe zones for agent development'
        };
    }
    getProjectContextForAgent(agentId) {
        const contextKey = Array.from(this.activeContexts.keys())
            .find(key => key.startsWith(agentId));
        if (!contextKey)
            return null;
        const context = this.activeContexts.get(contextKey);
        return context?.projectContext || null;
    }
    async updateAgentProjectLearning(agentId, workCompleted) {
        const contextKey = Array.from(this.activeContexts.keys())
            .find(key => key.startsWith(agentId));
        if (!contextKey)
            return;
        const context = this.activeContexts.get(contextKey);
        if (!context)
            return;
        context.projectContext.currentProjectState.lastStructureUpdate = new Date();
        console.log(`🧠 PHASE 2 LEARNING: ${agentId} completed work safely`);
        console.log(`📁 FILES: ${workCompleted.filesModified.join(', ')}`);
        console.log(`✅ TASKS: ${workCompleted.tasksCompleted.join(', ')}`);
        console.log(`🛡️ CONFLICTS AVOIDED: ${workCompleted.conflictsAvoided.join(', ')}`);
    }
    async saveContextToDatabase(context) {
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
        }
        catch (error) {
            console.error('❌ DATABASE ERROR: Failed to save admin context:', error);
        }
    }
    async updateContext(contextKey, message) {
        const context = this.activeContexts.get(contextKey);
        if (context) {
            context.memoryContext.push(message);
            context.lastActivity = new Date();
            if (context.memoryContext.length > 50) {
                context.memoryContext = context.memoryContext.slice(-50);
            }
        }
    }
    getAgentContext(agentId, userId) {
        return this.activeContexts.get(`${agentId}-${userId}`);
    }
}
//# sourceMappingURL=admin-context-manager.js.map