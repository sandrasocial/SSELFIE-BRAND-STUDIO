import { NextApiRequest, NextApiResponse } from 'next';
import { generateToken, validateToken } from '../lib/security';

export const csrfProtection = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  // Skip CSRF for non-mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || '')) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const cookieToken = req.cookies['csrf-token'];

  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};