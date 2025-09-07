import { Link } from "wouter";
import { SignUp } from "@stackframe/react";
import { stackClientApp } from "../stack";

export default function AuthSignUp() {
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

        {/* Neon Auth Sign-Up Component */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <SignUp app={stackClientApp} />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <Link href="/#/auth/sign-in" className="text-black hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}