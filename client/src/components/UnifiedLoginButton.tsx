import React, { useState } from 'react';

interface UnifiedLoginButtonProps {
  text?: string;
  subtitle?: string;
  className?: string;
  showBrand?: boolean;
}

export default function UnifiedLoginButton({ 
  text = "Sign in to continue",
  subtitle = "Access your AI photography studio",
  className = "",
  showBrand = true 
}: UnifiedLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/quick-login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        window.location.reload(); // Reload to update auth state
      } else {
        // Fallback to regular login
        window.location.href = "/api/login";
      }
    } catch (error) {
      console.error('Quick login failed:', error);
      // Fallback to regular login
      window.location.href = "/api/login";
    }
  };

  return (
    <div className={`text-center ${className}`}>
      {showBrand && (
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-light text-black mb-2">
            SSELFIE STUDIO
          </h2>
          <p className="text-gray-600 text-sm">
            {subtitle}
          </p>
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="bg-black text-white px-8 py-3 text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Connecting...' : text}
      </button>
      
      <div className="text-sm text-gray-500 mt-4">
        Secure authentication powered by Replit
      </div>
    </div>
  );
}