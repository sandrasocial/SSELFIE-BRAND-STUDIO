import { useEffect } from 'react';
import UnifiedLoginButton from '../components/UnifiedLoginButton';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Welcome to SSELFIE Studio</h1>
        <UnifiedLoginButton text="Sign in to continue" showBrand={true} />
      </div>
    </div>
  );
}