import React, { useState } from 'react';
import { Link } from 'wouter';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="w-full text-center">
        <div className="mb-8">
          <h2 className="text-2xl text-[#f5f5f5] mb-4" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
            Check Your Email
          </h2>
          <p className="text-[#f5f5f5]/70 text-sm font-inter leading-relaxed">
            If an account with that email exists, we've sent you password reset instructions. 
            Check your inbox (and spam folder, just in case).
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/login">
            <button className="w-full py-4 border border-[#f5f5f5] text-[#f5f5f5] text-sm tracking-[0.2em] uppercase font-inter font-light hover:bg-[#f5f5f5] hover:text-[#0a0a0a] transition-all duration-300">
              Back to Login
            </button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#f5f5f5]/20">
          <p className="text-[#f5f5f5]/50 text-xs font-inter">
            Still having trouble? Contact support and we'll sort it out.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl text-[#f5f5f5] mb-2" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
          Reset Password
        </h2>
        <p className="text-[#f5f5f5]/70 text-sm font-inter">
          Enter your email and we'll send you reset instructions
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-[#f5f5f5] text-sm mb-3 font-inter">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-4 bg-transparent border border-[#f5f5f5]/30 text-[#f5f5f5] placeholder-[#f5f5f5]/50 font-inter text-sm focus:border-[#f5f5f5] focus:outline-none transition-colors"
            placeholder="your@email.com"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full py-4 border border-[#f5f5f5] text-[#f5f5f5] text-sm tracking-[0.2em] uppercase font-inter font-light hover:bg-[#f5f5f5] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {/* Back to Login */}
        <div className="text-center pt-6 border-t border-[#f5f5f5]/20">
          <p className="text-[#f5f5f5]/70 text-sm font-inter">
            Remember your password?
          </p>
          <Link href="/login">
            <button 
              type="button"
              className="mt-2 text-[#f5f5f5] text-sm tracking-[0.2em] uppercase font-inter font-light border-b border-[#f5f5f5]/30 hover:border-[#f5f5f5] transition-all duration-300"
            >
              Back to Login
            </button>
          </Link>
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t border-[#f5f5f5]/20">
        <p className="text-[#f5f5f5]/50 text-xs leading-relaxed font-inter">
          Reset links expire in 24 hours for security. No worries though - you can always request another one.
        </p>
      </div>
    </div>
  );
};