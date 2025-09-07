import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useStackApp } from "@stackframe/stack";
import { STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY } from "@/env";

interface UnifiedLoginButtonProps {
  text: string;
  showBrand: boolean;
}

export default function UnifiedLoginButton({ text, showBrand }: UnifiedLoginButtonProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  let app;
  
  try {
    app = useStackApp();
  } catch (error) {
    console.warn('⚠️ Stack Auth not available:', error);
    app = null;
  }

  const handleLogin = async () => {
    if (!app) {
      console.warn('⚠️ Stack Auth not available, using fallback');
      // Fallback to direct OAuth URL if Stack Auth fails
      const projectId = STACK_PROJECT_ID;
      const publishableKey = STACK_PUBLISHABLE_CLIENT_KEY;
      
      if (publishableKey) {
        window.location.href = `https://api.stack-auth.com/api/v1/auth/signin?project_id=${projectId}&publishable_client_key=${publishableKey}&redirect_uri=${encodeURIComponent(window.location.origin)}`;
      } else {
        console.error('❌ No Stack Auth configuration available');
      }
      return;
    }
    
    try {
      // ✅ Use proper Stack Auth SDK method
      await app.signInWithOAuth('google');
    } catch (error) {
      console.error('❌ Stack Auth: OAuth login failed:', error);
    }
  };

  const handleLogout = async () => {
    if (!app) {
      // Fallback logout
      window.location.href = '/';
      return;
    }
    
    try {
      // ✅ Use proper Stack Auth SDK method  
      await app.signOut();
      // Stack Auth handles redirect automatically
    } catch (error) {
      console.error('❌ Stack Auth: Logout error:', error);
      // Fallback to simple redirect
      window.location.href = '/';
    }
  };

  // If user is already logged in, show logout button  
  if (isAuthenticated && user) {
    return (
      <div className="text-center max-w-md mx-auto">
        {showBrand && (
          <h1 className="text-3xl font-bold mb-4">SSELFIE Studio</h1>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-center space-y-4">
            <p className="text-lg">Welcome back!</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center max-w-md mx-auto">
        {showBrand && (
          <h1 className="text-3xl font-bold mb-4">SSELFIE Studio</h1>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center max-w-md mx-auto">
      {showBrand && (
        <h1 className="text-3xl font-bold mb-4">SSELFIE Studio</h1>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Sign In to Continue</h2>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Access your AI personal branding studio with secure OAuth login
          </p>
          
          <Button 
            onClick={handleLogin}
            className="w-full"
          >
            {text}
          </Button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Secure login powered by Stack Auth
        </div>
      </div>
    </div>
  );
}