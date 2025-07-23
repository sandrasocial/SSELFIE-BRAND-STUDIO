import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from 'wouter';
import { SandraImages } from '@/lib/sandra-images';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  recentActivity: Array<{
    id: string;
    type: 'user_joined' | 'post_created' | 'like_given';
    description: string;
    timestamp: string;
  }>;
}

const agents = [
  { id: 'elena', name: 'Elena', role: 'Workflow Coordinator', color: 'from-purple-500 to-pink-500' },
  { id: 'aria', name: 'Aria', role: 'Design Director', color: 'from-blue-500 to-indigo-500' },
  { id: 'rachel', name: 'Rachel', role: 'Voice & Copy', color: 'from-green-500 to-emerald-500' },
  { id: 'maya', name: 'Maya', role: 'AI Photography', color: 'from-orange-500 to-red-500' },
  { id: 'ava', name: 'Ava', role: 'Automation', color: 'from-cyan-500 to-blue-500' },
  { id: 'quinn', name: 'Quinn', role: 'Quality Guardian', color: 'from-violet-500 to-purple-500' },
  { id: 'sophia', name: 'Sophia', role: 'Social Media', color: 'from-pink-500 to-rose-500' },
  { id: 'martha', name: 'Martha', role: 'Marketing & Ads', color: 'from-amber-500 to-orange-500' },
  { id: 'diana', name: 'Diana', role: 'Business Coach', color: 'from-emerald-500 to-teal-500' },
  { id: 'wilma', name: 'Wilma', role: 'Workflow Architect', color: 'from-slate-500 to-gray-500' }
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    enabled: !!(user && (user.email === 'ssa@ssasocial.com' || user.role === 'admin')),
  });

  // Check if user is Sandra (admin access required)  
  if (!user || (user.email !== 'ssa@ssasocial.com' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      {/* Admin Navigation - Same Style as PreLoginNavigationUnified */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setLocation("/")}
              className="font-serif text-xl font-light tracking-wide text-white hover:opacity-70 transition-opacity duration-300"
            >
              SSELFIE ADMIN
            </button>
            
            <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
              <button 
                onClick={() => setLocation("/workspace")}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                Workspace
              </button>
              <button 
                onClick={() => setLocation("/visual-editor")}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                Visual Editor
              </button>
              <button 
                onClick={() => setLocation("/analytics")}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                Analytics
              </button>
              <button
                onClick={() => setLocation('/api/logout')}
                className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-Bleed Hero Section - Matching Landing Page Style */}
      <section className="relative min-h-screen flex items-end justify-center bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={SandraImages.hero.ai}
            alt="Sandra's Dashboard"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center text-white px-6 md:px-12 pb-20 md:pb-32">
          <p className="text-[11px] tracking-[0.4em] uppercase mb-8 opacity-70 font-light">
            Command Center
          </p>
          <div className="mb-12">
            <h1 
              className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-light mb-4 tracking-[0.5em] leading-[1]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              SANDRA'S
            </h1>
            <h2 
              className="text-[3rem] md:text-[5rem] lg:text-[6rem] font-light mb-4 tracking-[0.3em] leading-[1]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              DASHBOARD
            </h2>
            <p className="text-[12px] tracking-[0.5em] uppercase text-white/80 font-light">
              Empire Management System
            </p>
          </div>
          
          {/* Empire Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats?.totalUsers || '1,247'}
              </div>
              <div className="text-[11px] tracking-[0.4em] uppercase opacity-70">
                Empire Members
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                €15,132
              </div>
              <div className="text-[11px] tracking-[0.4em] uppercase opacity-70">
                Monthly Revenue
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                120K+
              </div>
              <div className="text-[11px] tracking-[0.4em] uppercase opacity-70">
                Instagram Followers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Chat Cards Section */}
      <section className="py-20 md:py-32 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
              Your AI Team
            </p>
            <h2 
              className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Command Your Agents
            </h2>
            <p className="text-lg text-[#666666] font-light max-w-2xl mx-auto">
              Each agent specializes in transforming your empire. Click to chat directly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="group cursor-pointer" onClick={() => setSelectedAgent(agent.id)}>
                <div className={`h-48 bg-gradient-to-br ${agent.color} relative mb-4 transition-transform duration-700 group-hover:scale-105 rounded-lg overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-xs tracking-[0.2em] uppercase opacity-80 mb-1">
                      {agent.role}
                    </div>
                    <h3 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {agent.name}
                    </h3>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <button className="w-full bg-white border border-gray-200 px-4 py-3 text-xs tracking-[0.3em] uppercase hover:bg-gray-50 transition-all duration-300">
                  Chat with {agent.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Visual Editor Quick Link */}
            <div className="group cursor-pointer" onClick={() => setLocation('/visual-editor')}>
              <div 
                className="h-64 bg-cover bg-center bg-no-repeat relative mb-6 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.6)), url('https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3')`
                }}
              >
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2">
                    Development
                  </div>
                  <h3 className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Visual Editor
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Access the complete development environment. Build, edit, and deploy your platform.
              </p>
            </div>

            {/* Analytics */}
            <div className="group cursor-pointer">
              <div 
                className="h-64 bg-cover bg-center bg-no-repeat relative mb-6 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.6)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3')`
                }}
              >
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2">
                    Insights
                  </div>
                  <h3 className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Analytics
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Revenue insights and growth metrics. Track your empire's expansion in real-time.
              </p>
            </div>

            {/* Platform Health */}
            <div className="group cursor-pointer">
              <div 
                className="h-64 bg-cover bg-center bg-no-repeat relative mb-6 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.3), rgba(10, 10, 10, 0.6)), url('https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3')`
                }}
              >
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2">
                    Operations
                  </div>
                  <h3 className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Platform Health
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                System status and performance monitoring. Keep your empire running smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PowerQuotes Section - Rachel's Copy */}
      <section className="py-20 bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <blockquote className="text-2xl md:text-4xl font-light leading-relaxed mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
            "I went from crying in my car because I couldn't afford groceries to building a platform that transforms women's lives. 
            Your mess becomes your message when you own your story."
          </blockquote>
          <p className="text-[11px] tracking-[0.4em] uppercase opacity-70">
            Sandra Sigurjonsdottir, Founder
          </p>
        </div>
      </section>

      {/* Image Page Break */}
      <div 
        className="h-96 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.4), rgba(10, 10, 10, 0.4)), url('${SandraImages.aiGallery[2]}')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h3 
              className="text-3xl md:text-5xl font-light tracking-wider mb-4"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Keep Building
            </h3>
          </div>
        </div>
      </div>

      {/* Todo List Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
              Empire Tasks
            </p>
            <h2 
              className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Today's Priorities
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              "Review new user onboarding metrics",
              "Launch Q4 Instagram campaign with Sophia",
              "Optimize AI image generation pipeline",
              "Coordinate with Diana on business strategy",
              "Deploy platform updates to production"
            ].map((task, index) => (
              <div key={index} className="flex items-center p-4 bg-[#f5f5f5] border-l-4 border-[#0a0a0a]">
                <input type="checkbox" className="mr-4 w-5 h-5" />
                <span className="text-lg font-light">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Component */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
              Success Gallery
            </p>
            <h2 
              className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Transformation Portfolio
            </h2>
            <p className="text-lg text-[#666666] font-light max-w-2xl mx-auto">
              Real results from your empire. These women transformed their brands using SSELFIE Studio.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div key={index} className="aspect-[4/5] overflow-hidden bg-white group cursor-pointer">
                <img 
                  src={SandraImages.aiGallery[index]}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moodboard Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-6">
              Visual Inspiration
            </p>
            <h2 
              className="text-4xl md:text-6xl font-light mb-8 tracking-[-0.01em]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Brand Moodboard
            </h2>
            <p className="text-lg text-[#666666] font-light max-w-2xl mx-auto">
              The aesthetic foundation of your empire. Editorial luxury meets authentic transformation.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((index) => (
              <div key={index} className="aspect-square overflow-hidden bg-gray-100">
                <img 
                  src={SandraImages.aiGallery[index % SandraImages.aiGallery.length]}
                  alt={`Mood ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Chat Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Chat with {agents.find(a => a.id === selectedAgent)?.name}
                </h3>
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                {agents.find(a => a.id === selectedAgent)?.role}
              </p>
            </div>
            <div className="p-6">
              <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-500">Agent chat interface will be implemented here</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
                />
                <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}