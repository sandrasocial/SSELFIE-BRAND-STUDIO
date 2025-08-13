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

  // Login endpoint - handle all user scenarios
  app.get("/api/login", async (req, res) => {
    try {
      const { email, userId, isNewUser } = req.query;
      console.log('🔑 Login request:', { email, userId, isNewUser });
      
      let user;
      
      if (email && userId) {
        // SCENARIO 1: New user from checkout or registration
        console.log('👤 Creating new user session');
        user = await storage.upsertUser({
          id: userId as string,
          email: email as string,
          firstName: (email as string).split('@')[0],
          lastName: '',
          profileImageUrl: ''
        });
      } else {
        // SCENARIO 2: Demo/admin login (current Sandra workflow)
        console.log('👑 Admin/demo login');
        user = await storage.upsertUser({
          id: 'sandra-admin-2025',
          email: 'ssa@ssasocial.com',
          firstName: 'Sandra',
          lastName: 'S',
          profileImageUrl: ''
        });
      }

      // Create authenticated session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl || '',
        role: user.role || 'member',
        isAuthenticated: true
      };

      console.log('✅ User session created:', user.email);
      
      // Redirect based on user type
      if (isNewUser === 'true') {
        res.redirect('/onboarding');
      } else {
        res.redirect('/workspace');
      }
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

  // User info endpoint - get current authenticated user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (sessionUser?.isAuthenticated) {
        // Fetch latest user data from database
        const dbUser = await storage.getUser(sessionUser.id);
        
        if (dbUser) {
          console.log('✅ User authenticated:', dbUser.email);
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

  // Registration endpoint for new users  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, firstName, lastName, source } = req.body;
      console.log('📝 User registration:', { email, source });
      
      // Create new user account
      const user = await storage.upsertUser({
        id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        email,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        profileImageUrl: '',
        role: 'member'
      });

      // Create session for immediate login
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        isAuthenticated: true
      };

      console.log('✅ User registered and logged in:', user.email);
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        redirectTo: source === 'checkout' ? '/onboarding' : '/workspace'
      });
    } catch (error) {
      console.error('❌ Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login with existing credentials
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      console.log('🔑 User login attempt:', email);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create authenticated session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        isAuthenticated: true
      };

      console.log('✅ User logged in:', user.email);
      res.json({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  console.log('✅ Complete authentication system setup with registration and login');
}

// Simple authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  const sessionUser = req.session?.user;
  
  if (sessionUser?.isAuthenticated) {
    return next();
  }
  
  res.status(401).json({ error: 'Authentication required' });
}