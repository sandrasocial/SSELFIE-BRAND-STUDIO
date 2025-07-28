/**
 * Elena Workflow Authentication Middleware
 * Enables authentication bypass for coordinated agent file operations during Elena workflows
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Enhanced authentication middleware for Elena workflow execution
 * Allows agents to inherit authentication context during coordinated workflows
 */
export const elenaWorkflowAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 ELENA WORKFLOW AUTH: Checking authentication context');

  // Check for Elena workflow context headers
  const workflowContext = req.headers['x-workflow-context'];
  const adminToken = req.headers['x-admin-token'] || req.body?.adminToken || req.query?.adminToken;
  const authHeader = req.headers.authorization;

  // Elena workflow execution context - inherit authentication
  if (workflowContext === 'elena-autonomous-execution' && adminToken === 'sandra-admin-2025') {
    console.log('✅ ELENA WORKFLOW AUTH: Autonomous execution context validated');
    // Mark request as Elena workflow execution for downstream middleware
    (req as any).elenaWorkflowExecution = true;
    (req as any).workflowAuthContext = 'elena-autonomous';
    return next();
  }

  // Standard admin token authentication
  if (authHeader === 'Bearer sandra-admin-2025' || adminToken === 'sandra-admin-2025') {
    console.log('✅ ELENA WORKFLOW AUTH: Admin token validated');
    return next();
  }

  // Session-based authentication check
  if (req.isAuthenticated && req.isAuthenticated() && (req as any).user?.claims?.email === 'ssa@ssasocial.com') {
    console.log('✅ ELENA WORKFLOW AUTH: Session authentication validated');
    return next();
  }

  console.log('❌ ELENA WORKFLOW AUTH: Authentication failed');
  return res.status(401).json({
    success: false,
    error: 'Authentication required for Elena workflow execution',
    message: 'Admin authentication or Elena workflow context required'
  });
};

/**
 * File operation authentication bypass for Elena workflows
 * Allows agents to modify files during coordinated workflow execution
 */
export const elenaFileOperationAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 ELENA FILE AUTH: Checking file operation authentication');

  // Check if this is Elena workflow execution context
  if ((req as any).elenaWorkflowExecution) {
    console.log('✅ ELENA FILE AUTH: File operations authorized for Elena workflow');
    return next();
  }

  // Check for Elena workflow context from agent requests
  const workflowContext = req.headers['x-workflow-context'];
  const adminToken = req.headers['x-admin-token'] || req.body?.adminToken;

  if (workflowContext === 'elena-autonomous-execution' && adminToken === 'sandra-admin-2025') {
    console.log('✅ ELENA FILE AUTH: Agent file operations authorized for Elena workflow');
    return next();
  }

  // Standard authentication checks
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer sandra-admin-2025' || adminToken === 'sandra-admin-2025') {
    console.log('✅ ELENA FILE AUTH: Admin token validated for file operations');
    return next();
  }

  if (req.isAuthenticated && req.isAuthenticated() && (req as any).user?.claims?.email === 'ssa@ssasocial.com') {
    console.log('✅ ELENA FILE AUTH: Session authentication validated for file operations');
    return next();
  }

  console.log('❌ ELENA FILE AUTH: File operation authentication failed');
  return res.status(401).json({
    success: false,
    error: 'File operation authentication required',
    message: 'Elena workflow context or admin authentication required for file operations'
  });
};

/**
 * Elena staged workflows authentication
 * Allows Elena workflow endpoints to be accessed with admin token
 */
export const elenaStagedWorkflowAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 ELENA STAGED WORKFLOW AUTH: Checking authentication');

  // Check for admin token in various locations
  const authHeader = req.headers.authorization;
  const bodyToken = req.body?.adminToken;
  const queryToken = req.query?.adminToken;

  if (authHeader === 'Bearer sandra-admin-2025' || bodyToken === 'sandra-admin-2025' || queryToken === 'sandra-admin-2025') {
    console.log('✅ ELENA STAGED WORKFLOW AUTH: Admin token validated');
    return next();
  }

  // Session authentication
  if (req.isAuthenticated && req.isAuthenticated() && (req as any).user?.claims?.email === 'ssa@ssasocial.com') {
    console.log('✅ ELENA STAGED WORKFLOW AUTH: Session authentication validated');
    return next();
  }

  console.log('❌ ELENA STAGED WORKFLOW AUTH: Authentication failed');
  return res.status(401).json({
    success: false,
    error: 'Authentication required for Elena staged workflows',
    message: 'Admin authentication required'
  });
};