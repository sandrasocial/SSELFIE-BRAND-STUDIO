import React from 'react';
import * as stackAuth from '@stackframe/react';
// @ts-ignore - Stack Auth has broken ESM exports, using workaround
const { SignUp } = (stackAuth as any).default || stackAuth;

export const AuthSignUp: React.FC = () => {
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
            JOIN SSELFIE STUDIO
          </h2>
          <p className="mt-2 text-stone-600 font-light">Create your account</p>
        </div>

        {/* Stack Auth Sign Up with premium styling */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200 transition-all duration-300 ease-out">
          <SignUp 
            automaticRedirect={true}
            fullPage={false}
          />
        </div>

        {/* Additional navigation */}
        <div className="text-center">
          <p className="text-sm text-stone-600">
            Already have an account?{' '}
            <a
              href="/handler/sign-in"
              className="text-stone-800 hover:text-black font-medium underline decoration-stone-300 hover:decoration-stone-600 transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};