import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '../lib/session';

export const withProtected = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = getSession(req);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Add session data to request
    (req as any).session = session;
    
    return handler(req, res);
  };
};

export const withRole = (handler: NextApiHandler, allowedRoles: string[]) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = getSession(req);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(session.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    (req as any).session = session;
    
    return handler(req, res);
  };
};