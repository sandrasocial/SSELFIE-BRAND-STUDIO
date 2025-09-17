import { Request, Response, NextFunction } from 'express';
import { authenticateAdmin } from '../stack-auth';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return authenticateAdmin(req, res, next);
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  return authenticateAdmin(req, res, next);
}

export function checkAdminAccess(req: Request, res: Response, next: NextFunction) {
  return authenticateAdmin(req, res, next);
}
