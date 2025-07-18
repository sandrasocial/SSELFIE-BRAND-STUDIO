import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AgentMetric {
  agentId: string;
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  successRate: number;
  userSatisfaction: number;
  efficiency: number;
  lastActive: Date;
  status: 'active' | 'low' | 'inactive';
}

interface PerformanceData {
  topPerformers: AgentMetric[];
  underutilizedAgents: AgentMetric[];
  workflowBottlenecks: string[];
  optimizationSuggestions: string[];
  overallEfficiency: number;
}

export default function AgentAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/admin/agent-performance', timeframe],
    queryFn: async () => {
      const response = await fetch('/api/admin/agent-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe })
      });
      return response.json();
    }
  });

  const { data: utilizationReport, isLoading: utilizationLoading } = useQuery({
    queryKey: ['/api/admin/agent-utilization'],
    queryFn: async () => {
      const response = await fetch('/api/admin/agent-utilization');
      return response.json();
    }
  });

  const { data: workflowAnalytics, isLoading: workflowLoading } = useQuery({
    queryKey: ['/api/admin/workflow-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/workflow-analytics');
      return response.json();
    }
  });

  const agentNames: Record<string, string> = {
    aria: 'Aria',
    zara: 'Zara',
    rachel: 'Rachel',
    ava: 'Ava',
    quinn: 'Quinn',
    sophia: 'Sophia',
    martha: 'Martha',
    diana: 'Diana',
    wilma: 'Wilma'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'low': return 'text-yellow-600';
      case 'inactive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (performanceLoading || utilizationLoading || workflowLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-black">Agent Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Timeframe:</label>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-sm text-gray-600">Total Agents</div>
          <div className="text-2xl font-bold text-black">{utilizationReport?.summary?.totalAgents || 9}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-sm text-gray-600">Active Agents</div>
          <div className="text-2xl font-bold text-green-600">{utilizationReport?.summary?.activeAgents || 0}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-sm text-gray-600">Avg Efficiency</div>
          <div className="text-2xl font-bold text-blue-600">
            {(performanceData?.overallEfficiency || 0).toFixed(1)}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-sm text-gray-600">Workflow Completion</div>
          <div className="text-2xl font-bold text-purple-600">
            {(workflowAnalytics?.completionRate || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Agent Performance Grid */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-serif text-black">Agent Performance Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {utilizationReport?.agents?.map((agent: any) => (
              <div 
                key={agent.id} 
                className="border border-gray-200 rounded p-4 hover:border-black transition-colors cursor-pointer"
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-black">{agentNames[agent.id]}</h3>
                  <div className={`px-2 py-1 rounded text-xs border ${getStatusBadge(agent.status)}`}>
                    {agent.status}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversations:</span>
                    <span className="font-medium">{agent.conversations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages:</span>
                    <span className="font-medium">{agent.messages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="font-medium">{agent.efficiency.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Satisfaction:</span>
                    <span className="font-medium">{agent.satisfaction.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-serif text-black">Top Performers</h2>
          </div>
          <div className="p-6">
            {performanceData?.topPerformers?.length > 0 ? (
              <div className="space-y-3">
                {performanceData.topPerformers.slice(0, 3).map((agent: AgentMetric, index: number) => (
                  <div key={agent.agentId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      <span className="font-medium">{agentNames[agent.agentId]}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {agent.totalConversations} conversations
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No performance data available for this timeframe
              </div>
            )}
          </div>
        </div>

        {/* Optimization Suggestions */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-serif text-black">Optimization Suggestions</h2>
          </div>
          <div className="p-6">
            {performanceData?.optimizationSuggestions?.length > 0 ? (
              <div className="space-y-2">
                {performanceData.optimizationSuggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                All agents are performing optimally
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Analytics */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-serif text-black">Workflow Analytics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-black mb-3">Stage Distribution</h3>
              <div className="space-y-2">
                {workflowAnalytics?.stageTransitions && Object.entries(workflowAnalytics.stageTransitions)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([stage, count]) => (
                    <div key={stage} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{stage.replace('_', ' ')}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-black mb-3">Agent Distribution</h3>
              <div className="space-y-2">
                {workflowAnalytics?.agentDistribution && Object.entries(workflowAnalytics.agentDistribution)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([agent, count]) => (
                    <div key={agent} className="flex justify-between text-sm">
                      <span className="text-gray-600">{agentNames[agent] || agent}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-black mb-3">Key Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Workflows:</span>
                  <span className="font-medium">{workflowAnalytics?.totalWorkflows || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate:</span>
                  <span className="font-medium">{(workflowAnalytics?.completionRate || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Most Active Stage:</span>
                  <span className="font-medium capitalize">
                    {workflowAnalytics?.trends?.mostActiveStage?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Most Active Agent:</span>
                  <span className="font-medium">
                    {agentNames[workflowAnalytics?.trends?.mostActiveAgent] || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Underutilized Agents Alert */}
      {performanceData?.underutilizedAgents?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Underutilized Agents Alert</h3>
          <p className="text-sm text-yellow-700 mb-3">
            The following agents have low activity and may benefit from increased utilization:
          </p>
          <div className="flex flex-wrap gap-2">
            {performanceData.underutilizedAgents.map((agent: AgentMetric) => (
              <div key={agent.agentId} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                {agentNames[agent.agentId]} ({agent.totalConversations} conversations)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}