import React, { useState } from 'react';
import { Link } from 'wouter';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Redirect to Google OAuth
    window.location.href = '/api/login';
  };

  const isLogin = type === 'login';

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl text-[#f5f5f5] mb-2" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
          {isLogin ? 'Log In' : 'Create Account'}
        </h2>
        <p className="text-[#f5f5f5]/70 text-sm font-inter">
          {isLogin 
            ? 'Continue building your empire'
            : 'Start your personal brand journey'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Main CTA Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 border border-[#f5f5f5] text-[#f5f5f5] text-sm tracking-[0.2em] uppercase font-inter font-light hover:bg-[#f5f5f5] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Connecting...' : (isLogin ? 'Continue with Google' : 'Start with Google')}
        </button>

        {/* Divider */}
        <div className="text-center">
          <span className="text-[#f5f5f5]/50 text-xs font-inter">
            Secure authentication powered by Google
          </span>
        </div>

        {/* Google OAuth Notice */}
        <div className="text-center pt-6 border-t border-[#f5f5f5]/20">
          <p className="text-[#f5f5f5]/70 text-sm font-inter">
            Sign in or create account with Google
          </p>
          <p className="text-[#f5f5f5]/50 text-xs font-inter mt-2">
            No passwords to remember. One click access.
          </p>
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t border-[#f5f5f5]/20">
        <p className="text-[#f5f5f5]/50 text-xs leading-relaxed font-inter">
          Secure Google authentication. Your data is protected and we never share your information.
        </p>
      </div>
    </div>
  );
};