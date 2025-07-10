import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Navigation } from '@/components/navigation';
import { PaymentVerification } from '@/components/payment-verification';

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

  const { data: onboardingData } = useQuery({
    queryKey: ['/api/onboarding'],
    enabled: isAuthenticated
  });

  const { data: brandbook } = useQuery({
    queryKey: ['/api/brandbook'],
    enabled: isAuthenticated
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated
  });

  // Business progress calculation
  const getBusinessProgress = () => {
    const steps = [
      {
        id: 'ai-model',
        label: 'AI Model Trained',
        status: userModel?.status === 'completed' ? 'complete' : userModel?.status === 'training' ? 'progress' : 'pending',
        detail: aiImages.length > 0 ? `${aiImages.length} images ready` : 'Ready to train',
        link: '/ai-generator'
      },
      {
        id: 'styleguide',
        label: 'Styleguide Created',
        status: brandbook ? 'complete' : onboardingData?.completed ? 'progress' : 'pending',
        detail: brandbook?.templateId ? brandbook.templateId.replace('-', ' ') : 'Choose your style',
        link: '/styleguide-demo'
      },
      {
        id: 'landing-page',
        label: 'Landing Page',
        status: 'progress',
        detail: 'In Progress',
        link: '/styleguide-landing-builder'
      },
      {
        id: 'payment-setup',
        label: 'Payment Setup',
        status: 'pending',
        detail: 'Coming Next',
        link: '/workspace'
      },
      {
        id: 'domain',
        label: 'Custom Domain',
        status: 'pending',
        detail: 'Coming Next',
        link: '/workspace'
      }
    ];
    
    return steps;
  };

  const getUsageStats = () => {
    const monthlyLimit = subscription?.plan === 'sselfie-studio' ? 300 : 100;
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
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be signed in to access your STUDIO.
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

  const businessProgress = getBusinessProgress();
  const usageStats = getUsageStats();

  return (
    <PaymentVerification>
      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Hero Section */}
        <div className="relative bg-white border-b border-[#f0f0f0]">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
              <h1 
                className="text-6xl font-light mb-4 tracking-[-0.02em] uppercase"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                STUDIO
              </h1>
              <p className="text-lg font-light text-[#666666] mb-8">
                Your Business Command Center
              </p>
              <button className="bg-[#0a0a0a] text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors">
                LAUNCH LIVE BUSINESS
              </button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-[#f8f8f8] border-b border-[#f0f0f0]">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <h2 
              className="text-2xl font-light mb-8 tracking-[-0.01em]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Business Progress Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {businessProgress.map((step, index) => (
                <Link key={step.id} href={step.link}>
                  <div className="bg-white border border-[#e5e5e5] p-6 hover:border-[#ccc] transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-wider text-[#666666] font-light">
                        Step {index + 1}
                      </span>
                      <span className="text-lg">
                        {step.status === 'complete' ? '✓' : step.status === 'progress' ? '→' : '•'}
                      </span>
                    </div>
                    <h3 
                      className="text-lg font-light mb-2 tracking-[-0.01em]"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {step.label}
                    </h3>
                    <p className="text-sm text-[#666666] font-light">
                      {step.detail}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 
            className="text-2xl font-light mb-12 tracking-[-0.01em]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Quick Access Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* AI Photoshoot */}
            <Link href="/ai-generator">
              <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors cursor-pointer group">
                <h3 
                  className="text-xl font-light mb-3 tracking-[-0.01em] group-hover:text-[#0a0a0a]"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  AI PHOTOSHOOT
                </h3>
                <p className="text-sm text-[#666666] font-light mb-4">
                  Generate new editorial images
                </p>
                <p className="text-xs text-[#666666] font-light">
                  ({usageStats.used}/{usageStats.total} used)
                </p>
              </div>
            </Link>

            {/* Styleguide */}
            <Link href="/styleguide-demo">
              <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors cursor-pointer group">
                <h3 
                  className="text-xl font-light mb-3 tracking-[-0.01em] group-hover:text-[#0a0a0a]"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  STYLEGUIDE
                </h3>
                <p className="text-sm text-[#666666] font-light mb-4">
                  View/edit your brand bible
                </p>
                <p className="text-xs text-[#666666] font-light">
                  ({brandbook?.templateId || 'Not created'})
                </p>
              </div>
            </Link>

            {/* Landing Pages */}
            <Link href="/styleguide-landing-builder">
              <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors cursor-pointer group">
                <h3 
                  className="text-xl font-light mb-3 tracking-[-0.01em] group-hover:text-[#0a0a0a]"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  LANDING PAGES
                </h3>
                <p className="text-sm text-[#666666] font-light mb-4">
                  Build sales pages
                </p>
                <p className="text-xs text-[#666666] font-light">
                  (2 drafts)
                </p>
              </div>
            </Link>

            {/* Sandra AI */}
            <Link href="/sandra-chat">
              <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors cursor-pointer group">
                <h3 
                  className="text-xl font-light mb-3 tracking-[-0.01em] group-hover:text-[#0a0a0a]"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  SANDRA AI
                </h3>
                <p className="text-sm text-[#666666] font-light mb-4">
                  Chat with your AI assistant
                </p>
                <p className="text-xs text-[#666666] font-light">
                  (Always ready)
                </p>
              </div>
            </Link>

            {/* Image Gallery */}
            <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors cursor-pointer group">
              <h3 
                className="text-xl font-light mb-3 tracking-[-0.01em] group-hover:text-[#0a0a0a]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                IMAGE GALLERY
              </h3>
              <p className="text-sm text-[#666666] font-light mb-4">
                Manage saved photos & assets
              </p>
              <p className="text-xs text-[#666666] font-light">
                ({aiImages.length} images)
              </p>
            </div>

            {/* Business Setup */}
            <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors cursor-pointer group">
              <h3 
                className="text-xl font-light mb-3 tracking-[-0.01em] group-hover:text-[#0a0a0a]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                BUSINESS SETUP
              </h3>
              <p className="text-sm text-[#666666] font-light mb-4">
                Stripe, Calendly integrations
              </p>
              <p className="text-xs text-[#666666] font-light">
                (Setup needed)
              </p>
            </div>

            {/* Live Preview */}
            <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors cursor-pointer group">
              <h3 
                className="text-xl font-light mb-3 tracking-[-0.01em] group-hover:text-[#0a0a0a]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                LIVE PREVIEW
              </h3>
              <p className="text-sm text-[#666666] font-light mb-4">
                See your site before launch
              </p>
              <p className="text-xs text-[#666666] font-light">
                (Available)
              </p>
            </div>

            {/* Settings */}
            <div className="bg-white border border-[#e5e5e5] p-8 hover:border-[#0a0a0a] transition-colors cursor-pointer group">
              <h3 
                className="text-xl font-light mb-3 tracking-[-0.01em] group-hover:text-[#0a0a0a]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                SETTINGS
              </h3>
              <p className="text-sm text-[#666666] font-light mb-4">
                Domains, billing preferences
              </p>
              <p className="text-xs text-[#666666] font-light">
                (Manage)
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="bg-[#f8f8f8] border-t border-[#f0f0f0]">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 
                  className="text-2xl font-light mb-6 tracking-[-0.01em]"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Usage Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-[#e5e5e5] p-6">
                    <div 
                      className="text-3xl font-light mb-2 tracking-[-0.01em]"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {usageStats.used}
                    </div>
                    <div className="text-sm text-[#666666] font-light">
                      Images Generated This Month
                    </div>
                    <div className="text-xs text-[#666666] font-light mt-1">
                      {usageStats.total - usageStats.used} remaining
                    </div>
                  </div>
                  <div className="bg-white border border-[#e5e5e5] p-6">
                    <div 
                      className="text-3xl font-light mb-2 tracking-[-0.01em]"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {businessProgress.filter(s => s.status === 'complete').length}
                    </div>
                    <div className="text-sm text-[#666666] font-light">
                      Steps Completed
                    </div>
                    <div className="text-xs text-[#666666] font-light mt-1">
                      of {businessProgress.length} total
                    </div>
                  </div>
                  <div className="bg-white border border-[#e5e5e5] p-6">
                    <div 
                      className="text-3xl font-light mb-2 tracking-[-0.01em]"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {subscription?.plan === 'sselfie-studio' ? '€97' : '€47'}
                    </div>
                    <div className="text-sm text-[#666666] font-light">
                      Current Plan
                    </div>
                    <div className="text-xs text-[#666666] font-light mt-1">
                      SSELFIE Studio
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 
                  className="text-lg font-light mb-6 tracking-[-0.01em]"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  What's New
                </h3>
                <div className="space-y-4">
                  {aiImages.length > 0 && (
                    <div className="text-sm font-light text-[#666666]">
                      • New AI images generated (2h)
                    </div>
                  )}
                  {brandbook && (
                    <div className="text-sm font-light text-[#666666]">
                      • Styleguide updated (1d)
                    </div>
                  )}
                  {userModel?.status === 'completed' && (
                    <div className="text-sm font-light text-[#666666]">
                      • AI model training complete (3d)
                    </div>
                  )}
                  <div className="text-sm font-light text-[#666666]">
                    • Welcome to SSELFIE Studio (5d)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PaymentVerification>
  );
}