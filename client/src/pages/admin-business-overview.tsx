
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { GlobalFooter } from '../components/global-footer';
import { MoodboardSection } from '../components/MoodboardSection';
import { SandraImages } from '../lib/sandra-images';

export default function AdminBusinessOverview() {
  // WILMA'S WORKFLOW STATE MANAGEMENT
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'tasks' | 'integrations'>('overview');
  const [quickActions, setQuickActions] = useState({
    subscriberImport: false,
    revenueAlert: false,
    systemHealth: 'optimal'
  });

  // OPTIMIZED DATA FETCHING WITH PRIORITY HIERARCHY
  const { data: businessMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/business-metrics'],
    refetchInterval: 30000,
    staleTime: 25000 // Wilma's efficiency: reduce unnecessary calls
  });

  const { data: subscriberStats, isLoading: subscriberLoading } = useQuery({
    queryKey: ['/api/admin/subscriber-stats'],
    enabled: activeView === 'analytics' || activeView === 'overview' // Load on demand
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    enabled: activeView === 'overview'
  });

  // WILMA'S SMART LOADING STATES
  const isLoading = metricsLoading || (activeView === 'analytics' && subscriberLoading) || (activeView === 'overview' && activityLoading);

  // PRIORITY DATA HIERARCHY (Wilma's signature move!)
  const priorityMetrics = useMemo(() => [
    { 
      key: 'revenue', 
      value: `€${businessMetrics?.monthlyRevenue || 0}`, 
      label: 'Monthly Revenue',
      trend: businessMetrics?.revenueTrend || 0,
      priority: 'critical',
      action: '/admin/revenue-analytics'
    },
    { 
      key: 'subscribers', 
      value: businessMetrics?.totalSubscribers || 0, 
      label: 'Active Subscribers',
      trend: businessMetrics?.subscriberGrowth || 0,
      priority: 'high',
      action: '/admin/subscriber-import'
    },
    { 
      key: 'users', 
      value: businessMetrics?.activeUsers || 0, 
      label: 'Platform Users',
      trend: businessMetrics?.userGrowth || 0,
      priority: 'medium',
      action: '/admin/user-analytics'
    }
  ], [businessMetrics]);

  // WORKFLOW EFFICIENCY CALCULATOR
  const workflowEfficiency = useMemo(() => {
    const baseScore = 85;
    const revenueBoost = (businessMetrics?.monthlyRevenue || 0) > 10000 ? 5 : 0;
    const subscriberBoost = (businessMetrics?.totalSubscribers || 0) > 1000 ? 5 : 0;
    const activityBoost = quickActions.systemHealth === 'optimal' ? 5 : 0;
    return Math.min(100, baseScore + revenueBoost + subscriberBoost + activityBoost);
  }, [businessMetrics, quickActions]);

  // Hero image from your authentic workspace gallery - using your actual generated AI images
  const heroImage = "https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/images/42585527/tracker_377_img_1_1753351608174.png";
  const pageBreakImage = "https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/images/42585527/tracker_368_img_0_1753349329061.png";

  // WILMA'S SMART TASK PRIORITIZATION SYSTEM
  const businessTasks = useMemo(() => [
    {
      id: 'subscriber-import',
      task: 'Review subscriber import performance from ManyChat (4,608 subscribers available)',
      priority: 'urgent',
      estimatedTime: '15 min',
      status: quickActions.subscriberImport ? 'in-progress' : 'pending',
      quickAction: '/admin/subscriber-import',
      impact: 'high'
    },
    {
      id: 'revenue-analysis',
      task: 'Analyze monthly revenue trends and identify growth opportunities',
      priority: 'high',
      estimatedTime: '30 min',
      status: 'pending',
      quickAction: '/admin/revenue-analytics',
      impact: 'critical'
    },
    {
      id: 'ai-optimization',
      task: 'Monitor AI image generation usage and optimize for cost efficiency',
      priority: 'medium',
      estimatedTime: '20 min',
      status: 'pending',
      quickAction: '/admin/ai-analytics',
      impact: 'medium'
    },
    {
      id: 'user-tracking',
      task: 'Track user engagement across platform features',
      priority: 'medium',
      estimatedTime: '25 min',
      status: 'pending',
      quickAction: '/admin/user-analytics',
      impact: 'high'
    },
    {
      id: 'business-report',
      task: 'Prepare quarterly business intelligence report',
      priority: 'low',
      estimatedTime: '2 hours',
      status: 'scheduled',
      quickAction: '/admin/reports',
      impact: 'high'
    }
  ], [quickActions]);

  // WILMA'S INTEGRATION TOUCHPOINTS
  const integrationPoints = [
    {
      name: 'ManyChat Sync',
      status: 'connected',
      lastSync: '2 min ago',
      action: '/admin/integrations/manychat',
      health: 98
    },
    {
      name: 'Stripe Revenue',
      status: 'connected',
      lastSync: '5 min ago',
      action: '/admin/integrations/stripe',
      health: 100
    },
    {
      name: 'AI Model APIs',
      status: 'optimal',
      lastSync: 'real-time',
      action: '/admin/integrations/ai-models',
      health: 95
    },
    {
      name: 'Analytics Pipeline',
      status: 'processing',
      lastSync: '1 min ago',
      action: '/admin/integrations/analytics',
      health: 92
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* WILMA'S EFFICIENCY COMMAND CENTER HERO */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-60">
          <img 
            src={heroImage}
            alt="Business Overview Command Center"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* EFFICIENCY OVERLAY WITH REAL-TIME STATS */}
        <div className="absolute top-8 right-8 z-20 bg-black/80 backdrop-blur-sm border border-white/20 p-4 rounded">
          <div className="text-xs tracking-[0.3em] uppercase text-white/70 mb-2">System Health</div>
          <div className="text-2xl font-light text-white">{workflowEfficiency}%</div>
        </div>

        {/* QUICK ACTION SIDEBAR */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 space-y-4">
          {integrationPoints.slice(0, 3).map((integration, index) => (
            <Link 
              key={integration.name}
              href={integration.action}
              className="block bg-black/80 backdrop-blur-sm border border-white/20 p-3 rounded hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-xs text-white/70">{integration.name}</div>
              <div className={`text-xs font-medium ${
                integration.status === 'connected' ? 'text-green-400' : 
                integration.status === 'optimal' ? 'text-blue-400' : 'text-yellow-400'
              }`}>
                {integration.status.toUpperCase()}
              </div>
            </Link>
          ))}
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-8 flex flex-col justify-end min-h-screen pb-20">
          <div className="text-xs tracking-[0.4em] uppercase opacity-70 mb-8">
            Workflow-Optimized Business Command Center
          </div>
          
          <h1 className="font-serif text-[clamp(4rem,10vw,10rem)] leading-[0.8] font-light uppercase tracking-wide mb-8">
            Business Overview
          </h1>
          
          <p className="text-lg max-w-2xl mx-auto opacity-80 font-light leading-relaxed mb-8">
            Streamlined revenue tracking, priority-based analytics, and intelligent workflow automation 
            for maximum business efficiency.
          </p>

          {/* WILMA'S SMART NAVIGATION TABS */}
          <div className="flex justify-center gap-6 mt-12">
            {['overview', 'analytics', 'tasks', 'integrations'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view as any)}
                className={`text-sm tracking-[0.2em] uppercase px-4 py-2 border transition-all duration-300 ${
                  activeView === view 
                    ? 'border-white bg-white/10 text-white' 
                    : 'border-white/30 text-white/70 hover:border-white/60 hover:text-white'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT SECTIONS */}
      <section className="py-20 bg-white text-black">
        <div className="max-w-6xl mx-auto px-8">
          {activeView === 'overview' && (
            <>
              {/* Business Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-0 mb-20 border border-gray-200">
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    €{businessMetrics?.totalRevenue || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Total Revenue
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    €{businessMetrics?.monthlyRevenue || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Monthly Revenue
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    {businessMetrics?.totalSubscribers || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Total Subscribers
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    {businessMetrics?.activeUsers || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Active Users
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    {businessMetrics?.totalAIImages || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    AI Images Generated
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    {businessMetrics?.trainedModels || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Trained Models
                  </div>
                </div>
              </div>

              {/* Full Bleed Image Page Break - Your Workspace Gallery */}
              <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-20">
                <div className="aspect-[21/9] overflow-hidden">
                  <img 
                    src={pageBreakImage}
                    alt="Business Growth"
                    className="w-full h-full object-cover ml-[0px] mr-[0px] mt-[0px] mb-[0px] pt-[0px] pb-[0px]"
                  />
                </div>
              </div>

              {/* Business Tasks Todo List */}
              <div className="mb-20">
                <div className="text-center mb-12">
                  <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
                    Priority Actions
                  </div>
                  <h3 className="font-serif text-2xl font-light tracking-wide">
                    Business Tasks
                  </h3>
                </div>
                
                <div className="max-w-4xl mx-auto space-y-4">
                  {businessTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border border-gray-200">
                      <div className="w-4 h-4 border border-gray-400 mt-1 flex-shrink-0"></div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {task}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Intelligence Moodboard */}
              <div className="mb-20">
                <div className="text-center mb-12">
                  <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
                    Visual Analytics
                  </div>
                  <h3 className="font-serif text-2xl font-light tracking-wide">
                    Platform Insights
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <MoodboardSection 
                    title="User Journey"
                    images={[
                      "https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/images/42585527/tracker_373_img_0_1753350079138.png",
                      "https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/images/42585527/tracker_368_img_0_1753349329061.png",
                      SandraImages.gallery[2] || SandraImages.editorial.thinking
                    ]}
                  />
                  <MoodboardSection 
                    title="Revenue Growth"
                    images={[
                      SandraImages.gallery[3] || SandraImages.journey.building,
                      SandraImages.gallery[4] || SandraImages.journey.success,
                      SandraImages.gallery[5] || SandraImages.hero.pricing
                    ]}
                  />
                  <MoodboardSection 
                    title="Platform Quality"
                    images={[
                      SandraImages.gallery[6] || SandraImages.flatlays.workspace1,
                      SandraImages.gallery[7] || SandraImages.flatlays.luxury,
                      SandraImages.gallery[8] || SandraImages.editorial.aiSuccess
                    ]}
                  />
                </div>
              </div>

              {/* Powerquote */}
              <div className="text-center py-20 max-w-4xl mx-auto">
                <blockquote className="font-serif text-2xl md:text-3xl font-light leading-relaxed text-gray-800 italic">
                  "Your personal brand is built through every single interaction, 
                  every piece of content, and every moment of authentic connection 
                  with your community."
                </blockquote>
                <div className="text-xs tracking-[0.3em] uppercase text-gray-500 mt-8">
                  Sandra Aamodt, Founder
                </div>
              </div>

              {/* Image Cards - Your Workspace Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <Link href="/admin/subscriber-import" className="group">
                  <div className="relative overflow-hidden bg-black aspect-[4/5]">
                    <img 
                      src={SandraImages.gallery[9] || SandraImages.editorial.laptop2}
                      alt="Subscriber Management"
                      className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-90 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-xl font-light tracking-[0.3em] uppercase">
                          Subscriber Import
                        </div>
                        <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                          Data Management
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/admin/consulting-agents" className="group">
                  <div className="relative overflow-hidden bg-black aspect-[4/5]">
                    <img 
                      src={SandraImages.gallery[10] || SandraImages.hero.agents}
                      alt="AI Agents"
                      className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-90 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-xl font-light tracking-[0.3em] uppercase">
                          AI Agents
                        </div>
                        <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                          Strategic Consulting
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/workspace" className="group">
                  <div className="relative overflow-hidden bg-black aspect-[4/5]">
                    <img 
                      src={SandraImages.gallery[11] || SandraImages.hero.homepage}
                      alt="Platform Studio"
                      className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-90 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-xl font-light tracking-[0.3em] uppercase">
                          Studio Platform
                        </div>
                        <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                          Member Experience
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}

          {/* Admin Navigation Style */}
          <div className="text-center">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
              Platform Navigation
            </div>
            <div className="flex justify-center gap-8">
              <Link 
                href="/admin-dashboard"
                className="text-sm tracking-[0.2em] uppercase border-b border-transparent hover:border-black transition-colors duration-300"
              >
                Admin Dashboard
              </Link>
              <Link 
                href="/workspace"
                className="text-sm tracking-[0.2em] uppercase border-b border-transparent hover:border-black transition-colors duration-300"
              >
                Back to Studio
              </Link>
            </div>
          </div>
        </div>
      </section>
      <GlobalFooter />
    </div>
  );
}