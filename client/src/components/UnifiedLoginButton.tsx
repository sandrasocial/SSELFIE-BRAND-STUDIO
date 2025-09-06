import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface UnifiedLoginButtonProps {
  text: string;
  showBrand: boolean;
}

export default function UnifiedLoginButton({ text, showBrand }: UnifiedLoginButtonProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = () => {
    // Direct Stack Auth OAuth redirect
    const stackAuthUrl = `https://api.stack-auth.com/api/v1/projects/253d7343-a0d4-43a1-be5c-822f590d40be/oauth/authorize?redirect_uri=${encodeURIComponent(window.location.origin + '/auth-success')}&response_type=code`;
    window.location.href = stackAuthUrl;
  };

  const handleLogout = () => {
    // Clear any stored tokens and redirect to logout
    localStorage.removeItem('stack-auth-token');
    sessionStorage.removeItem('stack-auth-token');
    window.location.href = '/login';
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