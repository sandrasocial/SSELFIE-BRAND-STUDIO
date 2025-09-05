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

export default function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState<'customers' | 'approvals' | 'revenue' | 'content' | 'support' | 'insights' | 'specialists' | 'health'>('customers');
  
  // Get pending approvals
  const { data: pendingApprovals, isLoading } = useQuery({
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

  // Get customer data
  const { data: customerStats } = useQuery({
    queryKey: ['/api/admin/customer-stats'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: revenueData } = useQuery({
    queryKey: ['/api/admin/revenue-summary'],
    refetchInterval: 300000,
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--white, #ffffff)', color: 'var(--black, #0a0a0a)' }}>
      {/* EDITORIAL HERO HEADER */}
      <div style={{ background: 'var(--black, #0a0a0a)', color: 'var(--white, #ffffff)' }} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black to-gray-900 opacity-90"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            {/* Editorial Title */}
            <div>
              <div className="text-xs font-light tracking-[0.4em] uppercase opacity-70 mb-4">
                SSELFIE STUDIO
              </div>
              <h1 className="font-serif text-5xl font-light tracking-wide uppercase leading-none">
                EMPIRE
              </h1>
              <h1 className="font-serif text-5xl font-light tracking-wide uppercase leading-none opacity-80">
                CONTROL
              </h1>
            </div>
            
            {/* Quick Navigation - Editorial Style */}
            <div className="flex gap-4">
              <a 
                href="/admin/consulting-agents" 
                className="border border-white border-opacity-20 hover:bg-white hover:bg-opacity-10 px-6 py-3 text-xs uppercase tracking-[0.3em] transition-all"
              >
                Consulting Agents
              </a>
              <a 
                href="/admin/business-overview" 
                className="border border-white border-opacity-20 hover:bg-white hover:bg-opacity-10 px-6 py-3 text-xs uppercase tracking-[0.3em] transition-all"
              >
                Business Overview
              </a>
            </div>
          </div>
          
          {/* Editorial Stats Grid */}
          <div className="grid grid-cols-4 gap-8 border-t border-white border-opacity-20 pt-8">
            <div className="text-center">
              <div className="text-3xl font-light font-serif">€{revenueData?.monthlyRevenue || '0'}</div>
              <div className="text-xs uppercase tracking-[0.3em] opacity-70 mt-2">Monthly Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light font-serif">{customerStats?.totalCustomers || 0}</div>
              <div className="text-xs uppercase tracking-[0.3em] opacity-70 mt-2">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light font-serif">{customerStats?.activeSubscriptions || 0}</div>
              <div className="text-xs uppercase tracking-[0.3em] opacity-70 mt-2">Active Subscriptions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light font-serif text-green-400">{customerStats?.systemHealth || '98'}%</div>
              <div className="text-xs uppercase tracking-[0.3em] opacity-70 mt-2">System Health</div>
            </div>
          </div>
        </div>
      </div>

      {/* EDITORIAL NAVIGATION */}
      <div className="border-b" style={{ borderColor: 'var(--accent-line, #e5e5e5)' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex space-x-0">
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
                  className={`flex flex-col items-center py-6 px-6 text-xs uppercase tracking-[0.3em] transition-all relative ${
                    activeTab === tab.id 
                      ? 'text-black border-b-2 border-black' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <Icon size={18} className="mb-2" />
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* EDITORIAL CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {activeTab === 'customers' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-light tracking-[0.4em] uppercase opacity-60 mb-2">
                  Customer Administration
                </div>
                <h2 className="font-serif text-4xl font-light uppercase tracking-wide">
                  Customer Management
                </h2>
              </div>
              <button className="border border-black hover:bg-black hover:text-white px-6 py-3 text-xs uppercase tracking-[0.3em] transition-all">
                Export Data
              </button>
            </div>
            
            <CustomerManagementDashboard />
          </div>
        )}

        {activeTab === 'revenue' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-light tracking-[0.4em] uppercase opacity-60 mb-2">
                  Financial Analytics
                </div>
                <h2 className="font-serif text-4xl font-light uppercase tracking-wide">
                  Revenue Intelligence
                </h2>
              </div>
            </div>
            
            <RevenueAnalyticsDashboard />
          </div>
        )}

        {activeTab === 'content' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-light tracking-[0.4em] uppercase opacity-60 mb-2">
                  Content Review
                </div>
                <h2 className="font-serif text-4xl font-light uppercase tracking-wide">
                  Content Moderation
                </h2>
              </div>
            </div>
            
            <ContentModerationDashboard />
          </div>
        )}

        {activeTab === 'support' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-light tracking-[0.4em] uppercase opacity-60 mb-2">
                  Customer Support
                </div>
                <h2 className="font-serif text-4xl font-light uppercase tracking-wide">
                  Support Management
                </h2>
              </div>
            </div>
            
            <SupportManagementDashboard />
          </div>
        )}

        {activeTab === 'approvals' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-light tracking-[0.4em] uppercase opacity-60 mb-2">
                  Content Approval
                </div>
                <h2 className="font-serif text-4xl font-light uppercase tracking-wide">
                  Pending Approvals
                </h2>
              </div>
            </div>
            
            {pendingApprovals?.map((item: ApprovalItem) => (
              <div key={item.id} className="border border-gray-200 mb-4 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-medium">{item.contentTitle}</h3>
                      <span className="text-xs uppercase tracking-wide bg-gray-100 px-2 py-1">
                        {item.agentId}
                      </span>
                      <span className={`text-xs uppercase tracking-wide px-2 py-1 ${
                        item.impactLevel === 'high' ? 'bg-red-100 text-red-700' :
                        item.impactLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.impactLevel} IMPACT
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{item.contentPreview}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">€{item.estimatedCost}</div>
                    <div className="text-xs text-gray-500">Est. Cost</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => approveMutation.mutate({ id: item.id, action: 'approve' })}
                    className="bg-green-600 text-white px-4 py-2 text-xs uppercase tracking-wide hover:bg-green-700 transition-colors"
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => approveMutation.mutate({ id: item.id, action: 'reject' })}
                    className="bg-red-600 text-white px-4 py-2 text-xs uppercase tracking-wide hover:bg-red-700 transition-colors"
                  >
                    REJECT
                  </button>
                  <button className="border border-gray-300 px-4 py-2 text-xs uppercase tracking-wide hover:bg-gray-50 transition-colors">
                    MODIFY
                  </button>
                  <button className="border border-gray-300 px-4 py-2 text-xs uppercase tracking-wide hover:bg-gray-50 transition-colors">
                    PREVIEW
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'insights' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-light tracking-[0.4em] uppercase opacity-60 mb-2">
                  Agent Intelligence
                </div>
                <h2 className="font-serif text-4xl font-light uppercase tracking-wide">
                  Agent Insights
                </h2>
              </div>
            </div>
            <AgentInsightsDashboard />
          </div>
        )}

        {activeTab === 'specialists' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-light tracking-[0.4em] uppercase opacity-60 mb-2">
                  Agent Access
                </div>
                <h2 className="font-serif text-4xl font-light uppercase tracking-wide">
                  Specialist Agents
                </h2>
              </div>
            </div>
            <QuickSpecialistAccess />
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-light tracking-[0.4em] uppercase opacity-60 mb-2">
                  System Monitoring
                </div>
                <h2 className="font-serif text-4xl font-light uppercase tracking-wide">
                  System Health
                </h2>
              </div>
            </div>
            <SystemHealthMonitor />
          </div>
        )}
        
        {/* Other tab content sections... */}
      </div>
    </div>
  );
}