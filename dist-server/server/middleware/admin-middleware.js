import { authenticateAdmin } from '../stack-auth.js';
export function requireAdmin(req, res, next) {
    return authenticateAdmin(req, res, next);
}
export function adminOnly(req, res, next) {
    return authenticateAdmin(req, res, next);
}
export function checkAdminAccess(req, res, next) {
    return authenticateAdmin(req, res, next);
}
//# sourceMappingURL=admin-middleware.js.map