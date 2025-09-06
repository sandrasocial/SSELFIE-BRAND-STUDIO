import React from 'react';
import { SignIn } from '@stackframe/stack';

export default function StackAuthSignIn() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            SSELFIE Studio
          </h1>
          <p className="text-[#666666] text-sm">
            Sign in to access your AI photography studio
          </p>
        </div>
        
        <div className="bg-[#f5f5f5] p-8 rounded-lg">
          <SignIn />
        </div>
      </div>
    </div>
  );
}