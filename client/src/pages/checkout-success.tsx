import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for authentication to complete
    if (!isLoading) {
      if (user) {
        // User is authenticated, show success and redirect to /studio
        toast({
          title: "Welcome to Personal Brand Studio!",
          description: "Your subscription is active. Redirecting to your studio...",
        });

        // Redirect to /studio after a brief moment
        setTimeout(() => {
          setLocation('/studio');
        }, 2000);
      } else {
        // User is not authenticated, redirect to login
        toast({
          title: "Please log in",
          description: "Redirecting to authenticate your account...",
        });

        setTimeout(() => {
          window.location.href = '/api/login';
        }, 1000);
      }
    }
  }, [user, isLoading, setLocation, toast]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for subscribing to Personal Brand Studio.
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-500">
          <p>✓ Your subscription is now active</p>
          <p>✓ 100 monthly AI generations included</p>
          <p>✓ Maya AI photographer access</p>
          <p>✓ Personal brand photo gallery</p>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
          ) : user ? (
            <p className="text-sm text-gray-600">Redirecting to your studio...</p>
          ) : (
            <p className="text-sm text-gray-600">Setting up your account...</p>
          )}
        </div>
      </div>
    </div>
  );
}