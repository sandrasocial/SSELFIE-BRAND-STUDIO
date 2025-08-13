import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  const isSSELFIEDomain = process.env.REPLIT_DOMAINS?.includes('sselfie.ai') || false;
  const useSecureCookies = process.env.NODE_ENV === 'production' || isSSELFIEDomain;
  
  console.log('🔒 SESSION CONFIG:', {
    domain: process.env.REPLIT_DOMAINS,
    isSSELFIEDomain,
    useSecureCookies,
    sessionTtl: sessionTtl / (24 * 60 * 60 * 1000) + ' days'
  });

  const PgSession = connectPg(session);
  
  return session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.REPL_ID!,
    resave: false,
    saveUninitialized: false,
    name: 'sselfie.session',
    cookie: {
      maxAge: sessionTtl,
      secure: useSecureCookies,
      httpOnly: true,
      sameSite: useSecureCookies ? 'none' : 'lax',
      domain: isSSELFIEDomain ? '.sselfie.ai' : undefined
    }
  });
}

// Simple authentication system using demo user approach
export function setupAuth(app: Express) {
  console.log('🔒 Setting up simplified authentication system...');

  // Login endpoint - for now, create a demo user session
  app.get("/api/login", async (req, res) => {
    try {
      console.log('🔑 Simple login - creating admin session directly');
      
      // Create admin session directly without database dependency
      (req.session as any).user = {
        id: 'sandra-admin-2025',
        email: 'ssa@ssasocial.com',
        firstName: 'Sandra',
        lastName: 'S',
        profileImageUrl: '',
        isAuthenticated: true
      };

      console.log('✅ Admin session created, redirecting to workspace');
      res.redirect('/workspace');
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  });

  // Callback endpoint (placeholder for now)
  app.get("/api/callback", async (req, res) => {
    console.log('🔄 Auth callback received - redirecting to workspace');
    res.redirect('/workspace');
  });

  // User info endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (sessionUser?.isAuthenticated) {
        console.log('✅ User authenticated:', sessionUser.email);
        return res.json({
          id: sessionUser.id,
          email: sessionUser.email,
          firstName: sessionUser.firstName,
          lastName: sessionUser.lastName,
          profileImageUrl: sessionUser.profileImageUrl
        });
      }

      console.log('❌ User not authenticated');
      res.status(401).json({ error: 'Not authenticated' });
    } catch (error) {
      console.error('❌ Auth check error:', error);
      res.status(500).json({ error: 'Authentication check failed' });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ error: 'Session cleanup failed' });
      }
      
      res.clearCookie('sselfie.session');
      console.log('✅ User logged out successfully');
      res.json({ success: true });
    });
  });

  console.log('✅ Authentication system setup complete');
}

// Simple authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  const sessionUser = req.session?.user;
  
  if (sessionUser?.isAuthenticated) {
    return next();
  }
  
  res.status(401).json({ error: 'Authentication required' });
}