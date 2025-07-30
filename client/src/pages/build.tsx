import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import EnhancedBuildVisualStudio from '@/components/build/EnhancedBuildVisualStudio';
import { AIWebsiteBuilder } from '@/components/victoria/AIWebsiteBuilder';
import { Button } from '@/components/ui/button';

export default function Build() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [buildMode, setBuildMode] = useState<'select' | 'visual' | 'victoria'>('select');

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

  if (buildMode === 'visual') {
    return (
      <div className="h-screen overflow-hidden">
        <EnhancedBuildVisualStudio />
      </div>
    );
  }

  if (buildMode === 'victoria') {
    return <AIWebsiteBuilder />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-12">
          <h1 className="text-5xl font-normal mb-6" style={{ fontFamily: 'Times New Roman' }}>
            Build Your Website
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Choose your preferred website building experience. Create your complete business website with professional design and functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 p-8 hover:border-gray-400 transition-colors">
            <h3 className="text-2xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
              Victoria AI Website Builder
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Let Victoria guide you through creating your website with intelligent conversation. 
              Simply describe your business and watch as she generates a complete, professional website tailored to your needs.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-gray-600">
              <li>Conversational website creation</li>
              <li>AI-powered design selection</li>
              <li>Automated content generation</li>
              <li>One-click deployment</li>
              <li>Mobile-responsive design</li>
            </ul>
            <Button
              onClick={() => setBuildMode('victoria')}
              className="w-full bg-black text-white hover:bg-gray-800 py-3"
            >
              Start with Victoria
            </Button>
          </div>

          <div className="bg-white border border-gray-200 p-8 hover:border-gray-400 transition-colors">
            <h3 className="text-2xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
              Visual Studio Builder
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Take full control with our advanced visual builder. Perfect for those who want 
              hands-on customization and precise control over every design element.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-gray-600">
              <li>Drag-and-drop interface</li>
              <li>Advanced customization options</li>
              <li>Component-based building</li>
              <li>Real-time preview</li>
              <li>Professional templates</li>
            </ul>
            <Button
              onClick={() => setBuildMode('visual')}
              variant="outline"
              className="w-full border-black text-black hover:bg-black hover:text-white py-3"
            >
              Use Visual Builder
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Both options create professional, mobile-responsive websites ready for deployment
          </p>
        </div>
      </div>
    </div>
  );
}