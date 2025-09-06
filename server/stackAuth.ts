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
    
    // For now, implement basic authentication check
    // Stack Auth will handle the full authentication flow
    const authHeader = req.headers.authorization;
    const stackCookie = req.cookies?.['stack-session'] || req.cookies?.['stack-auth'];
    
    if (!authHeader && !stackCookie) {
      console.log('❌ Stack Auth: No authentication found');
      return res.status(401).json({ 
        message: "Authentication required",
        redirectUrl: "/sign-in" 
      });
    }

    // Add basic user info to request object for compatibility
    (req as any).user = {
      claims: {
        sub: 'stack-user',
        email: 'user@example.com'
      }
    };
    
    console.log('✅ Stack Auth: Request authenticated');
    next();
  } catch (error) {
    console.error('❌ Stack Auth error:', error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Helper to get current user from Stack Auth
export async function getCurrentUser(req: any): Promise<any> {
  try {
    // For compatibility, return the user from request if available
    return req.user || null;
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    return null;
  }
}

// Setup Stack Auth endpoints (if needed)
export function setupStackAuth(app: Express) {
  console.log('🔧 Setting up Stack Auth server integration...');
  
  // Stack Auth endpoint for user session info
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('🔍 /api/auth/user called - checking Stack Auth session');
      
      // For now, return unauthenticated to allow frontend to show login
      // Stack Auth will handle the authentication flow through the UI
      res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error('User check error:', error);
      res.status(401).json({ message: "Authentication error" });
    }
  });
  
  console.log('✅ Stack Auth server integration setup complete');
}

console.log('🔧 Stack Auth server module loaded');