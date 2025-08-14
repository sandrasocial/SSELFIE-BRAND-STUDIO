import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface RegisterFormProps {
  onSuccess?: (user: any) => void;
  source?: 'landing' | 'checkout' | 'direct';
  title?: string;
  subtitle?: string;
}

export function RegisterForm({ 
  onSuccess, 
  source = 'direct',
  title = "Create Your Account", 
  subtitle = "Join SSELFIE Studio and start building your personal brand" 
}: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName) return;
    
    const data = { email, firstName, lastName };
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          source
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (onSuccess) {
          onSuccess(result.user);
        } else {
          window.location.href = result.redirectTo || '/workspace';
        }
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <Input 
            id="firstName"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name (Optional)
          </label>
          <Input 
            id="lastName"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

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
          disabled={isLoading || !email || !firstName}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
        <p>
          Already have an account?{' '}
          <button 
            className="text-black hover:underline font-medium"
            onClick={() => window.location.href = '/api/login'}
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}