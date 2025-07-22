// Authentication audit routes for database consistency monitoring
import { Router } from 'express';
import { AuthAuditService } from '../auth-audit-service';
import { isAuthenticated } from '../replitAuth';

const router = Router();

/**
 * GET /api/auth-audit
 * Comprehensive authentication gap audit
 * Admin only - checks for users with sessions but no database records
 */
router.get('/auth-audit', isAuthenticated, async (req, res) => {
  try {
    // Only allow admin users to access audit functionality
    if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({ 
        error: 'Unauthorized', 
        message: 'Admin access required for authentication audit' 
      });
    }

    console.log('🔍 Admin requested authentication audit');
    
    const auditResults = await AuthAuditService.auditAuthenticationGaps();
    
    res.json({
      success: true,
      audit: auditResults,
      message: 'Authentication audit completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Authentication audit failed:', error);
    res.status(500).json({
      error: 'Authentication audit failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth-audit/fix
 * Fix identified authentication gaps
 * Admin only - repairs inconsistencies between sessions and database
 */
router.post('/auth-audit/fix', isAuthenticated, async (req, res) => {
  try {
    // Only allow admin users to access fix functionality
    if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({ 
        error: 'Unauthorized', 
        message: 'Admin access required for authentication gap fixes' 
      });
    }

    console.log('🔧 Admin requested authentication gap fix');
    
    const fixResults = await AuthAuditService.fixAuthenticationGaps();
    
    res.json({
      success: fixResults.success,
      fix: fixResults,
      message: fixResults.success 
        ? 'All authentication gaps fixed successfully'
        : 'Some authentication gaps remain - check logs for details',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Authentication gap fix failed:', error);
    res.status(500).json({
      error: 'Authentication gap fix failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth-audit/validate-session
 * Validate that an authenticated user has proper database record
 * Used by authentication middleware for real-time validation
 */
router.post('/auth-audit/validate-session', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const userEmail = req.user?.claims?.email;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'No user ID in session',
        valid: false 
      });
    }

    const isValid = await AuthAuditService.validateUserSession(userId, userEmail);
    
    if (!isValid) {
      console.error(`🚨 Session validation failed for user: ${userId} (${userEmail})`);
      return res.status(401).json({ 
        error: 'User session invalid - no database record found',
        valid: false,
        userId,
        userEmail
      });
    }

    res.json({
      valid: true,
      userId,
      userEmail,
      message: 'User session validated successfully'
    });

  } catch (error) {
    console.error('❌ Session validation failed:', error);
    res.status(500).json({
      error: 'Session validation failed',
      message: error.message,
      valid: false
    });
  }
});

export default router;