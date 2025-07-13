import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { WorkspaceNavigation } from '@/components/workspace-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { SandraImages } from '@/lib/sandra-images';

export default function Workspace() {
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user data
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated
  });

  // User Journey Steps - 8 Steps as requested
  const getUserJourneySteps = () => [
    {
      id: 'train-ai',
      number: '01',
      title: 'Train Your AI',
      subtitle: 'Upload selfies, get your personal model',
      status: userModel?.trainingStatus === 'completed' ? 'complete' : 
              userModel?.trainingStatus === 'training' ? 'progress' : 'start',
      statusText: userModel?.trainingStatus === 'completed' ? 'Ready to Generate' :
                  userModel?.trainingStatus === 'training' ? 'Training...' : 'Start Here',
      link: '/ai-training',
      image: SandraImages.editorial.laptop1
    },
    {
      id: 'maya-photoshoot',
      number: '02', 
      title: 'Maya - AI Photographer',
      subtitle: 'Professional celebrity stylist photoshoot',
      status: userModel?.trainingStatus === 'completed' ? 'ready' : 'locked',
      statusText: userModel?.trainingStatus === 'completed' ? 'Start Photoshoot' : 'Complete Step 1',
      link: userModel?.trainingStatus === 'completed' ? '/maya' : '#',
      image: SandraImages.editorial.phone1
    },
    {
      id: 'ai-photoshoot',
      number: '03',
      title: 'AI Photoshoot',
      subtitle: 'Generate professional photos with AI',
      status: userModel?.trainingStatus === 'completed' ? 'ready' : 'locked',
      statusText: userModel?.trainingStatus === 'completed' ? 'Start Shooting' : 'Complete Step 1',
      link: userModel?.trainingStatus === 'completed' ? '/ai-photoshoot' : '#',
      image: SandraImages.editorial.phone1
    },
    {
      id: 'gallery',
      number: '04',
      title: 'Gallery', 
      subtitle: 'View and download your photos',
      status: aiImages.length > 0 ? 'active' : 'locked',
      statusText: aiImages.length > 0 ? `${aiImages.length} Photos` : 'No Photos Yet',
      link: aiImages.length > 0 ? '/gallery' : '#',
      image: SandraImages.editorial.thinking
    },
    {
      id: 'flatlay-library',
      number: '05',
      title: 'Flatlay Library',
      subtitle: 'Curated lifestyle images for your brand',
      status: 'ready',
      statusText: 'Browse Collections',
      link: '/flatlay-library',
      image: SandraImages.flatlays.workspace1
    },
    {
      id: 'victoria-brand-strategist',
      number: '06',
      title: 'Victoria - Personal Brand Strategist',
      subtitle: 'AI guidance for your brand strategy',
      status: 'ready',
      statusText: 'Get Strategy',
      link: '/victoria',
      image: SandraImages.editorial.laptop2
    },
    {
      id: 'business',
      number: '07',
      title: 'Build Your Business',
      subtitle: 'Landing pages, booking, payments',
      status: 'coming-soon',
      statusText: 'Coming Soon',
      link: '#',
      image: SandraImages.flatlays.planning
    },
    {
      id: 'profile',
      number: '08',
      title: 'Your Profile',
      subtitle: 'Account settings and preferences',
      status: 'ready',
      statusText: 'Manage Account',
      link: '/profile',
      image: SandraImages.flatlays.workspace2
    }
  ];



  const getUsageStats = () => {
    const monthlyLimit = 300; // €97 plan includes 300 monthly generations
    return {
      used: aiImages.length || 0,
      total: monthlyLimit,
      percentage: Math.round(((aiImages.length || 0) / monthlyLimit) * 100)
    };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation with scroll effect */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="text-white text-lg font-light tracking-wider hover:opacity-80 transition-opacity">
                SSELFIE STUDIO
              </Link>
              
              <div className="hidden md:flex space-x-12">
                <Link href="/how-it-works" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
                  How It Works
                </Link>
                <Link href="/pricing" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
                  Pricing
                </Link>
                <Link href="/blog" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
                  Blog
                </Link>
                <Link href="/api/logout" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
                  Logout
                </Link>
              </div>
              
              <div className="md:hidden">
                <button className="text-white text-sm uppercase tracking-wider">
                  Menu
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-black mb-6">
              Please Sign In
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto mb-10">
              You need to be signed in to access your STUDIO.
            </p>
            <a
              href="/api/login"
              className="inline-block px-8 py-4 text-xs uppercase tracking-[0.3em] border border-black hover:bg-black hover:text-white transition-all duration-300"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  const journeySteps = getUserJourneySteps();
  const usageStats = getUsageStats();

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalistic Navigation */}
      <WorkspaceNavigation />
      
      {/* Full Bleed Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        {/* Background Image - positioned to show face */}
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://sselfie-training-zips.s3.amazonaws.com/images/sandra_test_user_2025/137_1752409456266.png"
            alt="Your SSELFIE Studio"
            className="w-full h-full object-cover object-center-top"
            style={{ objectPosition: 'center top' }}
          />
        </div>
        
        {/* Hero Content - Positioned Low */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end min-h-screen pb-16 sm:pb-20">
          {/* Tagline */}
          <div style={{
            fontSize: 'clamp(9px, 2vw, 11px)',
            letterSpacing: 'clamp(0.3em, 0.8vw, 0.4em)',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 'clamp(16px, 3vw, 24px)'
          }}>
            Your Personal Brand Empire
          </div>
          
          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 8rem)',
            lineHeight: 0.9,
            fontWeight: 200,
            color: 'white',
            marginBottom: 'clamp(16px, 3vw, 24px)',
            fontFamily: 'Times New Roman, serif',
            letterSpacing: 'clamp(0.02em, 0.5vw, 0.05em)',
            textTransform: 'uppercase',
            maxWidth: '100%',
            overflowWrap: 'break-word'
          }}>
            SSELFIE
          </h1>
          
          {/* Subtitle */}
          <div style={{
            fontSize: 'clamp(9px, 2vw, 11px)',
            letterSpacing: 'clamp(0.3em, 0.8vw, 0.4em)',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 'clamp(24px, 5vw, 40px)'
          }}>
            STUDIO
          </div>

          {/* Quick Stats in Hero */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-12 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-serif mb-2">{usageStats.used}</div>
              <div className="text-xs tracking-[0.2em] uppercase opacity-60">Photos Generated</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif mb-2">{journeySteps.filter(s => s.status === 'complete').length}</div>
              <div className="text-xs tracking-[0.2em] uppercase opacity-60">Steps Complete</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif mb-2">{usageStats.total - usageStats.used}</div>
              <div className="text-xs tracking-[0.2em] uppercase opacity-60">Remaining This Month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Your Platform Tools - Compact Widget Style */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
                Your Platform
              </div>
              <h2 className="font-times text-2xl sm:text-3xl font-light tracking-wide uppercase mb-8">
                Tools & Features
              </h2>
              
              {/* Clear Priority Message */}
              <div className="max-w-2xl mx-auto mb-8 p-4 bg-gray-50 border border-gray-200">
                <div className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-2">Important</div>
                <p className="text-sm font-light text-black">
                  Start with <strong>Step 01 - Train Your AI</strong> first. You must train your personal AI model before you can generate photos of yourself.
                </p>
              </div>
            </div>

            {/* Compact Widget Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {journeySteps.map((step, index) => (
                <Link key={step.id} href={step.link} className={step.status === 'locked' ? 'pointer-events-none' : ''}>
                  <div className={`group relative bg-white border border-[#e0e0e0] transition-all duration-300 h-32 ${
                    step.status === 'locked' ? 'opacity-50' : 'hover:border-black hover:shadow-md'
                  }`}>
                    
                    {/* Compact Image Section */}
                    <div className="relative h-16 overflow-hidden bg-[#f5f5f5]">
                      <img 
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Step Number Badge */}
                      <div className="absolute top-2 left-2 w-5 h-5 bg-black text-white text-xs flex items-center justify-center font-light">
                        {step.number}
                      </div>
                      
                      {/* Status Indicator */}
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                        step.status === 'complete' ? 'bg-black' :
                        step.status === 'progress' ? 'bg-gray-600' :
                        step.status === 'ready' ? 'bg-gray-800' :
                        'bg-gray-300'
                      }`}></div>
                    </div>
                    
                    {/* Compact Content */}
                    <div className="p-3 h-16 flex flex-col justify-between">
                      <h3 className="font-times text-xs font-light tracking-tight leading-tight text-black line-clamp-2">
                        {step.title}
                      </h3>
                      <span className={`text-xs tracking-[0.1em] uppercase font-light ${
                        step.status === 'complete' ? 'text-black' :
                        step.status === 'progress' ? 'text-gray-600' :
                        step.status === 'ready' ? 'text-black' :
                        step.status === 'locked' ? 'text-gray-400' :
                        'text-gray-600'
                      }`}>
                        {step.statusText}
                      </span>
                    </div>

                    {/* Hover Description Tooltip */}
                    <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      <div className="font-light leading-tight">{step.subtitle}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Progress Overview */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-8 text-xs tracking-[0.2em] uppercase text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span>Complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  <span>Ready</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Locked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Quote Section - Moved Below Tools */}
          <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 text-center mb-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
                Sandra's Philosophy
              </div>
              <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light italic leading-tight text-black mb-8">
                "Your mess is your message.<br />
                Let's build something real."
              </blockquote>
              <cite className="text-xs tracking-[0.3em] uppercase text-gray-500">
                Sandra Sigurjónsdóttir, Founder
              </cite>
            </div>
          </section>

          {/* Usage Overview - Editorial Card Style */}
          <div className="text-center">
            <div className="bg-gray-50 p-12 sm:p-16 max-w-3xl mx-auto">
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
                Monthly Analytics
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light uppercase mb-12">
                Usage Overview
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-12">
                <div className="text-center">
                  <div className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-3">{usageStats.used}</div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-600">Generated</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-3">{usageStats.total - usageStats.used}</div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-600">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-3">{usageStats.percentage}%</div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-600">Used</div>
                </div>
              </div>

              <div className="w-full bg-[#e0e0e0] h-1 mb-6">
                <div 
                  className="bg-black h-full transition-all duration-1000 ease-out"
                  style={{ width: `${usageStats.percentage}%` }}
                ></div>
              </div>

              <p className="text-sm font-light text-[#666666] tracking-[0.1em] uppercase">
                €97 SSELFIE Studio Subscription
              </p>
            </div>
          </div>

          {/* Additional Editorial Elements */}
          <div className="mt-32 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="text-xs font-normal tracking-[0.4em] uppercase text-[#666666] mb-8">
                System Status
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 border border-[#e0e0e0] bg-white">
                  <div className="font-times text-xl font-light mb-3">
                    {userModel?.trainingStatus === 'completed' ? 'Active' : 'Training'}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase font-light text-[#666666]">
                    AI Model Status
                  </div>
                </div>
                
                <div className="p-8 border border-[#e0e0e0] bg-white">
                  <div className="font-times text-xl font-light mb-3">
                    {aiImages.length > 0 ? 'Ready' : 'Empty'}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase font-light text-[#666666]">
                    Gallery Status
                  </div>
                </div>
                
                <div className="p-8 border border-[#e0e0e0] bg-white">
                  <div className="font-times text-xl font-light mb-3">
                    Active
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase font-light text-[#666666]">
                    Subscription
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}