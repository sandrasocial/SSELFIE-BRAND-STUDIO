/**
 * ADMIN CONTEXT MIDDLEWARE
 * Simple admin detection for Maya system separation
 * Only one admin user: ssa@ssasocial.com (42585527)
 * All others are paying members (€47/month)
 */
// Admin user identification
const ADMIN_USER_ID = '42585527';
const ADMIN_EMAIL = 'ssa@ssasocial.com';
/**
 * Middleware to detect admin vs member context for Maya system
 * Adds admin flags without blocking access
 */
export function adminContextDetection(req, res, next) {
    try {
        // Get user info from authenticated session
        const userId = req.user?.claims?.sub;
        const userEmail = req.user?.claims?.email;
        // Detect admin user (platform owner)
        const isAdmin = userId === ADMIN_USER_ID || userEmail === ADMIN_EMAIL;
        // Add admin context to request
        req.isAdmin = isAdmin;
        req.userType = isAdmin ? 'admin' : 'member';
        if (isAdmin) {
            req.adminContext = {
                isPlatformOwner: true,
                canAccessPlatformFeatures: true,
                separateAnalytics: true
            };
            console.log(`🎯 ADMIN CONTEXT: Platform owner (${userEmail}) detected - enhanced Maya context enabled`);
        }
        else {
            console.log(`👤 MEMBER CONTEXT: Subscriber user (${userId}) - standard Maya experience`);
        }
        next();
    }
    catch (error) {
        console.error('❌ Admin context detection error:', error);
        // Fallback to member context on error
        req.isAdmin = false;
        req.userType = 'member';
        next();
    }
}
/**
 * Generate conversation ID based on user type and context
 * PHASE 1: Added context support for separate styling vs support conversations
 */
export function getConversationId(userId, isAdmin, chatId, context) {
    const contextSuffix = context === 'support' ? '_support' : '';
    if (isAdmin) {
        return `maya_admin_platform_${userId}${contextSuffix}`;
    }
    if (chatId) {
        return `maya_member_${userId}_${chatId}${contextSuffix}`;
    }
    return `maya_member_${userId}${contextSuffix}`;
}
/**
 * Check if user is the platform admin
 */
export function isPlatformAdmin(userId, email) {
    return userId === ADMIN_USER_ID || email === ADMIN_EMAIL;
}
