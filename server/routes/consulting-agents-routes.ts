import { Router } from 'express';

const router = Router();

/**
 * PHASE 3.1: CONSULTING AGENTS REDIRECTION TO IMPLEMENTATION-AWARE ROUTING
 * All consulting requests now flow through implementation detection system
 */
router.post('/admin/consulting-chat', async (req, res) => {
  try {
    console.log('🔄 PHASE 3.1 REDIRECT: Consulting agent -> Implementation-aware routing');

    // Admin-only access (Sandra) - using req.user from Passport session
    if (!req.user || !(req.user as any)?.claims?.email || (req.user as any).claims.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({
        success: false,
        message: 'Consulting agents are only available to Sandra'
      });
    }

    const { agentId, message } = req.body;

    if (!agentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and message are required'
      });
    }

    // PHASE 3.1: Add consulting flag and redirect to implementation-aware endpoint
    const enhancedRequest = {
      ...req.body,
      consultingMode: true,
      implementationDetectionRequired: true,
      adminToken: 'sandra-admin-2025', // Ensure admin access for redirect
      userId: req.user ? (req.user as any).id : 'admin-sandra'
    };

    console.log(`🔄 PHASE 3.1: Redirecting ${agentId} to implementation-aware routing`);

    // FIXED: Use Claude API service directly - no broken routing
    console.log(`🤖 DIRECT CLAUDE API: ${agentId}`);
    
    const { ClaudeApiServiceRebuilt } = await import('../services/claude-api-service-rebuilt');
    const claudeService = new ClaudeApiServiceRebuilt();
    
    // Get agent configuration
    const { CONSULTING_AGENT_PERSONALITIES } = await import('../agent-personalities-consulting');
    const agentConfig = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    if (!agentConfig) {
      return res.status(404).json({
        success: false,
        message: `Agent ${agentId} not found in consulting system`
      });
    }
    
    const userId = req.user ? (req.user as any).claims.sub : '42585527';
    const conversationId = req.body.conversationId || `admin_${agentId}_${Date.now()}`;
    
    // Enhanced system prompt with implementation protocol
    const systemPrompt = `You are ${agentConfig.name}, ${agentConfig.role}.

${agentConfig.systemPrompt}

🔧 MANDATORY IMPLEMENTATION PROTOCOL:
- You have COMPLETE file system access through tools
- IMMEDIATELY execute file modifications using str_replace_based_edit_tool
- NEVER just view files - always implement requested changes
- When asked to modify code, use str_replace command, not view command
- Create, modify, and update files directly in Sandra's workspace
- Provide real-time progress updates for file operations
- Use the luxury design system: Times New Roman, black/white/gray palette

📁 WORKSPACE ACCESS: Full access to client/, server/, components/, and all directories
⚡ CRITICAL: Execute str_replace_based_edit_tool immediately for ANY modification request
⚡ FORBIDDEN: Analyzing without implementing - always make actual file changes`;

    const result = await claudeService.sendMessage(
      userId,
      agentId,
      conversationId,
      message,
      systemPrompt,
      [], // Tools will be added automatically
      true // Enable tools
    );
    
    // Add consulting mode indicator to response
    const consultingResult = {
      success: true,
      response: result,
      agentId,
      conversationId,
      consultingMode: true,
      implementationDetected: true,
      routedThrough: 'claude-api-direct'
    };

    res.status(200).json(consultingResult);

  } catch (error: any) {
    console.error('❌ PHASE 3.1 CONSULTING REDIRECTION ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Consulting agent redirection failed',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router;