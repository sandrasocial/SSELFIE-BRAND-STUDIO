import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgentInsightsDashboard } from '../components/agent-insights-dashboard';
import { QuickSpecialistAccess } from '../components/quick-specialist-access';
import { NotificationPreferences } from '../components/notification-preferences';
import { SystemHealthMonitor } from '../components/system-health-monitor';
import { CustomerManagementDashboard } from '../components/customer-management-dashboard';
import { RevenueAnalyticsDashboard } from '../components/revenue-analytics-dashboard';
import { ContentModerationDashboard } from '../components/content-moderation-dashboard';
import { SupportManagementDashboard } from '../components/support-management-dashboard';
import { Users, CreditCard, Image, MessageSquare, BarChart3, Shield, Settings, Activity } from 'lucide-react';

interface ApprovalItem {
  id: number;
  agentId: string;
  contentType: string;
  contentTitle: string;
  contentPreview: string;
  impactLevel: string;
  estimatedCost: string;
  createdAt: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeSubscriptions: number;
  systemHealth: number;
}

interface RevenueData {
  monthlyRevenue: number;
}

interface PendingApprovals extends Array<ApprovalItem> {}

export default function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState<'customers' | 'approvals' | 'revenue' | 'content' | 'support' | 'insights' | 'specialists' | 'health'>('customers');
  
  // Get pending approvals with proper typing
  const { data: pendingApprovals, isLoading } = useQuery<PendingApprovals>({
    queryKey: ['/api/admin/approval-queue'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Get daily costs
  const { data: costSummary } = useQuery({
    queryKey: ['/api/admin/cost-summary'],
    refetchInterval: 60000, // Refresh every minute
  });
  
  const queryClient = useQueryClient();
  
  // Approve content mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, action, comments }: { id: number; action: 'approve' | 'reject'; comments?: string }) => {
      const response = await fetch(`/api/admin/approval-queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comments })
      });
      if (!response.ok) throw new Error('Failed to process approval');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/approval-queue'] });
    }
  });

  // Get customer data with proper typing
  const { data: customerStats } = useQuery<CustomerStats>({
    queryKey: ['/api/admin/customer-stats'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: revenueData } = useQuery<RevenueData>({
    queryKey: ['/api/admin/revenue-summary'],
    refetchInterval: 300000,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* DESKTOP-OPTIMIZED HERO SECTION */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black to-gray-900 opacity-95"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 text-center">
          <div className="mb-16">
            <div className="text-xs font-light tracking-[0.4em] uppercase opacity-70 mb-8">
              SSELFIE STUDIO
            </div>
            <h1 className="font-serif text-[clamp(4rem,8vw,8rem)] leading-[0.8] font-light uppercase tracking-wide mb-8">
              Admin Control
            </h1>
            <p className="text-lg max-w-3xl mx-auto opacity-80 font-light leading-relaxed mb-12">
              Comprehensive management dashboard for your AI-powered empire. 
              Monitor customers, revenue, content, and agent performance from a unified command center.
            </p>
            
            {/* Quick Navigation */}
            <div className="flex justify-center gap-6">
              <a 
                href="/admin/consulting-agents" 
                className="border border-white/30 hover:bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.3em] transition-all"
              >
                Consulting Agents
              </a>
              <a 
                href="/admin/business-overview" 
                className="border border-white/30 hover:bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.3em] transition-all"
              >
                Business Overview
              </a>
            </div>
          </div>
          
          {/* Desktop-Optimized Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/20 max-w-5xl mx-auto">
            <div className="text-center p-8 border border-white/20">
              <div className="font-serif text-4xl font-light mb-2 text-emerald-400">
                €{revenueData?.monthlyRevenue || '0'}
              </div>
              <div className="text-xs tracking-[0.3em] uppercase opacity-70">
                Monthly Revenue
              </div>
            </div>
            <div className="text-center p-8 border border-white/20">
              <div className="font-serif text-4xl font-light mb-2">
                {customerStats?.totalCustomers || 0}
              </div>
              <div className="text-xs tracking-[0.3em] uppercase opacity-70">
                Total Customers
              </div>
            </div>
            <div className="text-center p-8 border border-white/20">
              <div className="font-serif text-4xl font-light mb-2 text-blue-400">
                {customerStats?.activeSubscriptions || 0}
              </div>
              <div className="text-xs tracking-[0.3em] uppercase opacity-70">
                Active Subscriptions
              </div>
            </div>
            <div className="text-center p-8 border border-white/20">
              <div className="font-serif text-4xl font-light mb-2 text-green-400">
                {customerStats?.systemHealth || '98'}%
              </div>
              <div className="text-xs tracking-[0.3em] uppercase opacity-70">
                System Health
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESKTOP-OPTIMIZED NAVIGATION */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-center space-x-0">
            {[
              { id: 'customers', label: 'CUSTOMERS', icon: Users },
              { id: 'approvals', label: 'APPROVALS', icon: Shield, badge: pendingApprovals?.length },
              { id: 'revenue', label: 'REVENUE', icon: CreditCard },
              { id: 'content', label: 'CONTENT', icon: Image },
              { id: 'support', label: 'SUPPORT', icon: MessageSquare },
              { id: 'insights', label: 'INSIGHTS', icon: BarChart3 },
              { id: 'specialists', label: 'AGENTS', icon: Settings },
              { id: 'health', label: 'HEALTH', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center py-8 px-8 text-xs uppercase tracking-[0.3em] transition-all relative border-l border-gray-200 first:border-l-0 ${
                    activeTab === tab.id 
                      ? 'text-black bg-gray-50 border-b-2 border-black' 
                      : 'text-gray-500 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className="mb-3" />
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* DESKTOP-OPTIMIZED CONTENT AREA */}
      <section className="py-20 bg-white text-black">
        <div className="max-w-7xl mx-auto px-8">
          {activeTab === 'customers' && (
            <div>
              <div className="text-center mb-16">
                <div className="text-xs font-light tracking-[0.4em] uppercase text-gray-500 mb-4">
                  Customer Administration
                </div>
                <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] font-light uppercase tracking-wide mb-8">
                  Customer Management
                </h2>
                <div className="flex justify-center">
                  <button className="border border-black hover:bg-black hover:text-white px-8 py-4 text-xs uppercase tracking-[0.3em] transition-all">
                    Export Data
                  </button>
                </div>
              </div>
              
              <CustomerManagementDashboard />
            </div>
          )}

          {activeTab === 'revenue' && (
            <div>
              <div className="text-center mb-16">
                <div className="text-xs font-light tracking-[0.4em] uppercase text-gray-500 mb-4">
                  Financial Analytics
                </div>
                <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] font-light uppercase tracking-wide">
                  Revenue Intelligence
                </h2>
              </div>
              
              <RevenueAnalyticsDashboard />
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <div className="text-center mb-16">
                <div className="text-xs font-light tracking-[0.4em] uppercase text-gray-500 mb-4">
                  Content Review
                </div>
                <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] font-light uppercase tracking-wide">
                  Content Moderation
                </h2>
              </div>
              
              <ContentModerationDashboard />
            </div>
          )}

          {activeTab === 'support' && (
            <div>
              <div className="text-center mb-16">
                <div className="text-xs font-light tracking-[0.4em] uppercase text-gray-500 mb-4">
                  Customer Support
                </div>
                <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] font-light uppercase tracking-wide">
                  Support Management
                </h2>
              </div>
              
              <SupportManagementDashboard />
            </div>
          )}

          {activeTab === 'approvals' && (
            <div>
              <div className="text-center mb-16">
                <div className="text-xs font-light tracking-[0.4em] uppercase text-gray-500 mb-4">
                  Content Approval
                </div>
                <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] font-light uppercase tracking-wide">
                  Pending Approvals
                </h2>
              </div>
              
              <div className="max-w-5xl mx-auto space-y-8">
                {pendingApprovals?.map((item: ApprovalItem) => (
                  <div key={item.id} className="border border-gray-200 p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="font-serif text-xl font-medium">{item.contentTitle}</h3>
                          <span className="text-xs uppercase tracking-wide bg-gray-100 px-3 py-2">
                            {item.agentId}
                          </span>
                          <span className={`text-xs uppercase tracking-wide px-3 py-2 ${
                            item.impactLevel === 'high' ? 'bg-red-100 text-red-700' :
                            item.impactLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {item.impactLevel} IMPACT
                          </span>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed">{item.contentPreview}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-2xl font-light">€{item.estimatedCost}</div>
                        <div className="text-xs tracking-[0.3em] uppercase text-gray-500">Est. Cost</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => approveMutation.mutate({ id: item.id, action: 'approve' })}
                        className="bg-green-600 text-white px-6 py-3 text-xs uppercase tracking-wide hover:bg-green-700 transition-colors"
                      >
                        APPROVE
                      </button>
                      <button
                        onClick={() => approveMutation.mutate({ id: item.id, action: 'reject' })}
                        className="bg-red-600 text-white px-6 py-3 text-xs uppercase tracking-wide hover:bg-red-700 transition-colors"
                      >
                        REJECT
                      </button>
                      <button className="border border-gray-300 px-6 py-3 text-xs uppercase tracking-wide hover:bg-gray-50 transition-colors">
                        MODIFY
                      </button>
                      <button className="border border-gray-300 px-6 py-3 text-xs uppercase tracking-wide hover:bg-gray-50 transition-colors">
                        PREVIEW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'insights' && (
            <div>
              <div className="text-center mb-16">
                <div className="text-xs font-light tracking-[0.4em] uppercase text-gray-500 mb-4">
                  Agent Intelligence
                </div>
                <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] font-light uppercase tracking-wide">
                  Agent Insights
                </h2>
              </div>
              <AgentInsightsDashboard />
            </div>
          )}

          {activeTab === 'specialists' && (
            <div>
              <div className="text-center mb-16">
                <div className="text-xs font-light tracking-[0.4em] uppercase text-gray-500 mb-4">
                  Agent Access
                </div>
                <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] font-light uppercase tracking-wide">
                  Specialist Agents
                </h2>
              </div>
              <QuickSpecialistAccess />
            </div>
          )}

          {activeTab === 'health' && (
            <div>
              <div className="text-center mb-16">
                <div className="text-xs font-light tracking-[0.4em] uppercase text-gray-500 mb-4">
                  System Monitoring
                </div>
                <h2 className="font-serif text-[clamp(2rem,4vw,4rem)] font-light uppercase tracking-wide">
                  System Health
                </h2>
              </div>
              <SystemHealthMonitor />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}