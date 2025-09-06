import { StackServerApp } from "@stackframe/stack";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Stack Auth configuration
const stackServerApp = new StackServerApp({
  projectId: process.env.STACK_PROJECT_ID!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
  publishableClientKey: process.env.STACK_PUBLISHABLE_CLIENT_KEY!,
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

// Stack Auth user management
async function upsertStackAuthUser(stackUser: any) {
  try {
    await storage.upsertUser({
      id: stackUser.id,
      email: stackUser.primaryEmail,
      firstName: stackUser.displayName?.split(' ')[0] || '',
      lastName: stackUser.displayName?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: stackUser.profileImageUrl || null,
    });
  } catch (error) {
    console.error('❌ Failed to upsert Stack Auth user:', error);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Stack Auth middleware setup
  console.log('🔍 Setting up Stack Auth middleware...');

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

  // Auth login endpoint
  app.get("/api/login", (req, res) => {
    // Redirect to Stack Auth sign-in
    const redirectUrl = stackServerApp.urls.signIn;
    console.log('🔍 Redirecting to Stack Auth sign-in:', redirectUrl);
    res.redirect(redirectUrl);
  });

  // Auth logout endpoint
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

  console.log('✅ Stack Auth setup complete');
}

// Stack Auth authentication middleware with impersonation support
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Get the Stack Auth user from the request
    const stackUser = stackServerApp.getUser(req);
    
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