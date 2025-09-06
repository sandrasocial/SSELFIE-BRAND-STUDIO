import { StackServerApp } from "@stackframe/stack";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Stack Auth configuration with correct environment variable names from your setup
const stackProjectId = process.env.VITE_STACK_PROJECT_ID || process.env.NEXT_PUBLIC_STACK_PROJECT_ID || process.env.STACK_AUTH_PROJECT_ID;
const stackSecretKey = process.env.STACK_SECRET_SERVER_KEY || process.env.STACK_AUTH_SECRET_KEY;
const stackPublishableKey = process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || process.env.STACK_PUBLISHABLE_CLIENT_KEY;

console.log('🔍 Stack Auth Server Config:', {
  hasProjectId: !!stackProjectId,
  hasSecretKey: !!stackSecretKey,
  hasPublishableKey: !!stackPublishableKey
});

if (!stackProjectId || !stackSecretKey || !stackPublishableKey) {
  throw new Error('Missing Stack Auth environment variables');
}

const stackServerApp = new StackServerApp({
  projectId: stackProjectId,
  secretServerKey: stackSecretKey,
  publishableClientKey: stackPublishableKey,
});

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Enhanced session configuration for Stack Auth
  const useSecureCookies = process.env.NODE_ENV === 'production';
  
  console.log('🔒 STACK AUTH SESSION CONFIG:', {
    useSecureCookies,
    sessionTtl: '7 days'
  });
  
  // Database session store
  try {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    
    return session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: useSecureCookies,
        sameSite: 'lax',
        maxAge: sessionTtl,
      },
    });
  } catch (error) {
    console.error('⚠️ Database session failed, using memory store:', error);
    return session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: sessionTtl,
      },
    });
  }
}

// Stack Auth user management with proper field mapping
async function upsertStackAuthUser(stackUser: any) {
  try {
    console.log('🔄 Upserting user:', stackUser.primaryEmail, stackUser.displayName);
    
    await storage.upsertUser({
      id: stackUser.id,
      email: stackUser.primaryEmail,
      firstName: stackUser.displayName?.split(' ')[0] || '',
      lastName: stackUser.displayName?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: stackUser.profileImageUrl || null,
      authProvider: 'stack-auth',
      stackAuthUserId: stackUser.id,
      displayName: stackUser.displayName,
      lastLoginAt: new Date(),
    });
  } catch (error) {
    console.error('❌ Failed to upsert Stack Auth user:', error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Stack Auth middleware setup
  console.log('🔍 Setting up Stack Auth middleware...');
  
  // Stack Auth handler middleware with comprehensive error handling
  try {
    console.log('🔍 Stack Auth objects available:', {
      hasUrls: !!stackServerApp.urls,
      hasHandler: !!stackServerApp.handler,
      urlsType: typeof stackServerApp.urls,
      handlerType: typeof stackServerApp.handler
    });
    
    // Try to install the Stack Auth handler
    if (stackServerApp.handler) {
      const handlerPath = '/handler';
      console.log('🔍 Installing Stack Auth handler at:', handlerPath);
      app.use(handlerPath, stackServerApp.handler);
      console.log('✅ Stack Auth handler middleware installed');
    } else {
      console.log('⚠️ Stack Auth handler not available, installing custom callback handlers');
      
      // Install manual Stack Auth callback handlers since handler is undefined due to Next.js dependencies
      console.log('🔧 Installing manual Stack Auth callback handlers for Express.js compatibility');
      
      app.get('/handler/sign-in', (req, res) => {
        console.log('🔐 Manual Stack Auth sign-in handler');
        try {
          // Get Stack Auth project ID for hosted authentication page
          const projectId = process.env.VITE_STACK_PROJECT_ID;
          const directSignInUrl = `https://${projectId}.stack-auth.com/handler/signin`;
          console.log('🔍 Redirecting to Stack Auth sign-in:', directSignInUrl);
          res.redirect(directSignInUrl);
        } catch (error) {
          console.error('❌ Sign-in redirect error:', error);
          // Fallback to API login
          res.redirect('/api/auth/login');
        }
      });
      
      // Manual callback handler to complete authentication loop
      app.get('/handler/callback', async (req, res) => {
        console.log('🔐 Manual Stack Auth callback handler');
        console.log('🔍 Callback received with query:', req.query);
        
        try {
          // For Stack Auth, the authentication is handled by the client-side after redirect
          // The session will be established when the user makes authenticated requests
          const returnUrl = (req.query.returnUrl as string) || '/';
          console.log('✅ Authentication callback processed, redirecting to:', returnUrl);
          res.redirect(returnUrl);
        } catch (error) {
          console.error('❌ Callback processing error:', error);
          res.redirect('/?error=auth_callback_failed');
        }
      });
      
      // Add Stack Auth session establishment endpoint 
      app.post('/handler/session', async (req, res) => {
        console.log('🔐 Stack Auth session establishment');
        try {
          // Verify user session with Stack Auth
          const stackUser = await stackServerApp.getUser({ req, res });
          if (stackUser) {
            await upsertStackAuthUser(stackUser);
            console.log('✅ User session established:', stackUser.primaryEmail);
            res.json({ success: true, user: stackUser });
          } else {
            res.status(401).json({ error: 'No authenticated user' });
          }
        } catch (error) {
          console.error('❌ Session establishment error:', error);
          res.status(500).json({ error: 'Session establishment failed' });
        }
      });
    }
  } catch (error) {
    console.log('⚠️ Stack Auth handler setup failed:', error.message);
  }

  // Debug middleware to log all Stack Auth requests
  app.use('/handler/*', (req, res, next) => {
    console.log('🔍 Stack Auth Handler Request:', req.method, req.path);
    next();
  });

  // Stack Auth webhook endpoint for user events
  app.post('/api/stack-auth/webhook', async (req, res) => {
    try {
      const event = req.body;
      
      if (event.type === 'user.created' || event.type === 'user.updated') {
        await upsertStackAuthUser(event.data.user);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('❌ Stack Auth webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Legacy auth endpoints (for existing links)
  app.get("/api/login", (req, res) => {
    console.log('🔐 Legacy login endpoint - redirecting to Stack Auth');
    try {
      // Get Stack Auth project ID for hosted authentication page
      const projectId = process.env.VITE_STACK_PROJECT_ID;
      const directSignInUrl = `https://${projectId}.stack-auth.com/handler/signin`;
      console.log('🔍 Redirecting to Stack Auth sign-in:', directSignInUrl);
      res.redirect(directSignInUrl);
    } catch (error) {
      console.error('❌ Login redirect error:', error);
      res.status(500).json({ error: 'Authentication service temporarily unavailable' });
    }
  });

  app.get("/api/logout", async (req, res) => {
    try {
      console.log('🔍 Logout requested');
      
      // Clear local session
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        console.log('✅ User logged out successfully');
        
        // Redirect to Stack Auth sign-out
        const signOutUrl = stackServerApp.urls.signOut;
        res.redirect(signOutUrl);
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      res.redirect('/');
    }
  });

  // New auth endpoints (server-side Stack Auth like Replit Auth)
  app.get("/api/auth/login", (req, res) => {
    console.log('🔐 Server-side Stack Auth: Login requested (like Replit Auth)');
    try {
      // Redirect to Stack Auth hosted sign-in page with return URL support
      const returnUrl = (req.query.returnUrl as string) || '/';
      const projectId = process.env.VITE_STACK_PROJECT_ID;
      const directSignInUrl = `https://${projectId}.stack-auth.com/handler/signin?returnUrl=${encodeURIComponent(returnUrl)}`;
      console.log('🔍 Redirecting to Stack Auth sign-in:', directSignInUrl);
      res.redirect(directSignInUrl);
    } catch (error) {
      console.error('❌ Auth login redirect error:', error);
      res.status(500).json({ error: 'Authentication service temporarily unavailable' });
    }
  });

  app.get("/api/auth/logout", async (req, res) => {
    try {
      console.log('🔐 Server-side Stack Auth: Logout requested (like Replit Auth)');
      
      // Clear local session
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        console.log('✅ User logged out successfully');
        
        // Redirect to Stack Auth sign-out with return URL
        const returnUrl = (req.query.returnUrl as string) || '/';
        const signOutUrl = `${stackServerApp.urls.signOut}?returnUrl=${encodeURIComponent(returnUrl)}`;
        res.redirect(signOutUrl);
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      res.redirect('/');
    }
  });

  // Stack Auth user endpoint that matches the frontend useAuth hook
  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get complete user data from database 
      const dbUser = await storage.getUser(user.claims.sub);
      if (!dbUser) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json(dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  console.log('✅ Stack Auth setup complete');
}

// Stack Auth authentication middleware with impersonation support
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Get the Stack Auth user from the request with proper error handling
    let stackUser;
    try {
      // Check if request has proper session/token structure first
      if (!req || typeof req !== 'object') {
        console.log('🔍 Invalid request object for Stack Auth');
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // More defensive call to Stack Auth getUser with null checks
      stackUser = await stackServerApp.getUser({ req, res });
      
      if (!stackUser) {
        console.log('🔍 No Stack Auth user found, authentication required');
        return res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.log('❌ Stack Auth getUser error:', error.message);
      
      // Check if error is due to missing access token (handler not working)
      if (error.message.includes('accessToken') || error.message.includes('undefined')) {
        console.log('🔧 Stack Auth handler issue: Missing authentication session');
        return res.status(401).json({ 
          message: "Authentication session not established. Please log in again.",
          error: "stack_auth_handler_issue"
        });
      }
      
      // For development: Allow bypassing auth temporarily to test flow
      if (process.env.NODE_ENV === 'development' && req.path.includes('/api/auth/user')) {
        console.log('🔧 DEV MODE: Bypassing Stack Auth for testing');
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }
      
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!stackUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Handle impersonation by overriding user claims (preserved from Replit Auth)
    if ((req.session as any)?.impersonatedUser) {
      const impersonatedUser = (req.session as any).impersonatedUser;
      
      (req as any).user = {
        id: impersonatedUser.id,
        email: impersonatedUser.email,
        displayName: `${impersonatedUser.firstName} ${impersonatedUser.lastName}`.trim(),
        profileImageUrl: impersonatedUser.profileImageUrl,
        claims: {
          sub: impersonatedUser.id,
          email: impersonatedUser.email,
          first_name: impersonatedUser.firstName,
          last_name: impersonatedUser.lastName,
          profile_image_url: impersonatedUser.profileImageUrl
        }
      };
      
      console.log('🎭 Impersonation active:', impersonatedUser.email);
      return next();
    }

    // Store user in request for compatibility with existing code
    (req as any).user = {
      id: stackUser.id,
      email: stackUser.primaryEmail,
      displayName: stackUser.displayName,
      profileImageUrl: stackUser.profileImageUrl,
      // Legacy compatibility - map Stack Auth user to claims structure
      claims: {
        sub: stackUser.id,
        email: stackUser.primaryEmail,
        first_name: stackUser.displayName?.split(' ')[0] || '',
        last_name: stackUser.displayName?.split(' ').slice(1).join(' ') || '',
        profile_image_url: stackUser.profileImageUrl
      }
    };

    // Sync user to database
    await upsertStackAuthUser(stackUser);

    return next();
  } catch (error) {
    console.error('❌ Stack Auth authentication error:', error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Stack Auth helper to get current user
export async function getCurrentUser(req: any) {
  try {
    const stackUser = stackServerApp.getUser(req);
    return stackUser;
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    return null;
  }
}

export { stackServerApp };