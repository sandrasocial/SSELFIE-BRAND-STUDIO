import React from 'react';

interface UnifiedLoginButtonProps {
  text: string;
  showBrand: boolean;
}

export default function UnifiedLoginButton({ text, showBrand }: UnifiedLoginButtonProps) {
  const handleLogin = () => {
    // In development, go directly to workspace to avoid OAuth email verification
    if (import.meta.env.DEV) {
      console.log('🔧 Development mode: Redirecting directly to workspace');
      window.location.href = '/workspace';
    } else {
      // Production: Use OAuth flow
      window.location.href = '/api/login';
    }
  };

  return (
    <div className="text-center">
      {showBrand && (
        <h1 className="text-3xl font-bold mb-4">SSELFIE Studio</h1>
      )}
      <button 
        onClick={handleLogin}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {text}
      </button>
    </div>
  );
}