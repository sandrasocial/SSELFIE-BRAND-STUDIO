import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import BuildVisualStudio from '@/components/build/BuildVisualStudio';

export default function Build() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // SEO Meta tags setup
  useEffect(() => {
    document.title = "Build Your Website - SSELFIE Studio";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create your complete business website with Victoria as your design consultant. Professional website builder for coaches and entrepreneurs.');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your website builder...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden">
      <BuildVisualStudio />
    </div>
  );
}