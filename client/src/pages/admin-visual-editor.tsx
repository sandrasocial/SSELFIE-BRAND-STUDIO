import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { OptimizedVisualEditor } from '@/components/visual-editor/OptimizedVisualEditor';
import { useLocation } from 'wouter';

export default function AdminVisualEditor() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // SEO Meta tags setup
  useEffect(() => {
    document.title = "Visual Editor - SSELFIE Studio Admin";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Visual editor interface for SSELFIE Studio admin dashboard with AI agent chat integration.');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visual editor...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!user || user.email !== 'ssa@ssasocial.com')) {
      console.log('AdminVisualEditor: Redirecting non-admin user', { user, isLoading });
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  // Only block render if we're sure it's not Sandra
  if (!isLoading && (!user || user.email !== 'ssa@ssasocial.com')) {
    console.log('AdminVisualEditor: Blocking render for non-admin', { user, isLoading });
    return null;
  }

  console.log('AdminVisualEditor: Rendering for admin user', { user: user?.email, isLoading });

  return (
    <div className="h-screen overflow-hidden">
      <div className="p-4 bg-blue-100 text-blue-800 mb-4">
        DEBUG: AdminVisualEditor loaded for {user?.email}
      </div>
      <OptimizedVisualEditor />
    </div>
  );
}