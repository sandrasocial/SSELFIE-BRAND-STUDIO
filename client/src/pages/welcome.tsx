import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Navigation } from '@/components/navigation';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';

export default function Welcome() {
  const { user, isAuthenticated } = useAuth();

  // Fetch user's AI images and model status
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be signed in to continue.
          </p>
          <a
            href="/api/login"
            className="text-xs uppercase tracking-wider text-black hover:underline"
          >
            SIGN IN
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.luxury1}
        title="WELCOME"
        subtitle={user?.firstName ? `${user.firstName.toUpperCase()}` : 'TO SSELFIE'}
        tagline="IT STARTS WITH YOUR SELFIES"
        alignment="center"
      />

      {/* Welcome Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-[#0a0a0a] mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Your Brand Empire Starts Here
          </h1>
          <p className="text-xl text-[#666666] max-w-4xl mx-auto font-light">
            Okay gorgeous, here's what actually happened. You just joined the world's first AI-powered personal brand platform. 
            In 20 minutes, you'll have a complete business ready to launch. No technical skills required.
          </p>
        </div>
        
        {/* Business Building Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Step 1: AI Training */}
          <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer border border-[#e5e5e5]">
            <div className="absolute inset-0">
              <img 
                src={SandraImages.editorial.laptop2} 
                alt="AI Training"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                Step 01
              </div>
              
              <div>
                <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Train Your AI Model
                </h3>
                <p className="text-white/90 mb-6 text-sm font-light">
                  {aiImages.length > 0 
                    ? `${aiImages.length} AI images ready to use` 
                    : userModel?.trainingStatus === 'completed' 
                      ? 'Your AI model is trained - generate images now'
                      : userModel?.trainingStatus === 'training'
                        ? `AI training in progress... ${Math.round((userModel.progress || 0) * 100)}%`
                        : 'Upload 10-15 selfies to train your personal AI model'
                  }
                </p>
                {userModel?.trainingStatus === 'completed' ? (
                  <Link 
                    href="/ai-generator"
                    className="bg-white text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block"
                  >
                    Generate AI Images
                  </Link>
                ) : userModel?.trainingStatus === 'training' ? (
                  <div className="text-xs uppercase tracking-wider text-white/70 border border-white/30 px-6 py-3 inline-block">
                    Training in Progress...
                  </div>
                ) : (
                  <Link 
                    href="/model-training"
                    className="bg-white text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block"
                  >
                    Start AI Training
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Step 2: Brandbook */}
          <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer border border-[#e5e5e5]">
            <div className="absolute inset-0">
              <img 
                src={SandraImages.editorial.magazine1} 
                alt="Brandbook Design"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                Step 02
              </div>
              
              <div>
                <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Design Your Brandbook
                </h3>
                <p className="text-white/90 mb-6 text-sm font-light">
                  Create your complete brand identity with luxury templates. Colors, fonts, voice - everything you need.
                </p>
                <Link 
                  href="/brandbook-onboarding"
                  className="bg-white text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block"
                >
                  Create Brandbook
                </Link>
              </div>
            </div>
          </div>
          
          {/* Step 3: Dashboard */}
          <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer border border-[#e5e5e5]">
            <div className="absolute inset-0">
              <img 
                src={SandraImages.editorial.luxury2} 
                alt="Dashboard Builder"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                Step 03
              </div>
              
              <div>
                <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Your SSELFIE STUDIO
                </h3>
                <p className="text-white/90 mb-6 text-sm font-light">
                  Choose from beautiful pre-designed themes. Use your AI portraits as hero backgrounds.
                </p>
                <Link 
                  href="/workspace"
                  className="bg-white text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block"
                >
                  Open STUDIO
                </Link>
              </div>
            </div>
          </div>
          
          {/* Step 4: Landing Pages */}
          <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer border border-[#e5e5e5]">
            <div className="absolute inset-0">
              <img 
                src={SandraImages.editorial.flatlay1} 
                alt="Landing Page Builder"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                Step 04
              </div>
              
              <div>
                <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Create Landing Pages
                </h3>
                <p className="text-white/90 mb-6 text-sm font-light">
                  Chat with Sandra AI Designer to build conversion-optimized pages that actually sell.
                </p>
                <Link 
                  href="/landing-builder"
                  className="bg-white text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block"
                >
                  Build Landing Page
                </Link>
              </div>
            </div>
          </div>
          
          {/* Step 5: Moodboard */}
          <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer border border-[#e5e5e5]">
            <div className="absolute inset-0">
              <img 
                src={SandraImages.editorial.flatlay2} 
                alt="Moodboard Collections"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                Step 05
              </div>
              
              <div>
                <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Browse Moodboards
                </h3>
                <p className="text-white/90 mb-6 text-sm font-light">
                  10 collections with 200+ professional images each. Perfect complement to your AI selfies.
                </p>
                <Link 
                  href="/workspace"
                  className="bg-white text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block"
                >
                  View Collections
                </Link>
              </div>
            </div>
          </div>
          
          {/* Step 6: Launch */}
          <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer border border-[#e5e5e5]">
            <div className="absolute inset-0">
              <img 
                src={SandraImages.editorial.luxury1} 
                alt="Launch Business"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                Step 06
              </div>
              
              <div>
                <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Launch Your Business
                </h3>
                <p className="text-white/90 mb-6 text-sm font-light">
                  Configure payments, connect your domain, and go live. From selfie to business in 20 minutes.
                </p>
                <Link 
                  href="/workspace"
                  className="bg-white text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block"
                >
                  Launch Setup
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-light text-[#0a0a0a] mb-8 text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Workspace Access */}
            <Link href="/workspace" className="block">
              <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer border border-[#e5e5e5]">
                <div className="absolute inset-0">
                  <img 
                    src={SandraImages.editorial.magazine2} 
                    alt="Your Workspace"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
                </div>
                
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Complete Platform
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Your Workspace
                    </h3>
                    <p className="text-white/90 mb-6 text-sm font-light">
                      Access all your tools, images, and business features in one organized workspace
                    </p>
                    <div className="bg-white text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block">
                      Enter Workspace
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Studio Upgrade */}
            <Link href="/pricing" className="block">
              <div className="relative aspect-[4/3] overflow-hidden group cursor-pointer border border-[#e5e5e5]">
                <div className="absolute inset-0">
                  <img 
                    src={SandraImages.editorial.flatlay3} 
                    alt="SSELFIE Studio"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-transparent"></div>
                </div>
                
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Premium Features
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                      SSELFIE Studio
                    </h3>
                    <p className="text-white/90 mb-6 text-sm font-light">
                      Upgrade to unlock advanced features, premium templates, and full business automation
                    </p>
                    <div className="bg-white text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-colors inline-block">
                      View Pricing
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center bg-white border border-[#e5e5e5] p-12">
          <h2 className="text-3xl font-light text-[#0a0a0a] mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
            Welcome to Your Brand Empire
          </h2>
          <p className="text-lg text-[#666666] max-w-3xl mx-auto font-light mb-8">
            Okay, here's what actually happened. You just stepped into the future of personal branding. 
            No more complicated tech, no more overthinking. Just you, your selfies, and Sandra AI making magic happen.
          </p>
          <div className="text-sm text-[#666] uppercase tracking-wider">
            Questions? Chat with Sandra AI in any builder
          </div>
        </div>
      </main>
    </div>
  );
}