import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  title?: string;
  subtitle?: string;
}

export function LoginForm({ onSuccess, title = "Welcome Back", subtitle = "Sign in to your SSELFIE Studio account" }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (onSuccess) {
          onSuccess(result.user);
        } else {
          window.location.href = '/workspace';
        }
      } else {
        if (response.status === 404) {
          setError('Account not found. Would you like to create a new account?');
        } else {
          setError(result.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-600 mt-2">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <Input 
            id="email"
            type="email" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || !email}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
        <p>
          Don't have an account?{' '}
          <button 
            className="text-black hover:underline font-medium"
            onClick={() => window.location.href = '/register'}
          >
            Create one here
          </button>
        </p>
      </div>
    </div>
  );
}