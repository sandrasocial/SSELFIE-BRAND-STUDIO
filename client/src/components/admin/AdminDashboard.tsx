import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { SandraImages } from '@/lib/sandra-images';

// New agent images uploaded by user
import AgentElena from '@assets/out-0 (33)_1753426218039.png';
import AgentMaya from '@assets/out-0 (34)_1753426218040.png';
import AgentVictoria from '@assets/out-0 (37)_1753426218041.png';
import AgentAria from '@assets/out-0 (20)_1753426218042.png';
import AgentZara from '@assets/out-0 (28)_1753426218042.png';
import AgentRachel from '@assets/out-0 (42)_1753426218042.png';
import AgentAva from '@assets/out-1 (27)_1753426218043.png';
import AgentQuinn from '@assets/out-0 (26)_1753426218043.png';
import AgentSophia from '@assets/out-1 (18)_1753426218043.png';
import AgentMartha from '@assets/out-0 (29)_1753426218044.png';
import AgentDiana from '@assets/out-2 (18)_1753426218045.png';
import AgentWilma from '@assets/out-0 (22)_1753426218045.png';
import AgentOlga from '@assets/out-0 (32)_1753426290403.png';

// Hero and quick access images
import HeroImage from '@assets/image_1753426780577.png';

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

  // All 13 agent specialties for the consulting cards
  const agentSteps = [
    {
      id: 'elena',
      title: 'Strategic Business Advisor',
      description: 'AI Agent Director & CEO who orchestrates all agents and provides strategic business coordination.',
      image: AgentElena,
      link: '/admin/consulting-agents?agent=elena',
      specialty: 'Business strategy and team coordination',
      status: 'ready'
    },
    {
      id: 'aria',
      title: 'Visual Design Expert',
      description: 'Luxury editorial designer who maintains brand consistency and creates ultra WOW factor moments.',
      image: AgentAria,
      link: '/admin/consulting-agents?agent=aria',
      specialty: 'Luxury design and brand consistency',
      status: 'ready'
    },
    {
      id: 'zara',
      title: 'Technical Architecture',
      description: 'Technical mastermind who transforms vision into flawless code with luxury performance standards.',
      image: AgentZara,
      link: '/admin/consulting-agents?agent=zara',
      specialty: 'Code quality and performance optimization',
      status: 'ready'
    },
    {
      id: 'maya',
      title: 'AI Photography Expert',
      description: 'Celebrity stylist and AI photographer who creates magazine-quality editorial concepts.',
      image: AgentMaya,
      link: '/admin/consulting-agents?agent=maya',
      specialty: 'AI generation systems and UX optimization',
      status: 'ready'
    },
    {
      id: 'victoria',
      title: 'UX Strategy Consultant',
      description: 'Website building expert who optimizes user experience and conversion rates.',
      image: AgentVictoria,
      link: '/admin/consulting-agents?agent=victoria',
      specialty: 'User experience and conversion optimization',
      status: 'ready'
    },
    {
      id: 'rachel',
      title: 'Voice & Copywriting',
      description: 'Sandra\'s copywriting best friend who writes exactly like her authentic voice.',
      image: AgentRachel,
      link: '/admin/consulting-agents?agent=rachel',
      specialty: 'Brand voice and authentic messaging',
      status: 'ready'
    },
    {
      id: 'ava',
      title: 'Automation & Workflow Strategy',
      description: 'Invisible empire architect who makes everything run smoothly with Swiss-watch precision.',
      image: AgentAva,
      link: '/admin/consulting-agents?agent=ava',
      specialty: 'Process automation and efficiency',
      status: 'ready'
    },
    {
      id: 'quinn',
      title: 'Quality Assurance & Luxury Standards',
      description: 'Luxury quality guardian with perfectionist attention to detail for $50,000 luxury suite standards.',
      image: AgentQuinn,
      link: '/admin/consulting-agents?agent=quinn',
      specialty: 'Quality standards and premium positioning',
      status: 'ready'
    },
    {
      id: 'sophia',
      title: 'Social Media Strategy & Community Growth',
      description: 'Elite Social Media Manager AI helping Sandra grow from 81K to 1M followers by 2026.',
      image: AgentSophia,
      link: '/admin/consulting-agents?agent=sophia',
      specialty: 'Social growth and community conversion',
      status: 'ready'
    },
    {
      id: 'martha',
      title: 'Marketing & Performance Ads',
      description: 'Performance marketing expert who runs ads and finds opportunities while maintaining brand authenticity.',
      image: AgentMartha,
      link: '/admin/consulting-agents?agent=martha',
      specialty: 'Marketing optimization and revenue growth',
      status: 'ready'
    },
    {
      id: 'diana',
      title: 'Business Coaching & Strategic Mentoring',
      description: 'Sandra\'s strategic advisor and team director who provides business coaching and decision-making guidance.',
      image: AgentDiana,
      link: '/admin/consulting-agents?agent=diana',
      specialty: 'Business decisions and strategic guidance',
      status: 'ready'
    },
    {
      id: 'wilma',
      title: 'Workflow Architecture & Process Optimization',
      description: 'Workflow architect who designs efficient business processes and creates automation blueprints.',
      image: AgentWilma,
      link: '/admin/consulting-agents?agent=wilma',
      specialty: 'Workflow design and process automation',
      status: 'ready'
    },
    {
      id: 'olga',
      title: 'Repository Organization & Architecture Analysis',
      description: 'Safe repository organization and cleanup specialist who never breaks anything.',
      image: AgentOlga,
      link: '/admin/consulting-agents?agent=olga',
      specialty: 'File architecture and dependency mapping',
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
      image: 'https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev/flatlays/luxury-minimal/luxury-minimal-009.png',
      link: '/admin/consulting-agents'
    },
    {
      id: 'platform-overview',
      title: 'Platform Status',
      subtitle: 'System Health',
      description: 'SSELFIE Studio overview',
      image: 'https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev/flatlays/editorial-magazine/editorial-magazine-033.png',
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
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/images/42585527/tracker_376_img_1_1753351123712.png"
            alt="Admin Command Center"
            className="w-full h-full object-cover object-center"
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
              13 Strategic Consultants
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Your complete AI agent consulting team. Each specialist analyzes SSELFIE Studio codebase 
              and provides exact strategic instructions for Replit AI implementation. Pure advisory, no modifications.
            </p>
          </div>

          {/* Agent Cards Grid - Smaller Cards for 13 Agents */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-20">
            {agentSteps.map((agent, index) => (
              <div key={agent.id} className="group">
                <Link href={agent.link} className="block">
                  {/* Smaller Agent Image */}
                  <div className="relative mb-4 overflow-hidden bg-gray-50" style={{ aspectRatio: '1/1' }}>
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
                    
                    {/* Agent Name Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-lg md:text-xl font-light tracking-[0.3em] uppercase">
                          {agent.id.charAt(0).toUpperCase() + agent.id.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Agent Content - Compact */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-sm font-light leading-tight text-black">
                      {agent.title}
                    </h3>
                    
                    <p className="text-xs text-gray-600 leading-relaxed font-light">
                      {agent.specialty}
                    </p>
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