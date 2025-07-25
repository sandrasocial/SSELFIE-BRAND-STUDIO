import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { SandraImages } from '@/lib/sandra-images';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Check if user is Sandra (admin access required)
  if (!user || (user.email !== 'ssa@ssasocial.com' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Admin Access Required
          </h1>
          <p className="text-gray-400">Only Sandra can access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  // Agent specialties for the step cards
  const agentSteps = [
    {
      id: 'elena',
      title: 'Strategic Business Advisor',
      description: 'AI Agent Director & CEO who orchestrates all agents and provides strategic business coordination.',
      image: SandraImages.hero.homepage,
      link: '/admin/consulting-agents',
      specialty: 'Business strategy and team coordination',
      status: 'ready'
    },
    {
      id: 'aria',
      title: 'Visual Design Expert',
      description: 'Luxury editorial designer who maintains brand consistency and creates ultra WOW factor moments.',
      image: SandraImages.editorial.aiSuccess,
      link: '/admin/consulting-agents',
      specialty: 'Luxury design and brand consistency',
      status: 'ready'
    },
    {
      id: 'zara',
      title: 'Technical Architecture',
      description: 'Technical mastermind who transforms vision into flawless code with luxury performance standards.',
      image: SandraImages.journey.success,
      link: '/admin/consulting-agents',
      specialty: 'Code quality and performance optimization',
      status: 'ready'
    },
    {
      id: 'maya',
      title: 'AI Photography Expert',
      description: 'Celebrity stylist and AI photographer who creates magazine-quality editorial concepts.',
      image: SandraImages.editorial.aiSuccess,
      link: '/admin/consulting-agents',
      specialty: 'AI generation systems and UX optimization',
      status: 'ready'
    },
    {
      id: 'victoria',
      title: 'UX Strategy Consultant',
      description: 'Website building expert who optimizes user experience and conversion rates.',
      image: SandraImages.hero.pricing,
      link: '/admin/consulting-agents',
      specialty: 'User experience and conversion optimization',
      status: 'ready'
    },
    {
      id: 'rachel',
      title: 'Voice & Copywriting',
      description: 'Sandra\'s copywriting best friend who writes exactly like her authentic voice.',
      image: SandraImages.editorial.vulnerability,
      link: '/admin/consulting-agents',
      specialty: 'Brand voice and authentic messaging',
      status: 'ready'
    }
  ];

  // Quick access tools similar to workspace creative tools
  const quickAccessTools = [
    {
      id: 'visual-editor',
      title: 'Visual Editor',
      subtitle: 'Agent Coordination',
      description: 'Full agent development workspace',
      image: SandraImages.flatlays.luxury,
      link: '/admin/visual-editor'
    },
    {
      id: 'consulting-agents',
      title: 'Consulting Agents',
      subtitle: 'Strategic Analysis',
      description: 'Read-only codebase advisors',
      image: SandraImages.flatlays.minimal,
      link: '/admin/consulting-agents'
    },
    {
      id: 'platform-overview',
      title: 'Platform Status',
      subtitle: 'System Health',
      description: 'SSELFIE Studio overview',
      image: SandraImages.flatlays.editorial,
      link: '/workspace'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Editorial Hero Section - Same as Workspace */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src={SandraImages.hero.homepage}
            alt="Admin Command Center"
            className="w-full h-full object-cover object-center-top"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-8 flex flex-col justify-end min-h-screen pb-20">
          <div className="text-xs tracking-[0.4em] uppercase opacity-70 mb-8">
            Sandra's Command Center
          </div>
          
          <h1 className="font-serif text-[clamp(4rem,10vw,10rem)] leading-[0.8] font-light uppercase tracking-wide mb-8">
            Admin Studio
          </h1>
          
          <p className="text-lg max-w-2xl mx-auto opacity-80 font-light leading-relaxed">
            Your AI agent coordination center. Direct your 13 specialized agents, analyze platform performance, 
            and coordinate strategic improvements to SSELFIE Studio.
          </p>
        </div>
      </section>

      {/* Main Content - Editorial Lookbook Style */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          
          {/* Agent Team Overview */}
          <div className="text-center mb-20">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
              Your AI Agent Team
            </div>
            <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-light uppercase tracking-wide leading-tight mb-8">
              Strategic Consultants
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Each agent specializes in analyzing SSELFIE Studio and providing exact instructions 
              for Replit AI implementation. Pure strategic advice, no file modifications.
            </p>
          </div>

          {/* Agent Cards Grid - Same Style as Workspace Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {agentSteps.map((agent, index) => (
              <div key={agent.id} className="group">
                <Link href={agent.link} className="block">
                  {/* Large Editorial Image */}
                  <div className="relative mb-8 overflow-hidden bg-gray-50" style={{ aspectRatio: '4/5' }}>
                    <img 
                      src={agent.image}
                      alt={agent.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    
                    {/* Soft Dark Overlay */}
                    <div className="absolute inset-0 bg-black/30"></div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-black/80 text-white px-2 py-1 text-xs font-light">
                        Ready for Analysis
                      </div>
                    </div>
                    
                    {/* Elegant Title Overlay - Same style as workspace STEP overlays */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-3xl md:text-4xl font-light tracking-[0.4em] uppercase">
                          {index === 0 ? 'S T R A T E G Y' : 
                           index === 1 ? 'D E S I G N' : 
                           index === 2 ? 'T E C H' :
                           index === 3 ? 'A I  P H O T O' :
                           index === 4 ? 'U X  F L O W' : 'V O I C E'}
                        </div>
                        <div className="text-xs tracking-[0.2em] uppercase opacity-80 mt-2">
                          {agent.id.charAt(0).toUpperCase() + agent.id.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Agent Content */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-xl font-light leading-tight text-black">
                      {agent.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed font-light">
                      {agent.description}
                    </p>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">
                        Specialty
                      </div>
                      <p className="text-sm text-black font-light">
                        {agent.specialty}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Quick Access Tools - Same Style as Workspace Creative Tools */}
          <div className="mb-32">
            <div className="text-center mb-12">
              <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
                Quick Access
              </div>
              <h3 className="font-serif text-2xl font-light tracking-wide">
                Admin Tools
              </h3>
            </div>

            {/* Compact Elegant Widgets - Same as workspace */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickAccessTools.map((tool) => (
                <Link key={tool.id} href={tool.link} className="group">
                  <div className="relative overflow-hidden bg-black" style={{ aspectRatio: '21/9' }}>
                    <img 
                      src={tool.image}
                      alt={tool.title}
                      className="w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:opacity-80 group-hover:scale-105"
                    />
                    
                    {/* Elegant Text Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-xl md:text-2xl font-light tracking-[0.3em] uppercase">
                          {tool.title.replace(/\s/g, ' ')}
                        </div>
                        <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                          {tool.subtitle}
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtle Hover Effect */}
                    <div className="absolute inset-0 border border-white opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Admin Actions Footer */}
          <div className="text-center">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
              Platform Navigation
            </div>
            <div className="flex justify-center gap-8">
              <Link 
                href="/workspace"
                className="text-sm tracking-[0.2em] uppercase border-b border-transparent hover:border-black transition-colors duration-300"
              >
                Back to Studio
              </Link>
              <Link 
                href="/"
                className="text-sm tracking-[0.2em] uppercase border-b border-transparent hover:border-black transition-colors duration-300"
              >
                Homepage
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}