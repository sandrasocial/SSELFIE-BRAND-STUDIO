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
    
    // Redirect to Replit Auth
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
          {isLoading ? 'Connecting...' : (isLogin ? 'Continue with Replit' : 'Start with Replit')}
        </button>

        {/* Divider */}
        <div className="text-center">
          <span className="text-[#f5f5f5]/50 text-xs font-inter">
            Secure authentication powered by Replit
          </span>
        </div>

        {/* Switch Auth Type */}
        <div className="text-center pt-6 border-t border-[#f5f5f5]/20">
          <p className="text-[#f5f5f5]/70 text-sm font-inter">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <Link href={isLogin ? '/signup' : '/login'}>
            <button 
              type="button"
              className="mt-2 text-[#f5f5f5] text-sm tracking-[0.2em] uppercase font-inter font-light border-b border-[#f5f5f5]/30 hover:border-[#f5f5f5] transition-all duration-300"
            >
              {isLogin ? 'Create Account' : 'Log In'}
            </button>
          </Link>
        </div>

        {/* Additional Links */}
        {isLogin && (
          <div className="text-center">
            <Link href="/forgot-password">
              <button 
                type="button"
                className="text-[#f5f5f5]/70 text-xs font-inter hover:text-[#f5f5f5] transition-colors"
              >
                Forgot your password?
              </button>
            </Link>
          </div>
        )}
      </form>

      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t border-[#f5f5f5]/20">
        <p className="text-[#f5f5f5]/50 text-xs leading-relaxed font-inter">
          {isLogin 
            ? 'Ready to pick up where you left off? Your workspace is waiting.'
            : 'By creating an account, you agree to our terms and privacy policy. No spam, just pure brand-building magic.'
          }
        </p>
      </div>
    </div>
  );
};