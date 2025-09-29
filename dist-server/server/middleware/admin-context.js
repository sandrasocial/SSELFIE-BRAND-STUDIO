const ADMIN_USER_ID = '42585527';
const ADMIN_EMAIL = 'ssa@ssasocial.com';
export function adminContextDetection(req, res, next) {
    try {
        const userId = req.user?.claims?.sub;
        const userEmail = req.user?.claims?.email;
        const isAdmin = userId === ADMIN_USER_ID || userEmail === ADMIN_EMAIL;
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
        req.isAdmin = false;
        req.userType = 'member';
        next();
    }
}
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
export function isPlatformAdmin(userId, email) {
    return userId === ADMIN_USER_ID || email === ADMIN_EMAIL;
}
//# sourceMappingURL=admin-context.js.map