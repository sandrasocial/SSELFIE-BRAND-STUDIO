import { authenticateAdmin } from '../stack-auth';
export function requireAdmin(req, res, next) {
    return authenticateAdmin(req, res, next);
}
export function adminOnly(req, res, next) {
    return authenticateAdmin(req, res, next);
}
export function checkAdminAccess(req, res, next) {
    return authenticateAdmin(req, res, next);
}
