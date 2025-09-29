const PROTECTED_MEMBER_ROUTES = [
    '/api/subscription',
    '/api/usage/status',
    '/api/user-model',
    '/api/ai-images',
    '/api/auth/user',
    '/api/gallery-images',
    '/api/maya-chats',
    '/api/save-to-gallery'
];
const PROTECTED_MEMBER_PAGES = [
    '/maya',
    '/workspace',
    '/checkout',
    '/simple-checkout',
    '/payment-success',
    '/simple-training'
];
export function revenueProtectionMiddleware(req, res, next) {
    const path = req.path;
    if (PROTECTED_MEMBER_ROUTES.includes(path) || PROTECTED_MEMBER_PAGES.includes(path)) {
        console.log(`🛡️ PROTECTED ROUTE ACCESS: ${req.method} ${path} by ${req.user ? 'authenticated' : 'anonymous'} user`);
    }
    next();
}
export function validateMemberApiHealth() {
    return async (req, res, next) => {
        next();
    };
}
export function isMemberRoute(path) {
    return PROTECTED_MEMBER_ROUTES.includes(path) ||
        PROTECTED_MEMBER_PAGES.includes(path) ||
        path.startsWith('/maya') ||
        path.startsWith('/workspace') ||
        path.startsWith('/checkout');
}
export function isAdminRoute(path) {
    return path.startsWith('/api/admin') ||
        path.startsWith('/api/consulting-agents') ||
        path.startsWith('/api/claude') ||
        path.startsWith('/admin');
}
//# sourceMappingURL=revenue-protection.js.map