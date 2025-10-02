import React from "react";
import { useAuth } from "../../hooks/use-auth.js";

// Robust OAuth callback handler for Stack Auth
const OAuthCallbackHandler: React.FC = () => {
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    // If authenticated, redirect immediately
    if (isAuthenticated) {
      window.location.replace("/");
      return;
    }
    // Otherwise, wait for up to 5 seconds then redirect anyway
    const timer = setTimeout(() => {
      window.location.replace("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Processing OAuth callback...</h2>
        <p className="text-gray-600">You will be redirected shortly.</p>
      </div>
    </div>
  );
};

export default OAuthCallbackHandler;
