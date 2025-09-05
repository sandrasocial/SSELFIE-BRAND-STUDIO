import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Link } from 'wouter';
import { Badge } from './ui/badge';

interface AgentInsight {
  id: string;
  agentName: string;
  insightType: 'strategic' | 'technical' | 'operational' | 'urgent';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  context: Record<string, any>;
  triggerReason: string;
  timestamp: string;
  isRead: boolean;
  actionTaken?: string;
}

interface InsightStats {
  total: number;
  today: number;
  thisWeek: number;
  unread: number;
  byType: {
    strategic: number;
    technical: number;
    operational: number;
    urgent: number;
  };
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  topAgents: Array<{ agent: string; count: number }>;
}

// Agent emoji mapping
const AGENT_EMOJIS: Record<string, string> = {
  'elena': '👑',
  'aria': '🎨',
  'zara': '⚡',
  'maya': '✨',
  'victoria': '📊',
  'rachel': '✍️',
  'ava': '🤖',
  'quinn': '🔍',
  'sophia': '📱',
  'martha': '📈',
  'diana': '📋',
  'wilma': '⚙️',
  'olga': '🗂️',
  'flux': '🎯'
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'strategic': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'technical': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'operational': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function AgentInsightsDashboard() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | string>('all');
  const [selectedAgent, setSelectedAgent] = useState<'all' | string>('all');
  const queryClient = useQueryClient();

  // Get insights data
  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['/api/agent-insights-data/recent', selectedFilter, selectedAgent],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get insights statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/agent-insights-data/stats'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Mark insight as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const response = await fetch(`/api/agent-insights-data/mark-read/${insightId}`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-insights-data/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agent-insights-data/stats'] });
    }
  });

  const insights: AgentInsight[] = insightsData?.insights || [];
  const stats: InsightStats = statsData?.stats || {
    total: 0, today: 0, thisWeek: 0, unread: 0,
    byType: { strategic: 0, technical: 0, operational: 0, urgent: 0 },
    byPriority: { high: 0, medium: 0, low: 0 },
    topAgents: []
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-light">{stats.unread}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Unread Insights</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-light">{stats.today}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Today</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-light">{stats.thisWeek}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">This Week</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-light">{stats.total}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Insights</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
          >
            All Types
          </Button>
          <Button
            variant={selectedFilter === 'strategic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('strategic')}
          >
            Strategic
          </Button>
          <Button
            variant={selectedFilter === 'technical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('technical')}
          >
            Technical
          </Button>
          <Button
            variant={selectedFilter === 'operational' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('operational')}
          >
            Operational
          </Button>
          <Button
            variant={selectedFilter === 'urgent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('urgent')}
          >
            Urgent
          </Button>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">No insights yet</div>
            <div className="text-sm">Your agents will start sending proactive insights based on system analysis</div>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`border border-gray-200 bg-white p-6 transition-all ${
                !insight.isRead ? 'border-l-4 border-l-black bg-gray-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{AGENT_EMOJIS[insight.agentName] || '🤖'}</span>
                  <div>
                    <div className="font-medium capitalize">{insight.agentName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(insight.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority}
                  </Badge>
                  <Badge className={getTypeColor(insight.insightType)}>
                    {insight.insightType}
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-lg mb-2">{insight.title}</h3>
                <p className="text-gray-700 leading-relaxed">{insight.message}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Trigger: {insight.triggerReason}
                </div>
                <div className="flex gap-2">
                  {!insight.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markReadMutation.mutate(insight.id)}
                      disabled={markReadMutation.isPending}
                    >
                      Mark Read
                    </Button>
                  )}
                  <Link href={`/admin-consulting-agents?agent=${insight.agentName}`}>
                    <Button size="sm">
                      Chat with {insight.agentName.charAt(0).toUpperCase() + insight.agentName.slice(1)}
                    </Button>
                  </Link>
                </div>
              </div>

              {insight.actionTaken && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm font-medium text-green-800">Action Taken:</div>
                  <div className="text-sm text-green-700">{insight.actionTaken}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Top Insights Agents */}
      {stats.topAgents.length > 0 && (
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="font-medium text-lg mb-4">Most Active Insight Agents</h3>
          <div className="grid grid-cols-5 gap-4">
            {stats.topAgents.map((agent) => (
              <div key={agent.agent} className="text-center">
                <div className="text-2xl mb-1">{AGENT_EMOJIS[agent.agent] || '🤖'}</div>
                <div className="text-sm font-medium capitalize">{agent.agent}</div>
                <div className="text-xs text-gray-500">{agent.count} insights</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}