import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgentInsightsDashboard } from '../components/agent-insights-dashboard';
import { QuickSpecialistAccess } from '../components/quick-specialist-access';
import { NotificationPreferences } from '../components/notification-preferences';
import { SystemHealthMonitor } from '../components/system-health-monitor';

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
  const [activeTab, setActiveTab] = useState<'approvals' | 'costs' | 'agents' | 'handoffs' | 'insights' | 'specialists' | 'preferences' | 'health'>('approvals');
  
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

  return (
    <div className="min-h-screen bg-white">
      {/* SANDRA'S CONTROL HEADER */}
      <div className="bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-serif text-3xl font-light tracking-wide">
              ADMIN EMPIRE CONTROL CENTER
            </h1>
            
            {/* Quick Navigation Links */}
            <div className="flex gap-3">
              <a 
                href="/admin/consulting-agents" 
                className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 text-xs uppercase tracking-wide transition-colors border border-white border-opacity-20"
              >
                🤖 Consulting Agents
              </a>
              <a 
                href="/admin/business-overview" 
                className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 text-xs uppercase tracking-wide transition-colors border border-white border-opacity-20"
              >
                📊 Business Overview
              </a>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-light">€{costSummary?.todayCost || '0'}</div>
              <div className="text-xs uppercase tracking-wide opacity-70">Today's Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light">{pendingApprovals?.length || 0}</div>
              <div className="text-xs uppercase tracking-wide opacity-70">Pending Approvals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light">{costSummary?.activeAgents || 0}</div>
              <div className="text-xs uppercase tracking-wide opacity-70">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-green-400">98%</div>
              <div className="text-xs uppercase tracking-wide opacity-70">System Health</div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-8">
            {[
              { id: 'approvals', label: 'APPROVAL QUEUE', badge: pendingApprovals?.length },
              { id: 'costs', label: 'COST CONTROL' },
              { id: 'agents', label: 'AGENT STATUS' },
              { id: 'handoffs', label: 'AGENT REQUESTS' },
              { id: 'insights', label: 'AGENT INSIGHTS' },
              { id: 'specialists', label: 'QUICK ACCESS' },
              { id: 'preferences', label: 'SETTINGS' },
              { id: 'health', label: 'SYSTEM HEALTH' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 text-xs uppercase tracking-wide transition-colors ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-black text-black' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'approvals' && (
          <div>
            <h2 className="font-serif text-2xl font-light mb-6">PENDING APPROVALS</h2>
            
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
            <h2 className="font-serif text-2xl font-light mb-6">AGENT INSIGHTS</h2>
            <AgentInsightsDashboard />
          </div>
        )}

        {activeTab === 'specialists' && (
          <div>
            <h2 className="font-serif text-2xl font-light mb-6">QUICK SPECIALIST ACCESS</h2>
            <QuickSpecialistAccess />
          </div>
        )}

        {activeTab === 'preferences' && (
          <div>
            <h2 className="font-serif text-2xl font-light mb-6">NOTIFICATION SETTINGS</h2>
            <NotificationPreferences />
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <h2 className="font-serif text-2xl font-light mb-6">SYSTEM HEALTH MONITORING</h2>
            <SystemHealthMonitor />
          </div>
        )}
        
        {/* Other tab content sections... */}
      </div>
    </div>
  );
}