import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

// Replit Auth middleware - automatically provided by Replit platform
function getReplitUser(req: any) {
  // Replit automatically injects user info in headers when authenticated
  return req.headers['x-replit-user-id'] ? {
    id: req.headers['x-replit-user-id'],
    name: req.headers['x-replit-user-name'],
    email: req.headers['x-replit-user-email'],
    profileImageUrl: req.headers['x-replit-user-profile-image']
  } : null;
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

// Replit Auth integration - automatic authentication
export function setupAuth(app: Express) {
  console.log('🔒 Setting up Replit Auth integration...');

  // Replit Auth login endpoint - leverages platform authentication
  app.get("/api/login", async (req, res) => {
    try {
      console.log('🔑 Replit Auth login attempt');
      
      // Check for Replit user from platform
      const replitUser = getReplitUser(req);
      
      if (replitUser) {
        console.log('✅ Replit user authenticated:', replitUser.email);
        
        // Store/update user in database
        const user = await storage.upsertUser({
          id: replitUser.id,
          email: replitUser.email,
          firstName: replitUser.name?.split(' ')[0] || replitUser.email.split('@')[0],
          lastName: replitUser.name?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: replitUser.profileImageUrl || ''
        });

        // Create session
        (req.session as any).user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          role: user.role || 'member',
          isAuthenticated: true
        };

        console.log('✅ Session created for:', user.email);
        res.redirect('/workspace');
      } else {
        // Redirect to Replit Auth - platform will handle authentication
        console.log('🔄 Redirecting to Replit Auth');
        res.redirect('/@replit/auth?redirect=' + encodeURIComponent(req.get('host') + '/api/callback'));
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
  });

  // Replit Auth callback - handles post-authentication
  app.get("/api/callback", async (req, res) => {
    try {
      console.log('🔄 Replit Auth callback received');
      
      const replitUser = getReplitUser(req);
      
      if (replitUser) {
        console.log('✅ Callback: User authenticated:', replitUser.email);
        
        // Store user data
        const user = await storage.upsertUser({
          id: replitUser.id,
          email: replitUser.email,
          firstName: replitUser.name?.split(' ')[0] || replitUser.email.split('@')[0],
          lastName: replitUser.name?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: replitUser.profileImageUrl || ''
        });

        // Create authenticated session
        (req.session as any).user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          role: user.role || 'member',
          isAuthenticated: true
        };

        console.log('✅ Callback session created, redirecting to workspace');
        res.redirect('/workspace');
      } else {
        console.log('❌ No user data in callback');
        res.redirect('/login');
      }
    } catch (error) {
      console.error('❌ Callback error:', error);
      res.redirect('/login');
    }
  });

  // User info endpoint - check current user status
  app.get("/api/auth/user", async (req, res) => {
    try {
      // Check session first
      const sessionUser = (req.session as any)?.user;
      
      if (sessionUser?.isAuthenticated) {
        const dbUser = await storage.getUser(sessionUser.id);
        if (dbUser) {
          console.log('✅ Session user authenticated:', dbUser.email);
          return res.json({
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
            profileImageUrl: dbUser.profileImageUrl,
            role: dbUser.role,
            plan: dbUser.plan,
            monthlyGenerationLimit: dbUser.monthlyGenerationLimit
          });
        }
      }

      // Check Replit headers as fallback
      const replitUser = getReplitUser(req);
      if (replitUser) {
        console.log('✅ Replit headers user found:', replitUser.email);
        
        const user = await storage.upsertUser({
          id: replitUser.id,
          email: replitUser.email,
          firstName: replitUser.name?.split(' ')[0] || replitUser.email.split('@')[0],
          lastName: replitUser.name?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: replitUser.profileImageUrl || ''
        });

        // Create session for future requests
        (req.session as any).user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          role: user.role || 'member',
          isAuthenticated: true
        };

        return res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          role: user.role,
          plan: user.plan,
          monthlyGenerationLimit: user.monthlyGenerationLimit
        });
      }

      console.log('❌ No authentication found');
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



  console.log('✅ Replit Auth integration complete - using platform authentication');
}

// Simple authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  const sessionUser = req.session?.user;
  
  if (sessionUser?.isAuthenticated) {
    return next();
  }
  
  res.status(401).json({ error: 'Authentication required' });
}