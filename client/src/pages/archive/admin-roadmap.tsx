import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation } from '@/components/navigation';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  phase: 'immediate' | 'quarter1' | 'quarter2' | 'longterm';
  priority: 'high' | 'medium' | 'low';
  impact: 'game-changer' | 'major' | 'enhancement';
  effort: 'low' | 'medium' | 'high';
  category: 'content' | 'automation' | 'ai' | 'business' | 'integration';
}

const roadmapData: RoadmapItem[] = [
  // IMMEDIATE POST-LAUNCH (0-3 months)
  {
    id: 'digital-product-builder',
    title: 'Digital Product Builder',
    description: 'PDF guide builder with Sandra\'s design templates - lead magnets, service guides, pricing sheets',
    phase: 'immediate',
    priority: 'high',
    impact: 'game-changer',
    effort: 'medium',
    category: 'content'
  },
  {
    id: 'email-automation',
    title: 'Email Automation System',
    description: 'Welcome sequences, nurture campaigns, booking reminders with ConvertKit integration',
    phase: 'immediate',
    priority: 'high',
    impact: 'major',
    effort: 'medium',
    category: 'automation'
  },
  {
    id: 'brand-kit-generator',
    title: 'AI Brand Kit Generator',
    description: 'Logo variations, color palettes, social media templates using their AI SSELFIES',
    phase: 'immediate',
    priority: 'medium',
    impact: 'major',
    effort: 'medium',
    category: 'content'
  },

  // QUARTER 1 (3-6 months)
  {
    id: 'ai-caption-writer',
    title: 'AI Caption Writer',
    description: 'Instagram captions using their authentic brand voice and AI SSELFIES',
    phase: 'quarter1',
    priority: 'high',
    impact: 'major',
    effort: 'low',
    category: 'ai'
  },
  {
    id: 'social-media-scheduler',
    title: 'Social Media Scheduler',
    description: 'Auto-post AI SSELFIES with branded captions across platforms',
    phase: 'quarter1',
    priority: 'medium',
    impact: 'major',
    effort: 'high',
    category: 'automation'
  },
  {
    id: 'client-management',
    title: 'Simple CRM System',
    description: 'Client management for bookings, follow-ups, and relationship tracking',
    phase: 'quarter1',
    priority: 'medium',
    impact: 'major',
    effort: 'high',
    category: 'business'
  },
  {
    id: 'analytics-dashboard',
    title: 'Business Analytics Dashboard',
    description: 'Track page views, conversions, booking rates, revenue metrics',
    phase: 'quarter1',
    priority: 'medium',
    impact: 'major',
    effort: 'medium',
    category: 'business'
  },

  // QUARTER 2 (6-12 months)
  {
    id: 'ai-blog-writer',
    title: 'AI Blog Post Generator',
    description: 'SEO-optimized content about their expertise with automatic publishing',
    phase: 'quarter2',
    priority: 'medium',
    impact: 'major',
    effort: 'medium',
    category: 'ai'
  },
  {
    id: 'video-script-creator',
    title: 'Video Script Creator',
    description: 'AI-generated scripts for social media videos and marketing content',
    phase: 'quarter2',
    priority: 'low',
    impact: 'enhancement',
    effort: 'low',
    category: 'ai'
  },
  {
    id: 'canva-integration',
    title: 'Canva API Integration',
    description: 'Direct integration for creating social media templates and marketing materials',
    phase: 'quarter2',
    priority: 'medium',
    impact: 'major',
    effort: 'medium',
    category: 'integration'
  },
  {
    id: 'zapier-integration',
    title: 'Zapier Integration',
    description: 'Connect to hundreds of tools for complete business automation',
    phase: 'quarter2',
    priority: 'low',
    impact: 'major',
    effort: 'high',
    category: 'integration'
  },

  // LONG-TERM VISION (12+ months)
  {
    id: 'white-label-platform',
    title: 'White-Label Platform',
    description: 'License SSELFIE technology to agencies and business coaches',
    phase: 'longterm',
    priority: 'low',
    impact: 'game-changer',
    effort: 'high',
    category: 'business'
  },
  {
    id: 'marketplace',
    title: 'Template Marketplace',
    description: 'User-generated templates and designs for different industries',
    phase: 'longterm',
    priority: 'low',
    impact: 'major',
    effort: 'high',
    category: 'business'
  },
  {
    id: 'ai-voice-clone',
    title: 'AI Voice Cloning',
    description: 'Clone user\'s voice for automated video content and courses',
    phase: 'longterm',
    priority: 'low',
    impact: 'game-changer',
    effort: 'high',
    category: 'ai'
  },
  {
    id: 'mobile-app',
    title: 'Native Mobile App',
    description: 'iOS and Android apps for on-the-go business management',
    phase: 'longterm',
    priority: 'medium',
    impact: 'major',
    effort: 'high',
    category: 'business'
  }
];

export default function AdminRoadmap() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  // Admin access check
  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Access Restricted
          </h1>
          <p className="text-gray-600">Admin access required.</p>
        </div>
      </div>
    );
  }

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'immediate': return 'IMMEDIATE';
      case 'quarter1': return 'Q1';
      case 'quarter2': return 'Q2';
      case 'longterm': return 'LONG-TERM';
      default: return phase.toUpperCase();
    }
  };

  const filteredItems = selectedPhase === 'all' 
    ? roadmapData 
    : roadmapData.filter(item => item.phase === selectedPhase);

  const phaseStats = {
    immediate: roadmapData.filter(item => item.phase === 'immediate').length,
    quarter1: roadmapData.filter(item => item.phase === 'quarter1').length,
    quarter2: roadmapData.filter(item => item.phase === 'quarter2').length,
    longterm: roadmapData.filter(item => item.phase === 'longterm').length,
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <HeroFullBleed
        backgroundImage={SandraImages.editorial.thinking}
        title={
          <div className="space-y-2">
            <div className="text-4xl md:text-6xl font-light tracking-ultra-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
              SSELFIE
            </div>
            <div className="text-4xl md:text-6xl font-light tracking-ultra-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
              STUDIO
            </div>
          </div>
        }
        tagline="POST-LAUNCH ROADMAP"
        subtitle="Revolutionary features to build after launch"
        overlay={0.4}
        alignment="left"
      />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="border border-gray-200 bg-white p-8">
            <div className="text-3xl font-light" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
              {phaseStats.immediate}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mt-2">
              IMMEDIATE (0-3 MONTHS)
            </div>
          </div>
          <div className="border border-gray-200 bg-white p-8">
            <div className="text-3xl font-light" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
              {phaseStats.quarter1}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mt-2">
              QUARTER 1 (3-6 MONTHS)
            </div>
          </div>
          <div className="border border-gray-200 bg-white p-8">
            <div className="text-3xl font-light" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
              {phaseStats.quarter2}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mt-2">
              QUARTER 2 (6-12 MONTHS)
            </div>
          </div>
          <div className="border border-gray-200 bg-white p-8">
            <div className="text-3xl font-light" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
              {phaseStats.longterm}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mt-2">
              LONG-TERM (12+ MONTHS)
            </div>
          </div>
        </div>

        {/* Phase Filter */}
        <div className="border-b border-gray-200 mb-12">
          <div className="flex gap-8">
            {['all', 'immediate', 'quarter1', 'quarter2', 'longterm'].map((phase) => (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`pb-4 text-xs uppercase tracking-wider border-b-2 transition-colors ${
                  selectedPhase === phase 
                    ? 'border-black text-black' 
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                {phase === 'all' ? 'ALL FEATURES' :
                 phase === 'immediate' ? 'IMMEDIATE' :
                 phase === 'quarter1' ? 'QUARTER 1' :
                 phase === 'quarter2' ? 'QUARTER 2' : 'LONG-TERM'}
              </button>
            ))}
          </div>
        </div>

        {/* Roadmap Items */}
        <div className="space-y-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="border border-gray-200 bg-white">
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-light mb-3" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="ml-8">
                    <div className="text-xs uppercase tracking-wider text-gray-500 border border-gray-200 px-3 py-1">
                      {getPhaseText(item.phase)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 text-xs uppercase tracking-wider text-gray-500">
                  <span>PRIORITY: {item.priority.toUpperCase()}</span>
                  <span>IMPACT: {item.impact === 'game-changer' ? 'GAME CHANGER' : item.impact.toUpperCase()}</span>
                  <span>EFFORT: {item.effort.toUpperCase()}</span>
                  <span>CATEGORY: {item.category.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Strategic Notes */}
        <div className="mt-16 border border-gray-200 bg-gray-50">
          <div className="p-8">
            <h2 className="text-2xl font-light mb-8" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
              Strategic Implementation Notes
            </h2>
            <div className="space-y-8">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">LAUNCH FIRST STRATEGY</div>
                <p className="text-gray-700 leading-relaxed">
                  The current platform (AI SSELFIE + Landing Page Builder) is already revolutionary. 
                  Focus on perfecting the core experience and gathering user feedback before adding new features.
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">PRIORITY FOCUS</div>
                <p className="text-gray-700 leading-relaxed">
                  Digital Product Builder and Email Automation are the highest impact additions that complete 
                  the business-in-one-place vision while keeping users engaged long-term.
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">USER-DRIVEN DEVELOPMENT</div>
                <p className="text-gray-700 leading-relaxed">
                  All roadmap items should be validated with real user feedback and usage data. 
                  Prioritize features that solve actual user problems over theoretical nice-to-haves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}