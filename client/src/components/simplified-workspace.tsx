import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { SandraImages } from '../lib/sandra-images';

// Luxury Maya Interface Component
import { MayaInterface } from './maya-interface';

export function SimplifiedWorkspace() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeMaya, setActiveMaya] = useState(false);
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
      setActiveMaya(true);
      setActiveStep(step.id);
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
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
            <div className="font-serif text-xl font-normal tracking-tight">
              SSELFIE Studio
            </div>
            <div className="flex items-center gap-8">
              <Link href="/profile" className="text-xs uppercase tracking-wide text-gray-600 hover:text-black transition-colors">
                Profile
              </Link>
              <a 
                href="/api/logout"
                className="text-xs uppercase tracking-wide text-gray-600 hover:text-black transition-colors"
              >
                Sign Out
              </a>
            </div>
          </div>
        </nav>

        {/* Workspace Header */}
        <div className="pt-20 pb-16 text-center bg-gray-50">
          <div className="max-width-6xl mx-auto px-8">
            <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6">
              Welcome Back
            </div>
            <h1 className="font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.9] font-extralight uppercase tracking-[0.1em] text-black mb-6">
              Your Studio
            </h1>
            <p className="text-lg text-gray-600 max-width-2xl mx-auto font-light leading-relaxed">
              Create professional photos that make people wonder where you got them done.
            </p>
          </div>
        </div>

        {/* Three Step Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`relative flex items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden ${
                step.status === 'locked' ? 'cursor-not-allowed' : 'hover:scale-[1.02]'
              } ${
                index === 0 ? 'bg-white' : 
                index === 1 ? 'bg-gray-50' : 
                'bg-black text-white'
              }`}
              onClick={() => handleStepClick(step)}
            >
              {/* Background Image */}
              <div className="absolute inset-0 opacity-10 transition-opacity duration-500 hover:opacity-20">
                <img 
                  src={step.bgImage} 
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 text-center px-8 max-w-md">
                {/* Large Step Number */}
                <div className={`font-serif text-[120px] leading-none font-extralight opacity-20 mb-6 ${
                  index === 2 ? 'text-white' : 'text-black'
                }`}>
                  {step.number}
                </div>

                {/* Step Title */}
                <h2 className={`font-serif text-4xl font-light uppercase tracking-[0.05em] mb-4 ${
                  index === 2 ? 'text-white' : 'text-black'
                }`}>
                  {step.title}
                </h2>

                {/* Subtitle */}
                <div className={`text-sm tracking-[0.2em] uppercase mb-6 ${
                  index === 2 ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {step.subtitle}
                </div>

                {/* Description */}
                <p className={`text-sm leading-relaxed mb-8 ${
                  index === 2 ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>

                {/* Status */}
                <div className={`text-xs font-medium uppercase tracking-[0.3em] ${
                  step.status === 'complete' ? 
                    (index === 2 ? 'text-white' : 'text-black') :
                  step.status === 'progress' ?
                    (index === 2 ? 'text-white' : 'text-black') :
                  step.status === 'ready' ?
                    (index === 2 ? 'text-white' : 'text-black') :
                    'text-gray-400'
                }`}>
                  {step.status === 'progress' && (
                    <div className="inline-block w-2 h-2 bg-current rounded-full animate-pulse mr-2"></div>
                  )}
                  {step.statusText}
                </div>

                {/* Lock overlay for disabled steps */}
                {step.status === 'locked' && (
                  <div className="absolute inset-0 bg-black/20"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maya Interface Overlay */}
      {activeMaya && (
        <MayaInterface 
          onClose={() => {
            setActiveMaya(false);
            setActiveStep(null);
          }}
        />
      )}
    </>
  );
}