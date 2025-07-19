import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

interface CoordinationMetrics {
  activeWorkflows: number;
  agentsWorking: number;
  filesCreatedToday: number;
  averageResponseTime: number;
  successRate: number;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'working' | 'idle';
  currentTask: string;
  lastActivity: string;
  filesCreated: number;
  efficiency: number;
}

export default function AgentCoordinationDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const { data: metrics, isLoading: metricsLoading } = useQuery<CoordinationMetrics>({
    queryKey: ['/api/agent-coordination-metrics'],
    refetchInterval: refreshInterval,
    staleTime: 0
  });

  const { data: agentStatuses, isLoading: statusesLoading } = useQuery<AgentStatus[]>({
    queryKey: ['/api/agent-statuses'],
    refetchInterval: refreshInterval,
    staleTime: 0
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) return { color: 'bg-green-100 text-green-800', label: 'EXCELLENT' };
    if (efficiency >= 70) return { color: 'bg-yellow-100 text-yellow-800', label: 'GOOD' };
    if (efficiency >= 50) return { color: 'bg-orange-100 text-orange-800', label: 'AVERAGE' };
    return { color: 'bg-red-100 text-red-800', label: 'NEEDS IMPROVEMENT' };
  };

  if (metricsLoading || statusesLoading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-Time Metrics */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
              Real-Time Coordination Metrics
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Live • Refreshing every {refreshInterval/1000}s</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50">
                <div className="text-2xl font-bold text-black">{metrics.activeWorkflows}</div>
                <div className="text-sm text-gray-600">Active Workflows</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50">
                <div className="text-2xl font-bold text-green-600">{metrics.agentsWorking}</div>
                <div className="text-sm text-gray-600">Agents Working</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50">
                <div className="text-2xl font-bold text-blue-600">{metrics.filesCreatedToday}</div>
                <div className="text-sm text-gray-600">Files Created Today</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50">
                <div className="text-2xl font-bold text-purple-600">{metrics.averageResponseTime}s</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50">
                <div className="text-2xl font-bold text-orange-600">{metrics.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Status Grid */}
      <Card className="border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            Agent Status & Performance
          </h3>
          <p className="text-sm text-gray-600">Real-time monitoring of all AI agents</p>
        </CardHeader>
        <CardContent>
          {agentStatuses && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentStatuses.map((agent) => {
                const efficiencyBadge = getEfficiencyBadge(agent.efficiency);
                
                return (
                  <div key={agent.id} className="border border-gray-200 p-4 bg-white">
                    <div className="space-y-3">
                      {/* Agent Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm capitalize">{agent.name}</h4>
                          <div className="text-xs text-gray-500">{agent.id}</div>
                        </div>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Current Task */}
                      <div>
                        <div className="text-xs font-medium text-gray-700">Current Task:</div>
                        <div className="text-xs text-gray-600">
                          {agent.currentTask.length > 50 
                            ? `${agent.currentTask.substring(0, 50)}...` 
                            : agent.currentTask
                          }
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs font-medium text-gray-700">Files Created</div>
                          <div className="text-lg font-bold text-green-600">{agent.filesCreated}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-700">Efficiency</div>
                          <div className="flex items-center gap-1">
                            <div className="text-lg font-bold">{agent.efficiency}%</div>
                            <Badge className={`${efficiencyBadge.color} text-xs`}>
                              {efficiencyBadge.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Last Activity */}
                      <div>
                        <div className="text-xs font-medium text-gray-700">Last Activity:</div>
                        <div className="text-xs text-gray-600">{agent.lastActivity}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coordination Controls */}
      <Card className="border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            Coordination Controls
          </h3>
          <p className="text-sm text-gray-600">Manage agent workflows and performance</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="text-xs">
              Pause All Agents
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Resume All Agents
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Clear All Tasks
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Export Metrics
            </Button>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Refresh Interval:</label>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-200 p-1"
            >
              <option value={2000}>2 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}