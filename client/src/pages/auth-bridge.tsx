import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function AuthBridge() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/workspace");
    } else if (!isLoading && !isAuthenticated && !isRedirecting) {
      // Immediately redirect to Replit OAuth
      setIsRedirecting(true);
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, isLoading, isRedirecting, setLocation]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* SSELFIE Branding */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-light text-black mb-4">
            SSELFIE STUDIO
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Taking you to your AI photography studio...
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center mb-8">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
        </div>

        {/* Explanation Message */}
        <div className="bg-gray-50 border border-gray-200 p-6 text-center">
          <h3 className="text-sm font-medium text-black mb-3">
            Secure Login Setup
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            You'll be taken to a secure login page. This uses the same technology that powers many professional development platforms.
          </p>
          <p className="text-xs text-gray-600 mb-3">
            • Your SSELFIE Studio account and data remain completely private
          </p>
          <p className="text-xs text-gray-600 mb-3">
            • We only access your basic profile information (name, email)
          </p>
          <p className="text-xs text-gray-600">
            • Your AI models and photos are exclusively yours
          </p>
        </div>

        {/* Backup Manual Button */}
        <div className="mt-8">
          <button
            onClick={() => {
              setIsRedirecting(true);
              window.location.href = "/api/login";
            }}
            className="text-sm text-gray-600 hover:text-black transition-colors underline"
          >
            Continue manually if not redirected
          </button>
        </div>
      </div>
    </div>
  );
}