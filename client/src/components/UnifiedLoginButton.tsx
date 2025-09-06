import React from 'react';
import { SignIn } from '@stackframe/stack';

interface UnifiedLoginButtonProps {
  text: string;
  showBrand: boolean;
}

export default function UnifiedLoginButton({ text, showBrand }: UnifiedLoginButtonProps) {
  return (
    <div className="text-center">
      {showBrand && (
        <h1 className="text-3xl font-bold mb-4">SSELFIE Studio</h1>
      )}
      <div className="stack-auth-signin">
        <SignIn />
      </div>
    </div>
  );
}