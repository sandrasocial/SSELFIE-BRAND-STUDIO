import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { SandraImages } from '@/lib/sandra-images';

export default function Workspace() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  


  // Fetch user data
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  const { data: userModel, refetch: refetchUserModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated,
    refetchInterval: (data) => {
      // Auto-refresh every 10 seconds if training is in progress
      const isTraining = data?.trainingStatus === 'training' || 
                        data?.trainingStatus === 'starting' ||
                        data?.trainingStatus === 'processing' ||
                        (data?.replicateModelId && data?.trainingStatus !== 'completed' && data?.trainingStatus !== 'failed');
      return isTraining ? 10000 : false; // 10 seconds if training, otherwise no auto-refresh
    }
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated
  });

  const { data: usage } = useQuery({
    queryKey: ['/api/usage/status'],
    enabled: isAuthenticated
  });

  // Check if user has premium access
  const isPremiumUser = subscription?.plan === 'sselfie-studio' || user?.plan === 'admin';

  // Simplified User Journey - 3 clear steps
  const getJourneySteps = () => {
    // Step 1: Upload Photos - Enhanced training status detection
    const step1Complete = userModel?.trainingStatus === 'completed';
    const step1InProgress = userModel?.trainingStatus === 'training' || 
                          userModel?.trainingStatus === 'starting' ||
                          userModel?.trainingStatus === 'processing' ||
                          (userModel?.replicateModelId && userModel?.trainingStatus !== 'completed' && userModel?.trainingStatus !== 'failed');
    
    // Step 2: Take Photos  
    const step2Ready = step1Complete;
    const step2HasPhotos = aiImages.length > 0;
    
    // Step 3: AI Photoshoot - should be ready when model is trained
    const step3Ready = step1Complete;
    
    return [
      {
        id: 'upload',
        title: 'Upload Your Selfies',
        description: 'Just grab a few selfies from your phone and upload them. Takes about 2 minutes.',
        timeEstimate: '2 minutes',
        status: step1Complete ? 'complete' : step1InProgress ? 'progress' : 'start',
        statusMessage: step1Complete ? 'Done! Ready for photos' : 
                      step1InProgress ? 'AI training in progress... (Check back in a few minutes)' : 
                      'Start here first',
        link: step1InProgress ? '#' : '/ai-training', // Don't link to training page if already training
        image: "https://i.postimg.cc/bNF14sGc/out-1-4.png",
        nextStep: step1Complete ? null : 'Upload a few selfies to get started'
      },
      {
        id: 'photoshoot',
        title: 'Chat with Maya',
        description: 'Your personal photographer who creates stunning photos in any style you want.',
        timeEstimate: '10 minutes',
        status: step2HasPhotos ? 'complete' : step2Ready ? 'ready' : 'locked',
        statusMessage: step2HasPhotos ? `${aiImages.length} photos ready` :
                      step2Ready ? 'Ready for your photoshoot' :
                      'Upload selfies first',
        link: step2Ready ? '/maya' : '#',
        image: "https://i.postimg.cc/HWFbv1DB/file-32.png",
        nextStep: step2HasPhotos ? null : step2Ready ? 'Chat with Maya to create photos' : null
      },
      {
        id: 'aiphotoshoot', 
        title: 'AI Photoshoot',
        description: 'Create professional photos instantly with your trained AI model.',
        timeEstimate: '5 minutes',
        status: step3Ready ? 'ready' : 'locked',
        statusMessage: step3Ready ? 'Ready to shoot' : 'Train your AI first',
        link: step3Ready ? '/ai-photoshoot' : '#',
        image: "https://i.postimg.cc/4N8v1bP5/IMG-6564.jpg",
        nextStep: step3Ready ? 'Generate photos and build your brand' : null
      }
    ];
  };

  const getSimpleStats = () => {
    if (!usage) return { used: 0, remaining: 5, plan: 'Free' };
    
    if (usage.plan === 'admin' || usage.isAdmin) {
      return {
        used: usage.monthlyUsed || 0,
        remaining: 'Unlimited',
        plan: 'Admin'
      };
    }
    
    const used = usage.monthlyUsed || 0;
    const total = usage.monthlyAllowed || 5;
    
    return {
      used,
      remaining: total - used,
      plan: isPremiumUser ? 'Studio' : 'Free'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl mb-6 text-black font-light uppercase tracking-wide">
            Hey There
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Continue with Google to access your studio space.
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-4 text-xs uppercase tracking-wide border border-black hover:bg-black hover:text-white transition-all duration-300"
          >
            Continue with Google
          </a>
        </div>
      </div>
    );
  }

  const journeySteps = getJourneySteps();
  const stats = getSimpleStats();

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Editorial Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src={SandraImages.hero.homepage}
            alt="Your Studio"
            className="w-full h-full object-cover object-center-top"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-8 flex flex-col justify-end min-h-screen pb-20">
          <div className="text-xs tracking-[0.4em] uppercase opacity-70 mb-8">
            Welcome Back
          </div>
          
          <h1 className="font-serif text-[clamp(4rem,10vw,10rem)] leading-[0.8] font-light uppercase tracking-wide mb-8">
            Your Studio
          </h1>
          
          <p className="text-lg max-w-2xl mx-auto opacity-80 font-light leading-relaxed">
            Ready to create something amazing? You're just {journeySteps.filter(s => s.status === 'complete').length === 0 ? 'a few clicks' : 'moments'} away from having professional photos that'll make everyone wonder where you got them done.
          </p>
        </div>
      </section>

      {/* Main Content - Editorial Lookbook Style */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          
          {/* What Happens Next - Simple Steps */}
          <div className="text-center mb-20">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
              Here's What Happens Next
            </div>
            <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-light uppercase tracking-wide leading-tight mb-8">
              Three Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              I know this might feel like a lot, but honestly, it's way easier than you think. 
              Most people finish everything in about 20 minutes.
            </p>
          </div>

          {/* Editorial Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {journeySteps.map((step, index) => (
              <div key={step.id} className="group">
                <Link href={step.link} className={step.status === 'locked' ? 'pointer-events-none' : ''}>
                  {/* Large Editorial Image */}
                  <div className="relative mb-8 overflow-hidden bg-gray-50" style={{ aspectRatio: '4/5' }}>
                    <img 
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    
                    {/* Soft Dark Overlay */}
                    <div className="absolute inset-0 bg-black/30"></div>
                    
                    {/* Minimalist Status Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`px-2 py-1 text-xs font-light flex items-center gap-2 ${
                        step.status === 'complete' ? 'bg-black/80 text-white' :
                        step.status === 'progress' ? 'bg-yellow-500/90 text-black' :
                        step.status === 'ready' ? 'bg-white/90 text-black' :
                        'bg-white/70 text-gray-600'
                      }`}>
                        {step.status === 'progress' && (
                          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                        )}
                        {step.statusMessage}
                      </div>
                    </div>
                    
                    {/* Elegant Title Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-3xl md:text-4xl font-light tracking-[0.4em] uppercase">
                          {index === 0 ? 'T R A I N' : index === 1 ? 'S T Y L E' : 'P H O T O S H O O T'}
                        </div>
                        <div className="text-xs tracking-[0.2em] uppercase opacity-80 mt-2">
                          Step {index + 1}
                        </div>
                      </div>
                    </div>
                    
                    {/* Overlay for locked state */}
                    {step.status === 'locked' && (
                      <div className="absolute inset-0 bg-black/50"></div>
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-xl font-light leading-tight text-black">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed font-light">
                      {step.description}
                    </p>
                    
                    {step.nextStep && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">
                          Next Step
                        </div>
                        <p className="text-sm text-black font-light">
                          {step.nextStep}
                        </p>
                      </div>
                    )}
                    
                    {/* Training Progress Indicator */}
                    {step.id === 'upload' && step.status === 'progress' && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">
                          Training Status
                        </div>
                        <p className="text-sm text-black font-light">
                          Your AI model is being trained. This usually takes 10-15 minutes. 
                          You can safely close this page and come back later.
                        </p>
                        <div className="mt-3 w-full bg-gray-200 rounded-none h-1">
                          <div className="h-1 bg-yellow-500 rounded-none animate-pulse" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Elegant Access Widgets - Underneath Steps */}
          <div className="mb-32">
            <div className="text-center mb-12">
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
                Quick Access
              </div>
              <h3 className="font-serif text-2xl font-light tracking-wide">
                Your Creative Tools
              </h3>
            </div>

            {/* Compact Elegant Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Gallery Widget */}
              <Link href="/gallery" className="group">
                <div className="relative overflow-hidden bg-black" style={{ aspectRatio: '21/9' }}>
                  <img 
                    src="https://i.postimg.cc/Vk6M70XM/out-1-20.jpg"
                    alt="Gallery"
                    className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:opacity-80 group-hover:scale-105"
                  />
                  
                  {/* Elegant Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="font-serif text-xl md:text-2xl font-light tracking-[0.3em] uppercase">
                        G A L L E R Y
                      </div>
                      <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                        Your AI Photos
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle Hover Effect */}
                  <div className="absolute inset-0 border border-white opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                </div>
              </Link>

              {/* Library Widget */}
              <Link href="/flatlay-library" className="group">
                <div className="relative overflow-hidden bg-black" style={{ aspectRatio: '21/9' }}>
                  <img 
                    src={SandraImages.flatlays.luxury}
                    alt="Library"
                    className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:opacity-80 group-hover:scale-105"
                  />
                  
                  {/* Elegant Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="font-serif text-xl md:text-2xl font-light tracking-[0.3em] uppercase">
                        L I B R A R Y
                      </div>
                      <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                        Image Collections
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle Hover Effect */}
                  <div className="absolute inset-0 border border-white opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                </div>
              </Link>

              {/* Victoria Widget - Locked */}
              <div className="group">
                <div className="relative overflow-hidden bg-black opacity-60" style={{ aspectRatio: '21/9' }}>
                  <img 
                    src={SandraImages.editorial.lifestyle}
                    alt="Victoria"
                    className="w-full h-full object-cover opacity-40"
                  />
                  
                  {/* Elegant Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="font-serif text-xl md:text-2xl font-light tracking-[0.3em] uppercase">
                        V I C T O R I A
                      </div>
                      <div className="text-xs tracking-[0.2em] uppercase opacity-60 mt-2">
                        Coming Soon
                      </div>
                    </div>
                  </div>
                  
                  {/* Lock Overlay */}
                  <div className="absolute inset-0 bg-black/30"></div>
                  
                  {/* Subtle Lock Indicator */}
                  <div className="absolute bottom-4 right-4">
                    <div className="w-4 h-4 border border-white/50 rounded-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 border border-white/50 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Your Current Plan - Simple and Clean */}
          <div className="text-center py-20">
            <div className="max-w-xl mx-auto">
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
                Your Plan
              </div>
              
              <div className="bg-gray-50 p-12">
                <h3 className="font-serif text-3xl font-light mb-6">
                  {stats.plan} Plan
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="font-serif text-4xl font-light mb-2">
                      {stats.used}
                    </div>
                    <div className="text-xs tracking-[0.3em] uppercase text-gray-600">
                      Photos Created This Month
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-serif text-2xl font-light mb-2 text-gray-600">
                      {stats.remaining}
                    </div>
                    <div className="text-xs tracking-[0.3em] uppercase text-gray-600">
                      {typeof stats.remaining === 'number' ? 'Photos Remaining' : 'Photos Available'}
                    </div>
                  </div>
                </div>
                
                {!isPremiumUser && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Want more photos and premium features? The Studio plan gives you 100 photos per month plus access to our flatlay library.
                    </p>
                    <a
                      href="/pricing"
                      className="inline-block px-6 py-3 border border-black text-black text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-all duration-300"
                    >
                      Upgrade to Studio
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>



          {/* A Little Encouragement */}
          <div className="text-center py-20 bg-gray-50">
            <div className="max-w-3xl mx-auto px-8">
              <blockquote className="font-serif text-3xl md:text-4xl font-light italic leading-tight text-black mb-8">
                "You're closer than you think to having photos that make people stop scrolling."
              </blockquote>
              <cite className="text-xs tracking-[0.3em] uppercase text-gray-500">
                Trust me on this one – Sandra
              </cite>
            </div>
          </div>

        </div>
      </section>

      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}