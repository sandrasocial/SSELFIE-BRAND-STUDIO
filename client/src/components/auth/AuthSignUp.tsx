/**
 * AuthSignUp Component - Maya-Only Architecture
 * Modern sign-up form with Stack Auth integration
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth.js';
import { MemberNavigation } from '../member-navigation.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
// Using HTML checkbox since ui/checkbox doesn't exist
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import type { SignUpFormProps } from '../../../shared/types/auth.js';

export function AuthSignUp({
  onSuccess,
  onError,
  redirectAfterSignUp = '/maya',
  showSignInLink = true,
  showOAuthProviders = true,
  enabledProviders = ['google'],
  requireTermsAcceptance = true,
  requireMarketingConsent = false
}: SignUpFormProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    acceptTerms: false,
    marketingConsent: false
  });

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (onSuccess) {
        // We don't have user data here, but Stack Auth handles it
        onSuccess(null as any);
      } else {
        setLocation(redirectAfterSignUp);
      }
    }
  }, [isAuthenticated, isLoading, onSuccess, redirectAfterSignUp, setLocation]);

  // Validate password strength
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const isPasswordStrong = Object.values(passwordStrength).filter(Boolean).length >= 4;
  const canSubmit = formData.email && 
                   formData.password && 
                   formData.displayName && 
                   isPasswordStrong &&
                   (!requireTermsAcceptance || formData.acceptTerms);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSigningUp(true);

    if (!canSubmit) {
      setError('Please fill in all required fields and ensure your password is strong enough.');
      setIsSigningUp(false);
      return;
    }

    try {
      // For now, redirect to Stack Auth sign-up handler
      // In a full implementation, you'd use Stack Auth SDK here
      const params = new URLSearchParams({
        email: formData.email,
        displayName: formData.displayName,
        redirect: redirectAfterSignUp,
        acceptTerms: formData.acceptTerms.toString(),
        marketingConsent: formData.marketingConsent.toString()
      });
      
      const redirectUrl = `/handler/sign-up?${params.toString()}`;
      window.location.href = redirectUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      setError(errorMessage);
      if (onError) {
        onError({
          code: 'SIGN_UP_FAILED',
          message: errorMessage,
          type: 'authentication'
        });
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google') => {
    setError(null);
    setIsSigningUp(true);

    try {
      // Redirect to Stack Auth OAuth handler
      const redirectUrl = `/handler/sign-up?provider=${provider}&redirect=${encodeURIComponent(redirectAfterSignUp)}`;
      window.location.href = redirectUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${provider} sign up failed. Please try again.`;
      setError(errorMessage);
      if (onError) {
        onError({
          code: 'OAUTH_ERROR',
          message: errorMessage,
          type: 'authentication'
        });
      }
      setIsSigningUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavigation transparent={false} />
      
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="space-y-2">  
              <h1 className="text-3xl font-serif font-light text-gray-900">
                Join SSELFIE
              </h1>
              <p className="text-gray-600">
                Start creating professional photos with Maya AI
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* OAuth Sign Up */}
          {showOAuthProviders && enabledProviders.includes('google') && (
            <div className="space-y-4 mb-6">
              <Button
                onClick={() => handleOAuthSignUp('google')}
                variant="outline"
                size="lg"
                className="w-full justify-center"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">or</span>
                </div>
              </div>
            </div>
          )}

          {/* Email Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-6">
            <div>
              <Label htmlFor="displayName">Full name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter your full name"
                  required
                  disabled={isSigningUp}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter your email"
                  required
                  disabled={isSigningUp}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="Create a strong password"
                  required
                  disabled={isSigningUp}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="text-sm text-gray-600">Password strength:</div>
                  <div className="space-y-1">
                    {[
                      { key: 'hasMinLength', label: 'At least 8 characters' },
                      { key: 'hasUppercase', label: 'One uppercase letter' },
                      { key: 'hasLowercase', label: 'One lowercase letter' },
                      { key: 'hasNumber', label: 'One number' },
                      { key: 'hasSymbol', label: 'One special character' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2 text-xs">
                        <div className={`flex-shrink-0 ${
                          passwordStrength[key as keyof typeof passwordStrength] 
                            ? 'text-green-500' 
                            : 'text-gray-400'
                        }`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className={
                          passwordStrength[key as keyof typeof passwordStrength] 
                            ? 'text-green-700' 
                            : 'text-gray-500'
                        }>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              {requireTermsAcceptance && (
                <div className="flex items-start space-x-3">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    disabled={isSigningUp}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
                  />
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <label htmlFor="acceptTerms">
                      I agree to the{' '}
                      <a 
                        href="/terms" 
                        target="_blank" 
                        className="text-black hover:underline"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a 
                        href="/privacy" 
                        target="_blank" 
                        className="text-black hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <input
                  id="marketingConsent"
                  name="marketingConsent"
                  type="checkbox"
                  checked={formData.marketingConsent}
                  onChange={handleInputChange}
                  disabled={isSigningUp}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
                />
                <div className="text-sm text-gray-700 leading-relaxed">
                  <label htmlFor="marketingConsent">
                    {requireMarketingConsent ? 'I agree to' : 'I would like to'} receive marketing emails about SSELFIE Studio updates and tips
                    {!requireMarketingConsent && ' (optional)'}
                  </label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-black text-white hover:bg-gray-800"
              disabled={isSigningUp || !canSubmit}
            >
              {isSigningUp ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Create Account
            </Button>
          </form>

          {/* Sign In Link */}
          {showSignInLink && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setLocation('/auth/signin')}
                  className="text-black hover:underline font-medium"
                  disabled={isSigningUp}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setLocation('/business')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-black"
              disabled={isSigningUp}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}