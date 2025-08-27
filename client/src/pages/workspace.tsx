import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MemberNavigation } from '../components/member-navigation';
import { GlobalFooter } from '../components/global-footer';
import { SandraImages } from '../lib/sandra-images';

// Elena's Revolutionary 4-Phase Navigation System
import { ElenaPhaseNavigation } from '../components/workspace/ElenaPhaseNavigation';
import { PremiumProgressDashboard } from '../components/workspace/PremiumProgressDashboard';
import { LuxuryPhaseCard } from '../components/workspace/LuxuryPhaseCard';
import { ResponsiveWorkspaceGrid } from '../components/workspace/ResponsiveWorkspaceGrid';
import { WebsiteManager } from '../components/workspace/WebsiteManager';


export default function Workspace() {
  // LAUNCH MODE: Feature flag for production launch (shows only first 3 steps)
  const LAUNCH_MODE = true;
  
  const { user, isAuthenticated, isLoading, error } = useAuth();
  
  console.log('🔧 WORKSPACE AUTH CHECK:', {
    isAuthenticated,
    user: user?.email,
    role: user?.role,
    launchMode: LAUNCH_MODE
  });
  


  // Fetch user data with proper typing
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  const { data: userModel, refetch: refetchUserModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated,
    refetchInterval: (data: any) => {
      // CRITICAL FIX: Only auto-refresh when actually on workspace page to prevent Maya interference
      const currentPath = window.location.pathname;
      const isOnWorkspacePage = currentPath === '/workspace' || currentPath === '/';
      
      if (!isOnWorkspacePage) {
        return false; // Never auto-refresh when user is on other pages (Maya, etc.)
      }
      
      // DEBUGGING: Log the exact data being returned
      if (data) {
        console.log('🔍 WORKSPACE DEBUG - User Model Data:', {
          trainingStatus: data.trainingStatus,
          replicateModelId: data.replicateModelId,
          triggerWord: data.triggerWord,
          trainingProgress: data.trainingProgress,
          fullData: data
        });
      }
      
      // Auto-refresh every 10 seconds if training is in progress and on workspace
      const isTraining = data?.trainingStatus === 'training' || 
                        data?.trainingStatus === 'starting' ||
                        data?.trainingStatus === 'processing' ||
                        data?.trainingStatus === 'pending' ||
                        (data?.replicateModelId && data?.trainingStatus !== 'completed' && data?.trainingStatus !== 'failed');
      
      console.log('🔍 WORKSPACE DEBUG - Training Detection:', {
        isTraining,
        trainingStatus: data?.trainingStatus,
        hasReplicateId: !!data?.replicateModelId,
        isCompleted: data?.trainingStatus === 'completed',
        isFailed: data?.trainingStatus === 'failed'
      });
      
      return isTraining ? 10000 : false; // 10 seconds if training, otherwise no auto-refresh
    }
  });

  const { data: subscription = {} } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated
  });

  const { data: usage = {} } = useQuery({
    queryKey: ['/api/usage/status'],
    enabled: isAuthenticated
  });

  // Check if user has full access based on new pricing structure
  const hasFullAccess = user?.plan === 'full-access' || 
                        user?.plan === 'admin' ||
                        user?.role === 'admin' ||
                        (subscription as any)?.plan === 'full-access' || 
                        (subscription as any)?.plan === 'sselfie-studio' || // Legacy plan support
                        (usage as any)?.plan === 'full-access' ||
                        (usage as any)?.plan === 'sselfie-studio'; // Legacy plan support

  // Check if user has trained model (required for both tiers)
  const hasTrainedModel = userModel && (userModel as any).trainingStatus === 'completed';



  const getSimpleStats = () => {
    if (!usage) return { used: 0, remaining: 5, plan: 'Free' };
    
    const usageData = usage as any;
    if (usageData.plan === 'admin' || usageData.isAdmin) {
      return {
        used: usageData.monthlyUsed || 0,
        remaining: 'Unlimited',
        plan: 'Admin'
      };
    }
    
    // Enhanced plan detection from multiple sources
    const userPlan = user?.plan || (subscription as any)?.plan || usageData?.plan || 'basic';
    const hasFullAccessPlan = userPlan === 'full-access' || userPlan === 'sselfie-studio' || userPlan === 'admin';
    
    const used = usageData.monthlyUsed || user?.generationsUsedThisMonth || 0;
    const total = hasFullAccessPlan ? (user?.monthlyGenerationLimit || 100) : (user?.monthlyGenerationLimit || 30);
    
    return {
      used,
      remaining: total - used,
      plan: hasFullAccessPlan ? 'Full Access' : 'Basic'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {/* LUXURY LOADING ANIMATION */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border border-gray-300 rounded-full animate-pulse"></div>
          </div>
          
          <div className="font-serif text-lg font-light uppercase tracking-[0.3em] text-black mb-2">
            Loading Studio
          </div>
          <p className="text-xs text-gray-600 font-light tracking-wide">
            Preparing your luxury workspace...
          </p>
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

  // Elena's Revolutionary Journey System with Launch Mode Support
  const getJourneySteps = () => {
    const hasImages = Array.isArray(aiImages) && aiImages.length > 0;
    const hasTraining = userModel && (userModel as any).trainingStatus === 'completed';
    const modelStatus = (userModel as any)?.trainingStatus || 'none';
    const isAdmin = user?.role === 'admin';

    const allSteps = [
      {
        id: 'train',
        title: 'Train Your AI Model',
        description: 'Upload 10-15 selfies to create your personal FLUX AI model. This takes about 15 minutes.',
        image: SandraImages.editorial.phone1,
        link: '/simple-training',
        status: hasTraining ? 'complete' : hasImages ? 'progress' : 'ready',
        statusMessage: hasTraining ? 'Model Ready' : hasImages ? 'Training...' : 'Start Here',
        nextStep: hasTraining ? 'Ready for Maya styling session' : hasImages ? 'AI model training in progress' : 'Upload your selfies to begin'
      },
      {
        id: 'style', 
        title: 'Style with Maya',
        description: 'Chat with Maya, your AI celebrity stylist, to define your perfect editorial style and aesthetic.',
        image: SandraImages.editorial.mirror,
        link: '/maya',
        status: hasTraining ? 'ready' : 'locked',
        statusMessage: hasTraining ? 'Maya Ready' : 'Train AI First',
        nextStep: hasTraining ? 'Define your signature style with Maya' : 'Complete AI training first'
      },
      {
        id: 'gallery',
        title: 'Curate Your Gallery',
        description: 'Organize and manage your personal brand photo collection with smart categorization and optimization.',
        image: SandraImages.editorial.laptop1,
        link: '/sselfie-gallery',
        status: hasTraining ? 'ready' : 'locked',
        statusMessage: hasTraining ? 'View Gallery' : 'Complete Previous Steps',
        nextStep: hasTraining ? 'Organize your professional photos' : 'Complete training and styling first'
      },
      {
        id: 'build',
        title: 'Build Your Brand',
        description: 'Create landing pages, business websites, and professional presence using your AI photos.',
        image: SandraImages.editorial.aiSuccess,
        link: '/victoria',
        status: hasTraining ? 'ready' : 'locked',
        statusMessage: hasTraining ? 'Build Website' : 'Complete Previous Steps',
        nextStep: hasTraining ? 'Launch your professional website' : 'Complete previous phases first'
      }
    ];

    // Filter steps based on launch mode (admins always see all steps)
    if (LAUNCH_MODE && !isAdmin) {
      return allSteps.slice(0, 3); // Show only TRAIN, STYLE, GALLERY for launch
    }
    
    return allSteps;
  };

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
              {LAUNCH_MODE && user?.role !== 'admin' ? 'Three Simple Steps' : 'Four Simple Steps'}
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
                        step.status === 'progress' ? 'bg-black/80 text-white' :
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
                          {index === 0 ? 'T R A I N' : index === 1 ? 'S T Y L E' : index === 2 ? 'G A L L E R Y' : 'B U I L D'}
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
                          <div className="h-1 bg-black rounded-none animate-pulse" style={{ width: '50%' }}></div>
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
              <Link href="/sselfie-gallery" className="group">
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

              {/* Victoria Widget - Active */}
              <Link href="/victoria" className="group">
                <div className="relative overflow-hidden bg-black" style={{ aspectRatio: '21/9' }}>
                  <img 
                    src="https://i.postimg.cc/HWFbv1DB/file-32.png"
                    alt="Victoria Website Builder"
                    className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:opacity-80 group-hover:scale-105"
                  />
                  
                  {/* Elegant Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="font-serif text-xl md:text-2xl font-light tracking-[0.3em] uppercase">
                        V I C T O R I A
                      </div>
                      <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                        Website Builder
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle Hover Effect */}
                  <div className="absolute inset-0 border border-white opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                </div>
              </Link>

            </div>
          </div>

          {/* Website Management Section - For users who have completed their journey */}
          {journeySteps.filter(s => s.status === 'complete').length >= 3 && (
            <div className="mb-32">
              <div className="text-center mb-12">
                <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
                  Your Websites
                </div>
                <h3 className="font-serif text-2xl font-light tracking-wide">
                  Website Management
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto mt-4 font-light">
                  Create and manage professional websites using your AI photos and brand elements.
                </p>
              </div>

              <WebsiteManager />
            </div>
          )}

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
                
                {!hasFullAccess && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Want more photos and full features? Full Access gives you 100 photos per month plus Maya AI chat and Victoria website builder.
                    </p>
                    <a
                      href="/pricing"
                      className="inline-block px-6 py-3 border border-black text-black text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-all duration-300"
                    >
                      Upgrade to Full Access
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