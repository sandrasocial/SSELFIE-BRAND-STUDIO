import { Request, Response } from 'express';
import { getSession } from '@replit/repl-auth';

export class AuthController {
  // Login with Replit
  static async login(req: Request, res: Response) {
    try {
      const session = await getSession(req);
      if (!session) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      // Store user in session
      req.session.user = {
        id: session.id,
        name: session.name,
        role: 'user' // Default role
      };

      res.json({ success: true, user: req.session.user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  // Logout
  static async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  }

  // Get current user
  static async getCurrentUser(req: Request, res: Response) {
    if (!req.session?.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.session.user });
  }
}