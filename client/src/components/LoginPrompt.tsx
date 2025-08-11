import React from 'react';
import UnifiedLoginButton from './UnifiedLoginButton';

export default function LoginPrompt() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <UnifiedLoginButton text="Sign in to continue" showBrand={true} />
    </div>
  );
}