import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { SandraImages } from '../lib/sandra-images';

// Maya interface now uses the main page route instead of overlay component

export function SimplifiedWorkspace() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  
  // Fetch user data
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  const { data: usage = {} } = useQuery({
    queryKey: ['/api/usage/status'],
    enabled: isAuthenticated
  });

  // Check training status
  const hasTrainedModel = userModel && (userModel as any).trainingStatus === 'completed';
  const isTraining = (userModel as any)?.trainingStatus === 'training' || 
                    (userModel as any)?.trainingStatus === 'starting' ||
                    (userModel as any)?.trainingStatus === 'processing';

  // Define the three core steps
  const steps = [
    {
      id: 'train',
      number: '01',
      title: 'TRAIN',
      subtitle: 'Your AI Model',
      description: 'Upload 10-15 selfies to create your personal FLUX AI model. Takes about 15 minutes.',
      status: hasTrainedModel ? 'complete' : isTraining ? 'progress' : 'ready',
      statusText: hasTrainedModel ? 'MODEL READY' : isTraining ? 'TRAINING...' : 'START HERE',
      link: '/simple-training',
      bgImage: SandraImages.editorial.phone1
    },
    {
      id: 'style',
      number: '02', 
      title: 'STYLE',
      subtitle: 'With Maya AI',
      description: 'Chat with Maya, your AI styling intelligence, to create your perfect editorial concepts.',
      status: hasTrainedModel ? 'ready' : 'locked',
      statusText: hasTrainedModel ? 'MAYA READY' : 'TRAIN AI FIRST',
      action: 'maya',
      bgImage: SandraImages.editorial.mirror
    },
    {
      id: 'gallery',
      number: '03',
      title: 'GALLERY', 
      subtitle: 'Your Collection',
      description: 'Organize and manage your AI-generated personal brand photo collection.',
      status: hasTrainedModel ? 'ready' : 'locked',
      statusText: hasTrainedModel ? 'VIEW GALLERY' : 'COMPLETE PREVIOUS STEPS',
      link: '/sselfie-gallery',
      bgImage: SandraImages.editorial.laptop1
    }
  ];

  const handleStepClick = (step: any) => {
    if (step.status === 'locked') return;
    
    if (step.action === 'maya') {
      window.location.href = '/maya';
    } else if (step.link) {
      window.location.href = step.link;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="font-serif text-lg font-light uppercase tracking-[0.3em] text-black mb-2">
            Loading Studio
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white font-light">
        {/* Editorial Navigation - Matching Styleguide */}
        <nav className="nav fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="nav-content max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
            <div className="logo font-serif text-xl font-normal tracking-tight">
              SSELFIE Studio
            </div>
            <ul className="nav-menu flex items-center gap-8">
              <li>
                <Link href="/profile" className="nav-link text-xs uppercase tracking-[0.3em] text-black hover:opacity-60 transition-opacity duration-300">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/settings" className="nav-link text-xs uppercase tracking-[0.3em] text-black hover:opacity-60 transition-opacity duration-300">
                  Settings
                </Link>
              </li>
              <li>
                <a 
                  href="/api/logout"
                  className="nav-link text-xs uppercase tracking-[0.3em] text-black hover:opacity-60 transition-opacity duration-300"
                >
                  Sign Out
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Editorial Workspace Header - Full Styleguide */}
        <div className="section pt-32 pb-20 text-center bg-gray-50">
          <div className="container max-w-6xl mx-auto px-8">
            <div className="eyebrow text-xs font-normal tracking-[0.4em] uppercase text-gray-500 mb-8">
              Welcome Back
            </div>
            <h1 className="font-serif text-[clamp(4rem,8vw,8rem)] leading-[0.9] font-extralight uppercase tracking-[0.3em] text-black mb-8">
              Your Studio
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Create professional photos that make people wonder where you got them done.
            </p>
          </div>
        </div>

        {/* Three Step Layout - Full Bleed Editorial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`editorial-card group relative min-h-screen cursor-pointer transition-all duration-500 overflow-hidden ${
                step.status === 'locked' ? 'cursor-not-allowed' : ''
              } ${
                index === 0 ? 'bg-white hover:bg-black' : 
                index === 1 ? 'bg-gray-50 hover:bg-black' : 
                'bg-black'
              }`}
              onClick={() => handleStepClick(step)}
            >
              {/* Full Bleed Background Image */}
              <div className="hero-bg absolute inset-0 opacity-30 transition-opacity duration-1000 group-hover:opacity-40">
                <img 
                  src={step.bgImage} 
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>

              {/* Editorial Number - Large Background */}
              <div className={`card-number absolute top-8 right-12 font-serif text-[200px] leading-none font-extralight opacity-10 transition-all duration-500 ${
                index === 2 ? 'text-white' : 'text-black group-hover:text-white'
              }`}>
                {step.number}
              </div>

              {/* Content Container */}
              <div className="relative z-10 h-full flex flex-col justify-center px-12 py-20 text-center max-w-md mx-auto">
                
                {/* Editorial Eyebrow */}
                <div className={`eyebrow text-xs font-normal tracking-[0.4em] uppercase mb-8 transition-colors duration-500 ${
                  index === 2 ? 'text-white/70' : 'text-gray-500 group-hover:text-white/70'
                }`}>
                  Step {step.number}
                </div>

                {/* Main Title - Editorial Style */}
                <h2 className={`font-serif text-[clamp(3rem,6vw,4rem)] font-extralight uppercase tracking-[0.3em] leading-[0.9] mb-6 transition-colors duration-500 ${
                  index === 2 ? 'text-white' : 'text-black group-hover:text-white'
                }`}>
                  {step.title}
                </h2>

                {/* Subtitle */}
                <div className={`text-sm tracking-[0.2em] uppercase mb-8 transition-colors duration-500 font-light ${
                  index === 2 ? 'text-white/80' : 'text-gray-600 group-hover:text-white/80'
                }`}>
                  {step.subtitle}
                </div>

                {/* Description */}
                <p className={`text-sm leading-relaxed mb-12 max-w-xs mx-auto font-light transition-colors duration-500 ${
                  index === 2 ? 'text-white/70' : 'text-gray-600 group-hover:text-white/70'
                }`}>
                  {step.description}
                </p>

                {/* Status Badge - Editorial Style */}
                <div className={`inline-flex items-center gap-2 px-6 py-3 text-xs font-normal uppercase tracking-[0.3em] border transition-all duration-500 ${
                  step.status === 'complete' ? 
                    (index === 2 ? 'border-white text-white' : 'border-black text-black group-hover:border-white group-hover:text-white') :
                  step.status === 'progress' ?
                    (index === 2 ? 'border-white text-white' : 'border-black text-black group-hover:border-white group-hover:text-white') :
                  step.status === 'ready' ?
                    (index === 2 ? 'border-white text-white' : 'border-black text-black group-hover:border-white group-hover:text-white') :
                    'border-gray-400 text-gray-400'
                }`}>
                  {step.status === 'progress' && (
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  )}
                  {step.statusText}
                </div>

                {/* Editorial Hover CTA */}
                {step.status !== 'locked' && (
                  <div className={`mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    index === 2 ? 'text-white/60' : 'text-white/60'
                  }`}>
                    <div className="text-xs tracking-[0.2em] uppercase">
                      Click to {step.action === 'maya' ? 'Open Maya' : 'Continue'}
                    </div>
                  </div>
                )}

                {/* Lock overlay for disabled steps */}
                {step.status === 'locked' && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-white/70 text-center">
                      <div className="text-xs tracking-[0.3em] uppercase mb-2">Locked</div>
                      <div className="text-xs text-white/50">Complete previous steps</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maya now uses dedicated page route */}
    </>
  );
}