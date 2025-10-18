import * as React from 'react';
import UnifiedLoginButton from '../features/auth/components/UnifiedLoginButton.js';

export default function LoginPrompt() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <UnifiedLoginButton text="Sign in to continue" showBrand={true} />
    </div>
  );
}