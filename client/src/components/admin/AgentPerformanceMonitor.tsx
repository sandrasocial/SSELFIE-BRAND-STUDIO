import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AgentPerformance {
  agentId: string;
  totalConversations: number;
  recentActivity: number;
  filesCreated: number;
  lastActivity: string;
  minutesSinceLastActivity: number;
  currentStatus: 'active' | 'working' | 'idle';
  aiSpeedRating: number;
  deliveryEfficiency: number;
}

interface PerformanceData {
  timestamp: string;
  totalActiveAgents: number;
  averageResponseTime: number;
  totalFilesCreated: number;
  agents: AgentPerformance[];
}

export default function AgentPerformanceMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: performanceData, isLoading, refetch } = useQuery<PerformanceData>({
    queryKey: ['/api/agent-performance/live'],
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds
    staleTime: 0
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'working': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getSpeedRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-600';
    if (rating >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
              AI Team Performance Monitor
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
              >
                {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {performanceData && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{performanceData.totalActiveAgents}</div>
                <div className="text-sm text-gray-600">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{performanceData.totalFilesCreated}</div>
                <div className="text-sm text-gray-600">Files Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {Math.round(performanceData.averageResponseTime)}m
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {new Date(performanceData.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600">Last Updated</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Agent Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceData?.agents.map((agent) => (
          <Card key={agent.agentId} className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium capitalize">{agent.agentId}</h4>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.currentStatus)}`}></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* AI Speed Rating */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AI Speed Rating</span>
                <span className={`font-bold ${getSpeedRatingColor(agent.aiSpeedRating)}`}>
                  {agent.aiSpeedRating}/100
                </span>
              </div>

              {/* File Creation Efficiency */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Delivery Rate</span>
                <span className="font-medium">
                  {Math.round(agent.deliveryEfficiency)}%
                </span>
              </div>

              {/* Recent Activity */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recent Activity</span>
                <span className="font-medium">{agent.recentActivity} msgs</span>
              </div>

              {/* Files Created */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Files Created</span>
                <span className="font-medium">{agent.filesCreated}</span>
              </div>

              {/* Last Activity */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Active</span>
                <span className="font-medium">
                  {agent.minutesSinceLastActivity < 1 ? 'Now' : `${agent.minutesSinceLastActivity}m ago`}
                </span>
              </div>

              {/* Status Badge */}
              <div className="pt-2 border-t border-gray-100">
                <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                  agent.currentStatus === 'active' ? 'bg-green-100 text-green-800' :
                  agent.currentStatus === 'working' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {agent.currentStatus.toUpperCase()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}