import React from 'react';
import { Button } from "@/components/ui/button";
import { useStackApp, useUser } from "@stackframe/stack";

interface UnifiedLoginButtonProps {
  text: string;
  showBrand: boolean;
}

export default function UnifiedLoginButton({ text, showBrand }: UnifiedLoginButtonProps) {
  const stackApp = useStackApp();
  const user = useUser();

  const handleLogin = () => {
    stackApp.redirectToSignIn();
  };

  const handleLogout = () => {
    stackApp.signOut();
  };

  // If user is already logged in, show logout button
  if (user) {
    return (
      <div className="text-center max-w-md mx-auto">
        {showBrand && (
          <h1 className="text-3xl font-bold mb-4">SSELFIE Studio</h1>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-center space-y-4">
            <p className="text-lg">Welcome back!</p>
            <p className="text-sm text-gray-600">{user.primaryEmail}</p>
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