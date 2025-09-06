import React from 'react';

interface UnifiedLoginButtonProps {
  text: string;
  showBrand: boolean;
}

export default function UnifiedLoginButton({ text, showBrand }: UnifiedLoginButtonProps) {
  const handleLogin = () => {
    // Redirect to Stack Auth sign-in endpoint
    console.log('🔐 UnifiedLoginButton: Redirecting to Stack Auth sign-in');
    window.location.href = '/api/auth/signin';
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