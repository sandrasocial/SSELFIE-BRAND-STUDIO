'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  mode?: 'login' | 'register';
  onSuccess?: () => void;
}

export default function AuthForm({ mode = 'login', onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onSuccess?.();
    } catch (err) {
      // Error handled by useAuth hook
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-2xl">
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 rounded-md transition-all ${
              isLogin
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 rounded-md transition-all ${
              !isLogin
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
        {isLogin ? 'Welcome Back!' : 'Join Us Today'}
      </h2>
      <p className="text-center text-gray-600 mb-8">
        {isLogin 
          ? 'Sign in to access your account and continue your journey.'
          : 'Create an account to get started with our amazing features.'
        }
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                placeholder="Enter your full name"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                👤
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">This is how we'll address you</p>
          </div>
        )}
        
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              placeholder="your@email.com"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              ✉️
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">We'll never share your email</p>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              minLength={8}
              placeholder={isLogin ? "Enter your password" : "Create a strong password"}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔒
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {isLogin ? (
              <button type="button" className="text-blue-600 hover:underline">
                Forgot password?
              </button>
            ) : (
              "Must be at least 8 characters"
            )}
          </p>
        </div>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              {isLogin ? 'Sign In' : 'Create Account'}
              <span className="ml-2">→</span>
            </span>
          )}
        </button>
      </form>
      
      <div className="mt-8 space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
            Google
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
            <img src="https://github.com/favicon.ico" alt="GitHub" className="w-5 h-5 mr-2" />
            GitHub
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center space-y-2">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
        
        <p className="text-sm text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}