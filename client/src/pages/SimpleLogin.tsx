import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/photoshoot/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Welcome Back",
          description: "Successfully logged into your studio.",
        });
        navigate('/studio');
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <Link href="/" className="font-serif text-xl font-light tracking-wide">SSELFIE</Link>
          <div className="text-xs tracking-[0.4em] uppercase text-gray-500 font-light">Login</div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-8 py-32">
        <div className="text-center mb-12">
          <h1 className="font-serif font-extralight text-[clamp(2rem,5vw,4rem)] uppercase mb-4 leading-none">
            Welcome Back
          </h1>
          <p className="text-gray-600 font-light">
            Access your SSELFIE AI Photoshoot studio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs tracking-[0.3em] uppercase font-light mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 focus:border-black focus:outline-none transition-colors font-light"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-4 px-8 text-sm tracking-[0.3em] uppercase font-light hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging In...' : 'Access Studio'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 font-light mb-4">
            Don't have an account yet?
          </p>
          <Link 
            href="/checkout" 
            className="text-sm tracking-[0.3em] uppercase font-light border-b border-black hover:opacity-60 transition-opacity"
          >
            Start Your Photoshoot
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="text-xs text-gray-500 font-light">
            <p className="mb-2">Questions about your account?</p>
            <a 
              href="mailto:hello@sselfie.ai" 
              className="tracking-[0.3em] uppercase hover:opacity-60 transition-opacity"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}