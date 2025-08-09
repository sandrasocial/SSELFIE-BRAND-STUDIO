import { Request, Response, NextFunction } from 'express';

const ADMIN_BYPASS_TOKEN = 'sandra-admin-2025';

interface AdminBypassRequest extends Request {
  isAdminBypass?: boolean;
  bypassTokenUsage?: boolean;
}

function adminBypass(req: AdminBypassRequest, res: Response, next: NextFunction): void {
  const adminToken = req.headers['x-admin-token'] as string || req.query.admin_token as string;
  
  if (adminToken === ADMIN_BYPASS_TOKEN) {
    req.isAdminBypass = true;
    req.bypassTokenUsage = false; // NO CLAUDE API COSTS
    return next();
  }
  
  next();
}

export { adminBypass, ADMIN_BYPASS_TOKEN };