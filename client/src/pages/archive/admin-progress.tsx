import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Navigation } from '@/components/navigation';

interface BusinessMetric {
  label: string;
  value: string;
  description: string;
  status: 'live' | 'ready' | 'development' | 'planned';
}

interface FeatureItem {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'ready' | 'planned';
  impact: 'critical' | 'high' | 'medium';
  technical: string[];
  business: string;
}

// Business Model & Revenue Streams
const businessModel: BusinessMetric[] = [
  {
    label: "SSELFIE AI",
    value: "€47",
    description: "One-time AI model training + 50 editorial images",
    status: "ready"
  },
  {
    label: "SSELFIE Studio",
    value: "€97/month",
    description: "Complete business builder + brandbook + landing pages",
    status: "development"
  },
  {
    label: "SSELFIE Pro",
    value: "€147/month", 
    description: "Everything + custom domain + priority support",
    status: "development"
  },
  {
    label: "Total Addressable Market",
    value: "120K+",
    description: "Sandra's Instagram followers ready for business tools",
    status: "live"
  }
];

// Current Platform Status
const platformFeatures: FeatureItem[] = [
  {
    title: "✓ PHASE 1 STEP 1: Duplicate Pages Removed",
    description: "Successfully removed model-training.tsx and brandbook-onboarding.tsx duplicate pages, cleaned up App.tsx routes",
    status: "completed",
    impact: "critical",
    technical: ["Removed duplicate FLUX integration", "Cleaned App.tsx imports", "Fixed routing"],
    business: "Streamlined user journey - no more confusing duplicate flows"
  },
  {
    title: "Four Professional Brandbook Templates",
    description: "Executive Essence, Refined Minimalist, Bold Femme, Luxe Feminine - all complete with Sandra AI Designer integration",
    status: "completed",
    impact: "critical",
    technical: ["React components", "Template configs", "AI prompts", "Live switching"],
    business: "Core product offering - professional brandbooks users can't get anywhere else"
  },
  {
    title: "Sandra AI Designer System", 
    description: "Claude 4.0 Sonnet integration with intelligent template suggestions and authentic Sandra voice",
    status: "completed",
    impact: "critical", 
    technical: ["Anthropic API", "Context awareness", "Template suggestions", "Chat history"],
    business: "The magic that makes this feel personal - Sandra's expertise at scale"
  },
  {
    title: "Complete User Authentication & Onboarding",
    description: "6-step onboarding with photo source selection, brand questionnaire, and data persistence",
    status: "completed",
    impact: "critical",
    technical: ["Replit Auth", "PostgreSQL", "Form validation", "Data models"],
    business: "Captures user intent and personalizes the entire experience"
  },
  {
    title: "Individual AI Model Training",
    description: "Each user gets their own trained model with unique trigger words for personalized image generation",
    status: "ready",
    impact: "critical",
    technical: ["FLUX API", "Model training", "Trigger words", "Category generation"],
    business: "The breakthrough that makes this revolutionary - your face, professional quality"
  },
  {
    title: "Dashboard Builder System",
    description: "Personalized workspace with widgets, analytics, and real-time configuration",
    status: "ready", 
    impact: "high",
    technical: ["Widget system", "Real-time preview", "Sandra AI integration"],
    business: "User's private business headquarters - builds stickiness and daily usage"
  },
  {
    title: "Landing Page Builder",
    description: "4 conversion templates (Booking, Service, Product, Portfolio) with real-time editing",
    status: "ready",
    impact: "high", 
    technical: ["Template system", "Mobile/desktop preview", "Integration options"],
    business: "Turns brandbook into live business - immediate revenue generation"
  },
  {
    title: "Custom Domain System",
    description: "Complete white-label experience with DNS verification and SSL automation", 
    status: "planned",
    impact: "high",
    technical: ["Domain verification", "DNS management", "SSL certificates"],
    business: "Professional legitimacy - users own their brand completely"
  },
  {
    title: "Stripe Payment Integration",
    description: "Subscription management, payment processing, and revenue tracking",
    status: "ready",
    impact: "critical",
    technical: ["Stripe API", "Subscription models", "Webhook handling"],
    business: "Revenue engine - turns platform usage into predictable income"
  }
];

export default function AdminProgress() {
  const { user } = useAuth();
  
  // Check if user is admin (Sandra)
  if (user?.email !== 'ssa@ssasocial.com') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Access Denied
          </div>
          <div className="text-gray-600">This page is restricted to administrators.</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200 text-green-800';
      case 'ready': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'in-progress': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'development': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'planned': return 'bg-gray-50 border-gray-200 text-gray-600';
      case 'live': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'ready': return '→';
      case 'in-progress': return '◐';
      case 'development': return '◐';
      case 'planned': return '○';
      case 'live': return '●';
      default: return '○';
    }
  };

  const completedCount = platformFeatures.filter(f => f.status === 'completed').length;
  const readyCount = platformFeatures.filter(f => f.status === 'ready').length;
  const plannedCount = platformFeatures.filter(f => f.status === 'planned').length;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-[#0a0a0a] text-white py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-6xl md:text-8xl font-thin mb-4 tracking-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
            BUSINESS
          </div>
          <div className="text-6xl md:text-8xl font-thin mb-8 tracking-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
            OVERVIEW
          </div>
          <div className="text-xl tracking-[0.3em] uppercase opacity-80 mb-8">
            Platform Status • Business Model • Next Actions
          </div>
          <div className="w-32 h-0.5 bg-white bg-opacity-60"></div>
        </div>
      </div>

      {/* Business Model Section */}
      <div className="py-20 px-8 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-thin mb-12 tracking-wide text-center" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
            Revenue Model
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessModel.map((metric, index) => (
              <div key={index} className="bg-white p-8 border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors duration-300">
                <div className={`inline-flex px-3 py-1 text-xs font-medium border mb-4 ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)} {metric.status.toUpperCase()}
                </div>
                <div className="text-2xl font-thin mb-2" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                  {metric.value}
                </div>
                <div className="text-sm font-medium mb-2 tracking-wide uppercase">
                  {metric.label}
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Status */}
      <div className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors duration-300">
              <div className="text-4xl font-thin mb-2" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                {completedCount}
              </div>
              <div className="text-sm tracking-wide uppercase text-gray-600">
                Features Complete
              </div>
            </div>
            <div className="text-center p-8 border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors duration-300">
              <div className="text-4xl font-thin mb-2" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                {readyCount}
              </div>
              <div className="text-sm tracking-wide uppercase text-gray-600">
                Ready to Deploy
              </div>
            </div>
            <div className="text-center p-8 border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors duration-300">
              <div className="text-4xl font-thin mb-2" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                85%
              </div>
              <div className="text-sm tracking-wide uppercase text-gray-600">
                Platform Complete
              </div>
            </div>
          </div>

          {/* Feature Details */}
          <h2 className="text-3xl font-thin mb-12 tracking-wide" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
            Platform Features
          </h2>
          <div className="space-y-6">
            {platformFeatures.map((feature, index) => (
              <div key={index} className={`border p-8 transition-all duration-300 hover:shadow-lg ${getStatusColor(feature.status)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 flex items-center justify-center text-lg font-medium">
                      {getStatusIcon(feature.status)}
                    </div>
                    <div>
                      <h3 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {feature.title}
                      </h3>
                      <div className={`inline-flex px-2 py-1 text-xs font-medium border mt-1 ${
                        feature.impact === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
                        feature.impact === 'high' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                        'bg-gray-50 border-gray-200 text-gray-600'
                      }`}>
                        {feature.impact.toUpperCase()} IMPACT
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 text-xs font-medium border ${getStatusColor(feature.status)}`}>
                    {feature.status.replace('-', ' ').toUpperCase()}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-medium tracking-wide uppercase text-gray-500 mb-2">
                      Technical Implementation
                    </div>
                    <ul className="space-y-1">
                      {feature.technical.map((tech, techIndex) => (
                        <li key={techIndex} className="text-xs text-gray-600 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{tech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium tracking-wide uppercase text-gray-500 mb-2">
                      Business Impact
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {feature.business}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Next Actions */}
          <div className="mt-16 bg-[#f5f5f5] p-12">
            <h3 className="text-2xl font-light mb-8 text-center" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
              Immediate Next Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-thin mb-4" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                  01
                </div>
                <div className="text-sm font-medium tracking-wide uppercase mb-2">
                  Deploy AI Integration
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  Connect individual user model training with brandbook templates for complete personalization
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-thin mb-4" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                  02
                </div>
                <div className="text-sm font-medium tracking-wide uppercase mb-2">
                  Launch Dashboard Builder
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  Implement personalized workspace interface with widgets and real-time configuration
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-thin mb-4" style={{ fontFamily: 'Times New Roman, serif', color: '#0a0a0a' }}>
                  03
                </div>
                <div className="text-sm font-medium tracking-wide uppercase mb-2">
                  Test Full User Journey
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  End-to-end testing from signup to business launch with revenue tracking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}