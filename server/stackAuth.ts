import type { Express, RequestHandler } from "express";
import { StackServerApp } from "@stackframe/stack";

if (!process.env.STACK_SECRET_SERVER_KEY) {
  throw new Error('STACK_SECRET_SERVER_KEY environment variable is required');
}

if (!process.env.VITE_STACK_PROJECT_ID) {
  throw new Error('VITE_STACK_PROJECT_ID environment variable is required');
}

if (!process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY) {
  throw new Error('VITE_STACK_PUBLISHABLE_CLIENT_KEY environment variable is required');
}

// Initialize Stack Server App
const stackServerApp = new StackServerApp({
  projectId: process.env.VITE_STACK_PROJECT_ID,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
  publishableClientKey: process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
});

// Stack Auth middleware for protected routes
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    console.log('🔐 Stack Auth: Verifying request authentication');
    
    // Get the user from Stack Auth
    const user = await stackServerApp.getUser();
    
    if (!user) {
      console.log('❌ Stack Auth: No authenticated user found');
      return res.status(401).json({ 
        message: "Authentication required",
        redirectUrl: "/sign-in" 
      });
    }

    // Add user to request object for use in route handlers
    (req as any).user = user;
    console.log('✅ Stack Auth: User authenticated:', user.primaryEmail);
    
    next();
  } catch (error) {
    console.error('❌ Stack Auth error:', error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Helper to get current user from Stack Auth
export async function getCurrentUser(req: any): Promise<any> {
  try {
    return await stackServerApp.getUser();
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    return null;
  }
}

// Setup Stack Auth endpoints (if needed)
export function setupStackAuth(app: Express) {
  console.log('🔧 Setting up Stack Auth server integration...');
  
  // Stack Auth handles most endpoints automatically
  // We just need to provide user session info for the frontend
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const user = await stackServerApp.getUser();
      if (user) {
        res.json({
          id: user.id,
          email: user.primaryEmail,
          displayName: user.displayName,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || ''
        });
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error('User check error:', error);
      res.status(401).json({ message: "Authentication error" });
    }
  });
  
  console.log('✅ Stack Auth server integration setup complete');
}

console.log('🔧 Stack Auth server module loaded');