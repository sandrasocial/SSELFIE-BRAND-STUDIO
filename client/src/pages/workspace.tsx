import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Navigation } from '@/components/navigation';
import { SandraImages } from '@/lib/sandra-images';

export default function Workspace() {
  const { user, isAuthenticated } = useAuth();

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

  // User Journey Steps - Starting with AI Training as #1
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
      image: 'https://replicate.delivery/xezq/tIR9rofcvTxuE61uMrnnMufXCv7A8aAaMtQpIQkvYej8YhfTB/out-0.jpg'
    },
    {
      id: 'photoshoot',
      number: '02', 
      title: 'AI Photoshoot',
      subtitle: 'Generate stunning brand photos',
      status: userModel?.trainingStatus === 'completed' ? 'ready' : 'locked',
      statusText: userModel?.trainingStatus === 'completed' ? 'Generate Photos' : 'Complete Step 1',
      link: userModel?.trainingStatus === 'completed' ? '/sandra-photoshoot' : '#',
      image: 'https://replicate.delivery/xezq/GdKc1-ELrOTMv0JdOx_jjfyJn_fCXp5nAYJjFCdRB7fIYhfTB/out-0.jpg'
    },
    {
      id: 'gallery',
      number: '03',
      title: 'Your Gallery', 
      subtitle: 'View and download your photos',
      status: aiImages.length > 0 ? 'active' : 'locked',
      statusText: aiImages.length > 0 ? `${aiImages.length} Photos` : 'No Photos Yet',
      link: aiImages.length > 0 ? '/gallery' : '#',
      image: 'https://replicate.delivery/xezq/tIR9rofcvTxuE61uMrnnMufXCv7A8aAaMtQpIQkvYej8YhfTB/out-0.jpg'
    },
    {
      id: 'business',
      number: '04',
      title: 'Build Business',
      subtitle: 'Landing pages, booking, payments',
      status: 'coming-soon',
      statusText: 'Coming Soon',
      link: '#',
      image: 'https://replicate.delivery/xezq/GdKc1-ELrOTMv0JdOx_jjfyJn_fCXp5nAYJjFCdRB7fIYhfTB/out-0.jpg'
    }
  ];

  // Quick Tools Grid
  const getQuickTools = () => [
    {
      title: 'Sandra AI',
      subtitle: 'Personal brand mentor',
      link: '/sandra-ai',
      icon: '✦',
      status: 'active'
    },
    {
      title: 'AI Photographer',
      subtitle: 'Create custom prompts',
      link: '/sandra-photoshoot', 
      icon: '◐',
      status: 'active'
    },
    {
      title: 'Image Library',
      subtitle: 'Browse your photos',
      link: '/gallery',
      icon: '◆',
      status: aiImages.length > 0 ? 'active' : 'disabled'
    },
    {
      title: 'Settings',
      subtitle: 'Account and preferences',
      link: '/settings',
      icon: '◇',
      status: 'active'
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
        <Navigation />
        <div className="max-w-4xl mx-auto px-8 py-32 text-center">
          <h1 className="font-times text-[clamp(3rem,6vw,6rem)] font-extralight tracking-[-0.01em] uppercase mb-6 leading-none">
            Please Sign In
          </h1>
          <p className="text-base font-light text-[#666666] max-w-lg mx-auto mb-10 leading-relaxed">
            You need to be signed in to access your STUDIO.
          </p>
          <a
            href="/api/login"
            className="inline-block px-8 py-4 text-xs font-normal tracking-[0.3em] uppercase border border-black hover:bg-black hover:text-white transition-all duration-300"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const journeySteps = getUserJourneySteps();
  const quickTools = getQuickTools();
  const usageStats = getUsageStats();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
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
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-8">
          <p className="text-xs font-light tracking-[0.4em] uppercase text-white/70 mb-10">
            Your Personal Brand Empire
          </p>
          
          <div className="mb-16">
            <h1 className="font-times text-[clamp(4rem,10vw,9rem)] leading-[0.9] font-extralight tracking-[0.5em] uppercase mb-5">
              SSELFIE
            </h1>
            <h2 className="font-times text-[clamp(1.5rem,4vw,3rem)] leading-none font-extralight tracking-[0.3em] uppercase opacity-80">
              STUDIO
            </h2>
          </div>
          
          <p className="text-base tracking-[0.1em] uppercase opacity-80 font-light max-w-2xl mx-auto leading-relaxed mb-16">
            This is where magic happens. Where one selfie becomes a business. 
            Where you stop playing small and start building empire.
          </p>

          {/* Quick Stats in Hero */}
          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-3xl font-times mb-2">{usageStats.used}</div>
              <div className="text-xs tracking-[0.2em] uppercase opacity-60">Photos Generated</div>
            </div>
            <div>
              <div className="text-3xl font-times mb-2">{journeySteps.filter(s => s.status === 'complete').length}</div>
              <div className="text-xs tracking-[0.2em] uppercase opacity-60">Steps Complete</div>
            </div>
            <div>
              <div className="text-3xl font-times mb-2">{usageStats.total - usageStats.used}</div>
              <div className="text-xs tracking-[0.2em] uppercase opacity-60">Remaining This Month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Quote Section */}
      <section className="py-32 px-8 bg-[#f5f5f5] text-center">
        <div className="max-w-4xl mx-auto">
          <blockquote className="font-times text-[clamp(28px,4vw,56px)] italic leading-[1.3] tracking-[-0.02em] text-black">
            "Your mess is your message. Your story is your strategy. 
            Your authenticity is your algorithm. Let's build something real."
          </blockquote>
          <cite className="block mt-8 text-xs tracking-[0.3em] uppercase font-light text-[#666666]">
            Sandra Sigurjónsdóttir
          </cite>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Your Journey - Step Cards */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <p className="text-xs font-normal tracking-[0.4em] uppercase text-[#666666] mb-6">
                Your Journey
              </p>
              <h2 className="font-times text-[clamp(2rem,4vw,4rem)] font-extralight tracking-[-0.01em] uppercase leading-none">
                Four Steps to Empire
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {journeySteps.map((step, index) => (
                <Link key={step.id} href={step.link} className={step.status === 'locked' ? 'pointer-events-none' : ''}>
                  <div className={`group relative bg-white border border-[#e0e0e0] transition-all duration-500 ${
                    step.status === 'locked' ? 'opacity-50' : 'hover:border-black hover:shadow-lg'
                  }`}>
                    {/* Step Image */}
                    <div className="aspect-[4/5] overflow-hidden bg-[#f5f5f5]">
                      <img 
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Step Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs tracking-[0.3em] uppercase font-light text-[#666666]">
                          Step {step.number}
                        </span>
                        <span className={`text-xs tracking-[0.2em] uppercase font-light ${
                          step.status === 'complete' ? 'text-green-600' :
                          step.status === 'progress' ? 'text-blue-600' :
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

                    {/* Status Indicator */}
                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                      step.status === 'complete' ? 'bg-green-500' :
                      step.status === 'progress' ? 'bg-blue-500 animate-pulse' :
                      step.status === 'ready' ? 'bg-black' :
                      'bg-[#e0e0e0]'
                    }`}></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Tools Grid */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <p className="text-xs font-normal tracking-[0.4em] uppercase text-[#666666] mb-6">
                Quick Access
              </p>
              <h2 className="font-times text-[clamp(2rem,4vw,4rem)] font-extralight tracking-[-0.01em] uppercase leading-none">
                Your Toolkit
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickTools.map((tool, index) => (
                <Link key={tool.title} href={tool.link} className={tool.status === 'disabled' ? 'pointer-events-none' : ''}>
                  <div className={`group p-8 bg-white border border-[#e0e0e0] text-center transition-all duration-300 ${
                    tool.status === 'disabled' ? 'opacity-50' : 'hover:bg-black hover:text-white hover:border-black'
                  }`}>
                    <div className="text-3xl mb-6 transition-transform duration-300 group-hover:scale-110">
                      {tool.icon}
                    </div>
                    <h3 className="font-times text-lg font-light tracking-[-0.01em] mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-sm font-light opacity-60 group-hover:opacity-80">
                      {tool.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Usage Overview */}
          <div className="text-center">
            <div className="bg-[#f5f5f5] p-12 max-w-2xl mx-auto">
              <h3 className="font-times text-2xl font-light tracking-[-0.01em] mb-6">
                This Month's Usage
              </h3>
              
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-times mb-2">{usageStats.used}</div>
                  <div className="text-xs tracking-[0.2em] uppercase text-[#666666]">Used</div>
                </div>
                <div className="text-[#e0e0e0] text-2xl">/</div>
                <div className="text-center">
                  <div className="text-4xl font-times mb-2">{usageStats.total}</div>
                  <div className="text-xs tracking-[0.2em] uppercase text-[#666666]">Total</div>
                </div>
              </div>

              <div className="w-full bg-[#e0e0e0] h-2 mb-4">
                <div 
                  className="bg-black h-full transition-all duration-500"
                  style={{ width: `${usageStats.percentage}%` }}
                ></div>
              </div>

              <p className="text-sm font-light text-[#666666]">
                {usageStats.total - usageStats.used} generations remaining
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}