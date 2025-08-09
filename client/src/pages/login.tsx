import React, { useEffect } from 'react';
import { PreLoginNavigationUnified } from '@/components/pre-login-navigation-unified';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If user is already authenticated, redirect to workspace
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to workspace');
      setLocation('/workspace');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = () => {
    // Redirect to authentication endpoint
    window.location.href = '/api/login';
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't show login page if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <PreLoginNavigationUnified />
      
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.luxury1}
        tagline="Sign In or Create Account"
        title="JOIN SSELFIE"
        ctaText="Access Your Studio"
        onCtaClick={handleLogin}
        fullHeight={false}
      />

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Create Account or Sign In
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto font-light leading-relaxed">
            Sign in to access your AI photography studio, brand strategy tools, and complete business-building platform. If you're new, you'll create your account during the secure login process.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-[#f5f5f5] p-12 text-center">
            <h3 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              Welcome to SSELFIE Studio
            </h3>
            
            <p className="text-sm text-[#666666] mb-8 leading-relaxed">
              Create your account or sign in using your email address. You'll be redirected to a secure login page to complete authentication.
            </p>
            
            <button 
              onClick={handleLogin}
              className="w-full bg-[#0a0a0a] text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors mb-6"
            >
              Continue with Email
            </button>
            
            <div className="text-xs text-[#666666] space-y-3 border-t border-[#e0e0e0] pt-6">
              <p className="font-medium">What happens next:</p>
              <div className="text-left space-y-2">
                <p>• You'll be taken to a secure authentication page</p>
                <p>• New users: Create account with your email</p>
                <p>• Returning users: Sign in with your existing account</p>
                <p>• Access your SSELFIE Studio workspace immediately</p>
              </div>
              <div className="text-center mt-4 pt-3 border-t border-[#e0e0e0]">
                <p className="text-[#888888]">Powered by secure authentication</p>
              </div>
            </div>
            
            <div className="text-sm text-[#666666] space-y-2 mt-8">
              <p>New to SSELFIE Studio?</p>
              <a 
                href="/simple-checkout" 
                className="text-[#0a0a0a] underline hover:no-underline"
              >
                Start your transformation here
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              What You'll Access
            </h4>
            <div className="grid md:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>Maya AI</div>
                <p className="text-[#666666]">Professional celebrity stylist for AI photoshoots</p>
              </div>
              <div>
                <div className="text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>Victoria AI</div>
                <p className="text-[#666666]">Personal brand strategist and website builder</p>
              </div>
              <div>
                <div className="text-lg font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>Your Studio</div>
                <p className="text-[#666666]">Complete workspace with gallery and templates</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}