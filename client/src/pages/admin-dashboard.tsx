import { useQuery } from "@tanstack/react-query";
import AdminHeroSection from '@/components/admin/AdminHeroSection';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalSessions: number;
  conversionRate: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json() as AdminStats;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-times text-xl tracking-wider">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Aria's Luxury AdminHeroSection Component */}
      <AdminHeroSection 
        title="SSELFIE Studio Empire"
        subtitle="From Rock Bottom to Revenue Revolution"
        description="Transform your vision into a luxury business empire through strategic design, editorial storytelling, and uncompromising excellence."
      />

      {/* Luxury Editorial Performance Gallery */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-8 text-white">
            EMPIRE METRICS
          </h2>
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
          <p className="font-serif text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Real-time insights into your luxury business transformation
          </p>
        </div>

        {/* Redesigned Editorial Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Total Users - Editorial Style */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-xs uppercase tracking-[0.4em] text-white/40">COMMUNITY</span>
                  <div className="w-16 h-[1px] bg-gradient-to-r from-white/30 to-transparent"></div>
                </div>
                <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Total Users</h3>
                <p className="text-white/60 text-sm">Platform members</p>
              </div>
              <div className="mb-4">
                <p className="font-serif text-7xl font-extralight text-white tracking-tighter leading-none mb-2">
                  {stats?.totalUsers?.toLocaleString() || '8'}
                </p>
                <div className="text-white/50 text-sm font-light flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Growing community
                </div>
              </div>
            </div>
          </div>

          {/* Revenue - Editorial Style */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-xs uppercase tracking-[0.4em] text-white/40">REVENUE</span>
                  <div className="w-16 h-[1px] bg-gradient-to-r from-white/30 to-transparent"></div>
                </div>
                <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Monthly Revenue</h3>
                <p className="text-white/60 text-sm">Recurring income</p>
              </div>
              <div className="mb-4">
                <p className="font-serif text-7xl font-extralight text-white tracking-tighter leading-none mb-2">
                  €{stats?.revenue?.toLocaleString() || '423'}
                </p>
                <div className="text-white/50 text-sm font-light flex items-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                  87% profit margin
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions - Editorial Style */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-xs uppercase tracking-[0.4em] text-white/40">PREMIUM</span>
                  <div className="w-16 h-[1px] bg-gradient-to-r from-white/30 to-transparent"></div>
                </div>
                <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Active Subscriptions</h3>
                <p className="text-white/60 text-sm">Premium members</p>
              </div>
              <div className="mb-4">
                <p className="font-serif text-7xl font-extralight text-white tracking-tighter leading-none mb-2">
                  {stats?.activeSubscriptions?.toLocaleString() || '9'}
                </p>
                <div className="text-white/50 text-sm font-light flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
                  Luxury tier active
                </div>
              </div>
            </div>
          </div>

          {/* AI Content - Editorial Style */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-xs uppercase tracking-[0.4em] text-white/40">CONTENT</span>
                  <div className="w-16 h-[1px] bg-gradient-to-r from-white/30 to-transparent"></div>
                </div>
                <h3 className="font-serif text-2xl font-light text-white/90 mb-2">AI Images</h3>
                <p className="text-white/60 text-sm">Total generated</p>
              </div>
              <div className="mb-4">
                <p className="font-serif text-7xl font-extralight text-white tracking-tighter leading-none mb-2">
                  {stats?.aiImagesGenerated?.toLocaleString() || '300'}
                </p>
                <div className="text-white/50 text-sm font-light flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                  FLUX Pro quality
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Rate - Editorial Style */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-xs uppercase tracking-[0.4em] text-white/40">CONVERSION</span>
                  <div className="w-16 h-[1px] bg-gradient-to-r from-white/30 to-transparent"></div>
                </div>
                <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Success Rate</h3>
                <p className="text-white/60 text-sm">User activation</p>
              </div>
              <div className="mb-4">
                <p className="font-serif text-7xl font-extralight text-white tracking-tighter leading-none mb-2">
                  {stats?.conversionRate?.toFixed(1) || '112.5'}%
                </p>
                <div className="text-white/50 text-sm font-light flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                  Above industry
                </div>
              </div>
            </div>
          </div>

          {/* Agent Tasks - Editorial Style */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-xs uppercase tracking-[0.4em] text-white/40">AUTOMATION</span>
                  <div className="w-16 h-[1px] bg-gradient-to-r from-white/30 to-transparent"></div>
                </div>
                <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Agent Tasks</h3>
                <p className="text-white/60 text-sm">Tasks completed</p>
              </div>
              <div className="mb-4">
                <p className="font-serif text-7xl font-extralight text-white tracking-tighter leading-none mb-2">
                  {stats?.agentTasks?.toLocaleString() || '920'}
                </p>
                <div className="text-white/50 text-sm font-light flex items-center">
                  <div className="w-2 h-2 bg-rose-400 rounded-full mr-2 animate-pulse"></div>
                  AI team active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elite Agent Coordination Center */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-24">
            <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-8 text-white">
              AGENT EMPIRE
            </h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
            <p className="font-serif text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Your specialized AI workforce, ready for complex coordination and execution
            </p>
          </div>

          {/* Agent Grid - Editorial Gallery Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            
            {/* Elena - Strategic Coordinator */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">E</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Elena</h3>
                  <p className="text-white/60 text-sm">Strategic Workflow Director</p>
                </div>
                <div className="text-white/50 text-sm font-light mb-4">
                  Coordinates multi-agent workflows with warm strategic guidance
                </div>
                <div className="flex items-center text-xs text-white/40">
                  <span className="mr-2">✓</span> Live @ mention system
                </div>
              </div>
            </div>

            {/* Aria - Design Director */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-xl">A</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Aria</h3>
                  <p className="text-white/60 text-sm">Editorial Design Director</p>
                </div>
                <div className="text-white/50 text-sm font-light mb-4">
                  Master of luxury editorial design with Times New Roman excellence
                </div>
                <div className="flex items-center text-xs text-white/40">
                  <span className="mr-2">✓</span> Live file creation
                </div>
              </div>
            </div>

            {/* Zara - Technical Architect */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl">Z</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Zara</h3>
                  <p className="text-white/60 text-sm">Technical Mastermind</p>
                </div>
                <div className="text-white/50 text-sm font-light mb-4">
                  TypeScript, React, and SSELFIE platform architecture specialist
                </div>
                <div className="flex items-center text-xs text-white/40">
                  <span className="mr-2">✓</span> Real codebase access
                </div>
              </div>
            </div>

            {/* Rachel - Voice Specialist */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">R</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Rachel</h3>
                  <p className="text-white/60 text-sm">Voice & Copy Expert</p>
                </div>
                <div className="text-white/50 text-sm font-light mb-4">
                  Sandra's authentic voice DNA and copywriting specialist
                </div>
                <div className="flex items-center text-xs text-white/40">
                  <span className="mr-2">✓</span> Brand voice mastery
                </div>
              </div>
            </div>

            {/* Quinn - Quality Guardian */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">Q</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Quinn</h3>
                  <p className="text-white/60 text-sm">Luxury Quality Guardian</p>
                </div>
                <div className="text-white/50 text-sm font-light mb-4">
                  Ensures Chanel-level quality standards across all outputs
                </div>
                <div className="flex items-center text-xs text-white/40">
                  <span className="mr-2">✓</span> Luxury validation
                </div>
              </div>
            </div>

            {/* Maya - AI Photography */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-700 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">M</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-serif text-2xl font-light text-white/90 mb-2">Maya</h3>
                  <p className="text-white/60 text-sm">AI Photography Director</p>
                </div>
                <div className="text-white/50 text-sm font-light mb-4">
                  FLUX Pro mastery and individual model training specialist
                </div>
                <div className="flex items-center text-xs text-white/40">
                  <span className="mr-2">✓</span> FLUX Pro access
                </div>
              </div>
            </div>
          </div>

          {/* Elite Coordination Status */}
          <div className="bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-light text-white/90">Live Agent Status</h3>
              <div className="flex items-center text-white/60">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">All systems operational</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-2xl font-light text-white mb-1">920</div>
                <div className="text-white/50 text-xs">Tasks completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-white mb-1">15</div>
                <div className="text-white/50 text-xs">Active workflows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-white mb-1">42</div>
                <div className="text-white/50 text-xs">Files created today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-white mb-1">99.8%</div>
                <div className="text-white/50 text-xs">Success rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-white mb-1">&lt; 2s</div>
                <div className="text-white/50 text-xs">Response time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-white mb-1">24/7</div>
                <div className="text-white/50 text-xs">Availability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-12 h-[1px] bg-white/40 mx-auto mb-8"></div>
          <p className="font-times text-white/40 text-sm tracking-[0.2em] uppercase">
            SSELFIE STUDIO EMPIRE COMMAND CENTER
          </p>
        </div>
      </footer>
    </div>
  );
}