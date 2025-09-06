import { SignIn } from "@stackframe/stack";
import { Link, useLocation } from "wouter";

export default function AuthSignIn() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const returnUrl = urlParams.get('returnUrl') || '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* SSELFIE Studio Brand Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold text-black mb-2 cursor-pointer hover:text-gray-800 transition-colors">
              SSELFIE Studio
            </h1>
          </Link>
          <p className="text-gray-600">
            AI Personal Branding Platform
          </p>
        </div>

        {/* Stack Auth Sign-In Component */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-center text-gray-600">
              Sign in to access your AI photo generation studio
            </p>
          </div>
          
          <SignIn 
            afterSignIn={returnUrl}
            redirectOnEmailVerification={returnUrl}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            New to SSELFIE Studio?{" "}
            <Link href="/#/auth/sign-up" className="text-black hover:underline font-medium">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}