import React from 'react';
import { SignIn } from '@stackframe/react';

export const AuthSignIn: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Premium header */}
        <div className="text-center">
          <h2 
            className="text-3xl font-light tracking-widest"
            style={{ 
              fontFamily: 'Times New Roman, serif'
            }}
          >
            SSELFIE STUDIO
          </h2>
          <p className="mt-2 text-stone-600 font-light">Sign in to your account</p>
        </div>

        {/* Stack Auth Sign In with premium styling */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200 transition-all duration-300 ease-out">
          <SignIn 
            automaticRedirect={true}
            fullPage={false}
          />
        </div>

        {/* Additional navigation */}
        <div className="text-center">
          <p className="text-sm text-stone-600">
            Don't have an account?{' '}
            <a
              href="/sign-up"
              className="text-stone-800 hover:text-black font-medium underline decoration-stone-300 hover:decoration-stone-600 transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};