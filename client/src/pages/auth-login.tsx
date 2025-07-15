import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLogin() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/workspace");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* SSELFIE Branding */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-light text-black mb-4">
            SSELFIE STUDIO
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Transform your selfies into professional AI photography
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-light text-black mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Ready to create something amazing? Let's go.
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white py-4 px-6 font-medium tracking-wide uppercase text-sm hover:bg-gray-900 transition-colors"
          >
            Continue to SSELFIE Studio
          </button>

          {/* Security Note */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Secure authentication powered by Replit. Your personal data and AI models are protected with enterprise-grade security.
            </p>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            What you'll get access to:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            <div>• Personal AI model training</div>
            <div>• Maya AI photographer chat</div>
            <div>• Professional image generation</div>
            <div>• Victoria AI brand strategist</div>
            <div>• Landing page builder</div>
          </div>
        </div>
      </div>
    </div>
  );
}