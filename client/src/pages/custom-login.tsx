import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function CustomLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation("/workspace");
    return null;
  }

  const handleLogin = async () => {
    setIsLoading(true);
    // Direct login without mentioning Replit
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="font-serif text-2xl font-light text-black">
                SSELFIE STUDIO
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-light text-black mb-4">
              Welcome to Your AI Studio
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Access your personalized AI photography studio and transform your selfies into professional brand content
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-gray-50 border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h3 className="font-serif text-xl font-light text-black mb-2">
                Sign In to Your Studio
              </h3>
              <p className="text-sm text-gray-600">
                Create your account or sign in with your existing credentials
              </p>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-6 font-medium tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Setting up your studio...
                </div>
              ) : (
                "ACCESS YOUR STUDIO"
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-300">
              <div className="flex items-center text-xs text-gray-500">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Secure authentication • Your data is always private and protected
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="text-center p-4 bg-gray-50 border border-gray-200">
              <h4 className="font-medium text-black mb-1">Maya AI Photographer</h4>
              <p className="text-xs text-gray-600">Celebrity stylist creates professional prompts</p>
            </div>
            <div className="text-center p-4 bg-gray-50 border border-gray-200">
              <h4 className="font-medium text-black mb-1">Personal AI Training</h4>
              <p className="text-xs text-gray-600">Train your own unique AI model with your selfies</p>
            </div>
            <div className="text-center p-4 bg-gray-50 border border-gray-200">
              <h4 className="font-medium text-black mb-1">Business Templates</h4>
              <p className="text-xs text-gray-600">Launch-ready landing pages and business tools</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}