import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { WorkspaceNavigation } from '@/components/workspace-navigation';
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
      id: 'sandra-photoshoot',
      number: '02', 
      title: 'Photoshoot with Sandra',
      subtitle: 'Chat with Sandra for custom prompts',
      status: userModel?.trainingStatus === 'completed' ? 'ready' : 'locked',
      statusText: userModel?.trainingStatus === 'completed' ? 'Chat with Sandra' : 'Complete Step 1',
      link: userModel?.trainingStatus === 'completed' ? '/sandra-photoshoot' : '#',
      image: SandraImages.editorial.phone1
    },
    {
      id: 'ai-photoshoot',
      number: '03',
      title: 'AI Photoshoot',
      subtitle: 'Use built-in professional prompts',
      status: userModel?.trainingStatus === 'completed' ? 'ready' : 'locked',
      statusText: userModel?.trainingStatus === 'completed' ? 'Generate Photos' : 'Complete Step 1',
      link: userModel?.trainingStatus === 'completed' ? '/ai-photoshoot' : '#',
      image: SandraImages.flatlays.workspace1
    },
    {
      id: 'custom-library',
      number: '04',
      title: 'Your Custom Photoshoot Library',
      subtitle: 'Save Sandra\'s prompts as favorites',
      status: 'ready',
      statusText: 'Organize Prompts',
      link: '/custom-photoshoot-library',
      image: SandraImages.flatlays.beauty
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
      id: 'gallery',
      number: '06',
      title: 'Gallery', 
      subtitle: 'View and download your photos',
      status: aiImages.length > 0 ? 'active' : 'locked',
      statusText: aiImages.length > 0 ? `${aiImages.length} Photos` : 'No Photos Yet',
      link: aiImages.length > 0 ? '/gallery' : '#',
      image: SandraImages.editorial.thinking
    },
    {
      id: 'sandra-mentor',
      number: '07',
      title: 'Sandra Personal Brand Mentor',
      subtitle: 'AI guidance for your brand journey',
      status: 'ready',
      statusText: 'Get Guidance',
      link: '/sandra-ai',
      image: SandraImages.editorial.laptop2
    },
    {
      id: 'business',
      number: '08',
      title: 'Build Your Business',
      subtitle: 'Landing pages, booking, payments',
      status: 'coming-soon',
      statusText: 'Coming Soon',
      link: '#',
      image: SandraImages.flatlays.planning
    },
    {
      id: 'profile',
      number: '09',
      title: 'Your Profile',
      subtitle: 'Account settings and preferences',
      status: 'ready',
      statusText: 'Manage Account',
      link: '/settings',
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
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://replicate.delivery/xezq/tIR9rofcvTxuE61uMrnnMufXCv7A8aAaMtQpIQkvYej8YhfTB/out-0.jpg"
            alt="Your SSELFIE Studio"
            className="w-full h-full object-cover"
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

      {/* Editorial Quote Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 text-center">
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

      {/* Main Content */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Your Journey - Step Cards */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-6">
                Your Journey
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide uppercase">
                Nine Steps to Empire
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {journeySteps.map((step, index) => (
                <Link key={step.id} href={step.link} className={step.status === 'locked' ? 'pointer-events-none' : ''}>
                  <div className={`group relative bg-white border border-[#e0e0e0] transition-all duration-500 ${
                    step.status === 'locked' ? 'opacity-50' : 'hover:border-black hover:shadow-lg'
                  }`}>
                    {/* Step Image with Overlay */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f5f5]">
                      <img 
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Subtle Dark Overlay */}
                      <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/30"></div>
                      
                      {/* Text Overlay for Steps 01 and 03 */}
                      {(index === 0 || index === 2) && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute bottom-6 left-6 right-6">
                            <div className="text-xs tracking-[0.3em] uppercase font-light text-white/70 mb-2">
                              Step {step.number}
                            </div>
                            <h3 className="font-times text-lg font-light tracking-[-0.01em] text-white mb-2">
                              {step.title}
                            </h3>
                            <p className="text-sm font-light text-white/80 leading-relaxed">
                              {step.subtitle}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Step Content - Hidden for overlay cards */}
                    {!(index === 0 || index === 2) && (
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs tracking-[0.3em] uppercase font-light text-[#666666]">
                            Step {step.number}
                          </span>
                          <span className={`text-xs tracking-[0.2em] uppercase font-light ${
                            step.status === 'complete' ? 'text-black' :
                            step.status === 'progress' ? 'text-[#666666]' :
                            step.status === 'ready' ? 'text-black' :
                            step.status === 'locked' ? 'text-[#999999]' :
                            'text-[#666666]'
                          }`}>
                            {step.statusText}
                          </span>
                        </div>
                        
                        <h3 className="font-times text-xl font-light tracking-[-0.01em] mb-2">
                          {step.title}
                        </h3>
                        
                        <p className="text-sm font-light text-[#666666] leading-relaxed">
                          {step.subtitle}
                        </p>
                      </div>
                    )}

                    {/* Minimal Content for Overlay Cards */}
                    {(index === 0 || index === 2) && (
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs tracking-[0.3em] uppercase font-light text-[#666666]">
                            Step {step.number}
                          </span>
                          <span className={`text-xs tracking-[0.2em] uppercase font-light ${
                            step.status === 'complete' ? 'text-black' :
                            step.status === 'progress' ? 'text-[#666666]' :
                            step.status === 'ready' ? 'text-black' :
                            step.status === 'locked' ? 'text-[#999999]' :
                            'text-[#666666]'
                          }`}>
                            {step.statusText}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Status Indicator */}
                    <div className={`absolute top-6 right-6 w-2 h-2 ${
                      step.status === 'complete' ? 'bg-white shadow-md' :
                      step.status === 'progress' ? 'bg-white/80 shadow-md' :
                      step.status === 'ready' ? 'bg-white shadow-md' :
                      'bg-[#e0e0e0]'
                    }`}></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>



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
    </div>
  );
}