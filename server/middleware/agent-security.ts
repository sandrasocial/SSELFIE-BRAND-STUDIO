/**
 * AGENT SECURITY MIDDLEWARE - ROLE-BASED ACCESS CONTROL
 * Ensures secure separation between admin and member agent access
 */

import { Request, Response, NextFunction } from 'express';

export interface AgentSecurityRequest extends Request {
  agentType?: 'admin' | 'member';
  agentSecurityLevel?: 'full' | 'restricted';
}

/**
 * Admin Agent Authentication - Sandra Only
 * Full file modification and development capabilities
 */
export function requireAdminAgent(req: AgentSecurityRequest, res: Response, next: NextFunction) {
  try {
    // Check admin token (fallback authentication)
    const adminToken = req.headers.authorization?.replace('Bearer ', '') || req.body.adminToken;
    const hasAdminToken = adminToken === 'sandra-admin-2025';
    
    // Check session-based authentication (preferred)
    const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
    const isSandra = isAuthenticated && (req.user as any)?.claims?.email === 'ssa@ssasocial.com';
    
    // Require either session-based Sandra auth OR admin token
    if (!isSandra && !hasAdminToken) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Admin agents are only available to Sandra (ssa@ssasocial.com)',
        agentType: 'admin',
        requiresAuth: true
      });
    }
    
    // Set admin security context
    req.agentType = 'admin';
    req.agentSecurityLevel = 'full';
    
    console.log('🔐 Admin agent access granted:', {
      method: isSandra ? 'session' : 'token',
      email: (req.user as any)?.claims?.email || 'token-based'
    });
    
    next();
    
  } catch (error) {
    console.error('❌ Admin agent authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication system error',
      message: 'Unable to verify admin access'
    });
  }
}

/**
 * Member Agent Authentication - All Authenticated Users
 * Guided experience capabilities without file modification
 */
export function requireMemberAgent(req: AgentSecurityRequest, res: Response, next: NextFunction) {
  try {
    // Check standard user authentication
    const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
    
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access AI agents',
        agentType: 'member',
        requiresAuth: true
      });
    }
    
    // Set member security context
    req.agentType = 'member';
    req.agentSecurityLevel = 'restricted';
    
    console.log('🔐 Member agent access granted:', {
      userId: (req.user as any)?.claims?.sub,
      email: (req.user as any)?.claims?.email
    });
    
    next();
    
  } catch (error) {
    console.error('❌ Member agent authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication system error',
      message: 'Unable to verify member access'
    });
  }
}

/**
 * Agent Capability Validator
 * Ensures agents can only access tools appropriate to their security level
 */
export function validateAgentCapabilities(agentType: 'admin' | 'member', requestedTools: string[] = []) {
  const adminTools = ['search_filesystem', 'str_replace_based_edit_tool', 'bash', 'web_search'];
  const memberTools = ['web_search'];
  
  const allowedTools = agentType === 'admin' ? adminTools : memberTools;
  const restrictedTools = requestedTools.filter(tool => !allowedTools.includes(tool));
  
  if (restrictedTools.length > 0) {
    console.warn(`⚠️ Agent capability violation: ${agentType} agent attempted to use restricted tools:`, restrictedTools);
    return {
      allowed: false,
      restrictedTools,
      allowedTools,
      message: `${agentType} agents cannot access: ${restrictedTools.join(', ')}`
    };
  }
  
  return {
    allowed: true,
    allowedTools,
    message: `${agentType} agent capabilities validated`
  };
}

/**
 * File Modification Security Check
 * Prevents member agents from accessing file modification capabilities
 */
export function requireFileModificationAccess(req: AgentSecurityRequest, res: Response, next: NextFunction) {
  if (req.agentType !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Insufficient privileges',
      message: 'File modification requires admin agent access',
      agentType: req.agentType,
      securityLevel: req.agentSecurityLevel
    });
  }
  
  next();
}