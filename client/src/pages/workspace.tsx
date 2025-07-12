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
      <div className="min-h-screen bg-white touch-manipulation">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 py-32 text-center">
          <h1 className="font-times text-[clamp(2rem,5vw,6rem)] font-extralight tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[-0.01em] uppercase mb-6 leading-none px-2">
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
  const usageStats = getUsageStats();

  return (
    <div className="min-h-screen bg-white touch-manipulation">
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
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 sm:px-8 md:px-12">
          <p className="text-[10px] sm:text-xs font-light tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white/70 mb-8 sm:mb-10">
            Your Personal Brand Empire
          </p>
          
          <div className="mb-16">
            <h1 className="font-times text-[clamp(2.5rem,9vw,9rem)] leading-[0.9] font-extralight tracking-[0.05em] sm:tracking-[0.2em] md:tracking-[0.4em] uppercase mb-5 px-2">
              SSELFIE
            </h1>
            <h2 className="font-times text-[clamp(1.2rem,3.5vw,3rem)] leading-none font-extralight tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-80 px-2">
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
      <section className="relative py-32 px-8 bg-[#f5f5f5] text-center overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-px h-40 bg-black"></div>
          <div className="absolute top-40 right-32 w-px h-60 bg-black"></div>
          <div className="absolute bottom-20 left-1/3 w-px h-32 bg-black"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="text-xs font-normal tracking-[0.4em] uppercase text-[#666666] mb-12">
            Sandra's Philosophy
          </div>
          <blockquote className="font-times text-[clamp(28px,4vw,56px)] italic leading-[1.3] tracking-[-0.02em] text-black mb-8">
            "Your mess is your message. Your story is your strategy. 
            Your authenticity is your algorithm. Let's build something real."
          </blockquote>
          <cite className="block text-xs tracking-[0.3em] uppercase font-light text-[#666666]">
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
              <p className="text-xs font-normal tracking-[0.4em] uppercase text-[#666666] mb-6">
                Your Journey
              </p>
              <h2 className="font-times text-[clamp(2rem,4vw,4rem)] font-extralight tracking-[-0.01em] uppercase leading-none">
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
            <div className="bg-[#f5f5f5] p-16 max-w-3xl mx-auto border border-[#e0e0e0]">
              <div className="text-xs font-normal tracking-[0.4em] uppercase text-[#666666] mb-8">
                Monthly Analytics
              </div>
              <h3 className="font-times text-[clamp(1.5rem,3vw,2.5rem)] font-extralight tracking-[-0.01em] uppercase mb-12">
                Usage Overview
              </h3>
              
              <div className="grid grid-cols-3 gap-12 mb-12">
                <div className="text-center">
                  <div className="font-times text-[clamp(2rem,4vw,3rem)] font-extralight mb-3">{usageStats.used}</div>
                  <div className="text-xs tracking-[0.3em] uppercase font-light text-[#666666]">Generated</div>
                </div>
                <div className="text-center">
                  <div className="font-times text-[clamp(2rem,4vw,3rem)] font-extralight mb-3">{usageStats.total - usageStats.used}</div>
                  <div className="text-xs tracking-[0.3em] uppercase font-light text-[#666666]">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="font-times text-[clamp(2rem,4vw,3rem)] font-extralight mb-3">{usageStats.percentage}%</div>
                  <div className="text-xs tracking-[0.3em] uppercase font-light text-[#666666]">Used</div>
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