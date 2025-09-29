import { requireStackAuth, requireActiveSubscription } from '../../stack-auth.js';
export { requireStackAuth, requireActiveSubscription };
export const requireAuth = (req, res, next) => {
    return requireStackAuth(req, res, next);
};
export const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
export const requireSubscription = (req, res, next) => {
    return requireActiveSubscription(req, res, next);
};
//# sourceMappingURL=auth.js.map