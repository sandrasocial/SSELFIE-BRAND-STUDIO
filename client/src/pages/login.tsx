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
    <div className="min-h-screen bg-[#fefefe]">
      <PreLoginNavigationUnified />
      
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.luxury1}
        tagline="Welcome to Your Studio"
        title="SSELFIE ATELIER"
        ctaText="Enter the Studio"
        onCtaClick={handleLogin}
        fullHeight={false}
      />

      <main className="max-w-4xl mx-auto px-8 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
            Your Creative Journey Begins
          </h2>
          <p className="text-lg text-[#0a0a0a] max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
            Access your private AI photography studio, brand strategy tools, and complete business platform. New members will create their atelier during the secure authentication process.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-[#f5f5f5] p-16 text-center border border-[#0a0a0a]/10">
            <h3 className="text-2xl mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
              Access Your Atelier
            </h3>
            
            <div className="flex justify-center mb-10">
              <div className="inline-flex border-b border-[#0a0a0a]/10">
                <button 
                  onClick={() => setAuthMode('login')}
                  className={`px-8 py-3 text-sm transition-all border-b-2 ${
                    authMode === 'login' 
                      ? 'border-[#0a0a0a] text-[#0a0a0a]' 
                      : 'border-transparent text-[#0a0a0a]/60 hover:text-[#0a0a0a]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('signup')} 
                  className={`px-8 py-3 text-sm transition-all border-b-2 ${
                    authMode === 'signup' 
                      ? 'border-[#0a0a0a] text-[#0a0a0a]' 
                      : 'border-transparent text-[#0a0a0a]/60 hover:text-[#0a0a0a]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            <p className="text-sm text-[#666666] mb-8 leading-relaxed">
              {authMode === 'login' ? 
                'Welcome back! Sign in securely to access your SSELFIE Studio.' :
                'Join SSELFIE Studio to start creating your luxury brand presence.'
              }
            </p>
            
            <button 
              onClick={handleLogin}
              className="w-full bg-[#0a0a0a] text-white px-8 py-4 text-sm uppercase tracking-wider hover:bg-[#333] transition-colors mb-4 flex items-center justify-center"
            >
              <span className="mr-2">Continue with Email</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            {authMode === 'login' && (
              <button 
                onClick={() => window.location.href = '/forgot-password'}
                className="text-sm text-[#666666] hover:text-[#333] transition-colors mb-6"
              >
                Forgot your password?
              </button>
            )}
            
            <div className="text-xs text-[#666666] space-y-4 border-t border-[#e0e0e0] pt-6">
              <p className="font-medium">Your Journey to SSELFIE Studio:</p>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center mr-3">1</div>
                <div className="flex-1">
                  <p className="font-medium text-[#0a0a0a]">Secure Authentication</p>
                  <p className="text-[#666666] mt-1">Quick and safe login process</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center mr-3">2</div>
                <div className="flex-1">
                  <p className="font-medium text-[#0a0a0a]">Personalized Setup</p>
                  <p className="text-[#666666] mt-1">Quick profile customization</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center mr-3">3</div>
                <div className="flex-1">
                  <p className="font-medium text-[#0a0a0a]">Studio Access</p>
                  <p className="text-[#666666] mt-1">Instant access to your workspace</p>
                </div>
              </div>

              <div className="text-center mt-6 pt-4 border-t border-[#e0e0e0] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#0a0a0a] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-[#0a0a0a]">Bank-level secure authentication</p>
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

        <div className="mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h4 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Your Complete Luxury Brand Studio
              </h4>
              <p className="text-[#666666] max-w-2xl mx-auto">
                Join thousands of entrepreneurs building their luxury brand presence with SSELFIE Studio
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-[#f0f0f0]">
                <div className="text-lg font-light mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>Maya AI</div>
                <p className="text-[#666666] mb-4">Professional celebrity stylist for AI photoshoots</p>
                <ul className="text-sm space-y-2 text-[#666666]">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Luxury photoshoot templates
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Professional styling advice
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-[#f0f0f0]">
                <div className="text-lg font-light mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>Victoria AI</div>
                <p className="text-[#666666] mb-4">Personal brand strategist and website builder</p>
                <ul className="text-sm space-y-2 text-[#666666]">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Brand strategy guidance
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Website optimization
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-[#f0f0f0]">
                <div className="text-lg font-light mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>Your Studio</div>
                <p className="text-[#666666] mb-4">Complete workspace with gallery and templates</p>
                <ul className="text-sm space-y-2 text-[#666666]">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Organized workspace
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ready-to-use templates
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-[#e0e0e0]">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-8 mb-6">
                  <div className="text-[#666666]">
                    <div className="text-2xl font-light mb-1">2,000+</div>
                    <div className="text-sm">Active Members</div>
                  </div>
                  <div className="text-[#666666]">
                    <div className="text-2xl font-light mb-1">50,000+</div>
                    <div className="text-sm">Photos Created</div>
                  </div>
                  <div className="text-[#666666]">
                    <div className="text-2xl font-light mb-1">24/7</div>
                    <div className="text-sm">AI Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}