import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { Link } from 'wouter';

export default function Build() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading BUILD...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Please sign in to access BUILD</h1>
          <Link href="/api/login">
            <button className="bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-normal mb-6">
            Build Your Website
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create your complete business website with Victoria as your design consultant. 
            Transform your personal brand into a professional web presence.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Process */}
          <div>
            <h2 className="text-2xl font-serif font-normal mb-8">How It Works</h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium mb-2">Tell Your Story</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Share your business story, goals, and target audience with Victoria.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium mb-2">Design Together</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Victoria creates your website design based on your preferences and brand.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium mb-2">Launch Live</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Your website goes live on your custom subdomain, ready for business.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - CTA */}
          <div className="bg-gray-50 p-8 rounded-sm">
            <div className="text-center">
              <h3 className="text-xl font-serif font-normal mb-4">
                Ready to Build?
              </h3>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                Start your website creation journey with Victoria. 
                Build a professional web presence that converts visitors into clients.
              </p>
              
              <button 
                className="bg-black text-white px-8 py-4 text-sm font-medium hover:bg-gray-800 transition-colors w-full mb-4"
                disabled
              >
                Start Building (Coming Soon)
              </button>
              
              <p className="text-xs text-gray-500">
                BUILD feature launching soon. Return to workspace to continue with your current journey.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <Link href="/workspace">
            <button className="bg-gray-100 text-black px-8 py-3 text-sm font-medium hover:bg-gray-200 transition-colors">
              Return to Workspace
            </button>
          </Link>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
}