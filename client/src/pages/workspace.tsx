import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
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

  const { data: usage } = useQuery({
    queryKey: ['/api/usage/status'],
    enabled: isAuthenticated
  });

  // Check if user has premium access
  const isPremiumUser = subscription?.plan === 'sselfie-studio' || user?.plan === 'admin';

  // Simplified User Journey - 3 clear steps
  const getJourneySteps = () => {
    // Step 1: Upload Photos
    const step1Complete = userModel?.trainingStatus === 'completed';
    const step1InProgress = userModel?.trainingStatus === 'training';
    
    // Step 2: Take Photos  
    const step2Ready = step1Complete;
    const step2HasPhotos = aiImages.length > 0;
    
    // Step 3: Build Brand
    const step3Ready = step2HasPhotos;
    
    return [
      {
        id: 'upload',
        title: 'Upload Your Selfies',
        description: 'Just grab a few selfies from your phone and upload them. Takes about 2 minutes.',
        timeEstimate: '2 minutes',
        status: step1Complete ? 'complete' : step1InProgress ? 'progress' : 'start',
        statusMessage: step1Complete ? 'Done! Ready for photos' : 
                      step1InProgress ? 'Getting your photos ready...' : 
                      'Start here first',
        link: '/ai-training',
        image: SandraImages.editorial.laptop1,
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
        image: SandraImages.editorial.phone1,
        nextStep: step2HasPhotos ? null : step2Ready ? 'Chat with Maya to create photos' : null
      },
      {
        id: 'aiphotoshoot', 
        title: 'AI Photoshoot',
        description: 'Create professional photos instantly with your trained AI model.',
        timeEstimate: '5 minutes',
        status: step3Ready ? 'ready' : 'locked',
        statusMessage: step3Ready ? 'Ready to shoot' : 'Take photos first',
        link: step3Ready ? '/gallery' : '#',
        image: SandraImages.flatlays.planning,
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl mb-6 text-black font-light uppercase tracking-wide">
            Hey There
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            You'll need to sign in to see your studio space.
          </p>
          <a
            href="/api/login"
            className="inline-block px-8 py-4 text-xs uppercase tracking-wide border border-black hover:bg-black hover:text-white transition-all duration-300"
          >
            Sign In
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
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
                    
                    {/* Status Badge */}
                    <div className="absolute top-6 left-6">
                      <div className={`px-3 py-1 text-xs tracking-[0.2em] uppercase font-light ${
                        step.status === 'complete' ? 'bg-black text-white' :
                        step.status === 'progress' ? 'bg-gray-800 text-white' :
                        step.status === 'ready' ? 'bg-white text-black border border-black' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {step.statusMessage}
                      </div>
                    </div>
                    
                    {/* Time Estimate */}
                    <div className="absolute top-6 right-6">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs tracking-[0.2em] uppercase text-black">
                        {step.timeEstimate}
                      </div>
                    </div>
                    
                    {/* Overlay for locked state */}
                    {step.status === 'locked' && (
                      <div className="absolute inset-0 bg-black/50"></div>
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="space-y-4">
                    <div className="text-xs tracking-[0.4em] uppercase text-gray-500">
                      Step {index + 1}
                    </div>
                    
                    <h3 className="font-serif text-2xl font-light tracking-wide leading-tight">
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
                  </div>
                </Link>
              </div>
            ))}
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

          {/* Vogue-Style Access Widgets */}
          <div className="py-32">
            <div className="text-center mb-16">
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
                Quick Access
              </div>
              <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-light uppercase tracking-wide leading-tight">
                Your Creative Studio
              </h2>
            </div>

            {/* Sophisticated Image Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              
              {/* Gallery Widget */}
              <Link href="/gallery" className="group">
                <div className="relative overflow-hidden bg-black" style={{ aspectRatio: '4/5' }}>
                  <img 
                    src={SandraImages.editorial.professional}
                    alt="Gallery"
                    className="w-full h-full object-cover opacity-60 transition-all duration-1000 group-hover:opacity-80 group-hover:scale-105"
                  />
                  
                  {/* Elegant Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="font-serif text-[clamp(1.5rem,4vw,3rem)] font-light tracking-[0.5em] uppercase">
                        G A L L E R Y
                      </div>
                      <div className="text-xs tracking-[0.3em] uppercase opacity-80 mt-4">
                        Your AI Photos
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-white opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                </div>
              </Link>

              {/* Library Widget */}
              <Link href="/flatlays" className="group">
                <div className="relative overflow-hidden bg-black" style={{ aspectRatio: '4/5' }}>
                  <img 
                    src={SandraImages.flatlays.luxury}
                    alt="Library"
                    className="w-full h-full object-cover opacity-60 transition-all duration-1000 group-hover:opacity-80 group-hover:scale-105"
                  />
                  
                  {/* Elegant Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="font-serif text-[clamp(1.5rem,4vw,3rem)] font-light tracking-[0.5em] uppercase">
                        L I B R A R Y
                      </div>
                      <div className="text-xs tracking-[0.3em] uppercase opacity-80 mt-4">
                        Image Collections
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-white opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                </div>
              </Link>

              {/* Victoria Widget - Locked */}
              <div className="group">
                <div className="relative overflow-hidden bg-black opacity-50" style={{ aspectRatio: '4/5' }}>
                  <img 
                    src={SandraImages.editorial.lifestyle}
                    alt="Victoria"
                    className="w-full h-full object-cover opacity-40"
                  />
                  
                  {/* Elegant Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="font-serif text-[clamp(1.5rem,4vw,3rem)] font-light tracking-[0.5em] uppercase">
                        V I C T O R I A
                      </div>
                      <div className="text-xs tracking-[0.3em] uppercase opacity-60 mt-4">
                        Coming Soon
                      </div>
                    </div>
                  </div>
                  
                  {/* Lock Overlay */}
                  <div className="absolute inset-0 bg-black/30"></div>
                  
                  {/* Lock Icon in Bottom Corner */}
                  <div className="absolute bottom-6 right-6">
                    <div className="w-6 h-6 border border-white/60 rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 border border-white/60 rounded-full"></div>
                    </div>
                  </div>
                </div>
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