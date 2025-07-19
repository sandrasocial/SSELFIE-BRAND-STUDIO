import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface UtilizationData {
  recommendations: string[];
  efficiency: number;
  bottlenecks: string[];
}

interface CoordinationMetrics {
  activeWorkflows: number;
  agentsWorking: number;
  filesCreatedToday: number;
  averageResponseTime: number;
  successRate: number;
  totalConversations: number;
  handoffEfficiency: number;
  coordinationScore: number;
}

export default function AgentUtilizationOptimizer() {
  const queryClient = useQueryClient();

  // Get coordination metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<CoordinationMetrics>({
    queryKey: ['/api/agent-coordination-metrics'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Get utilization optimization
  const { data: utilization, isLoading: utilizationLoading } = useQuery<UtilizationData>({
    queryKey: ['/api/workflows/optimize-utilization'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Refresh metrics mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/agent-coordination-metrics'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/workflows/optimize-utilization'] });
    }
  });

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadgeColor = (efficiency: number) => {
    if (efficiency >= 80) return 'bg-green-100 text-green-800';
    if (efficiency >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (metricsLoading || utilizationLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Agent Utilization Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Analyzing agent utilization...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-Time Metrics Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Real-Time Coordination Metrics
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
            >
              {refreshMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-900">{metrics?.activeWorkflows || 0}</div>
              <div className="text-sm text-blue-700">Active Workflows</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-900">{metrics?.agentsWorking || 0}</div>
              <div className="text-sm text-green-700">Agents Working</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-900">{metrics?.filesCreatedToday || 0}</div>
              <div className="text-sm text-purple-700">Files Created Today</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Zap className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-900">{metrics?.averageResponseTime || 0}s</div>
              <div className="text-sm text-orange-700">Avg Response Time</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-medium">{metrics?.successRate || 0}%</span>
              </div>
              <Progress value={metrics?.successRate || 0} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Coordination Score</span>
                <span className="font-medium">{metrics?.coordinationScore || 0}%</span>
              </div>
              <Progress value={metrics?.coordinationScore || 0} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Handoff Efficiency</span>
                <span className="font-medium">{metrics?.handoffEfficiency || 0}</span>
              </div>
              <Progress value={(metrics?.handoffEfficiency || 0) * 5} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utilization Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Agent Utilization Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Efficiency Score */}
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className={`text-4xl font-bold ${getEfficiencyColor(utilization?.efficiency || 0)}`}>
              {utilization?.efficiency || 0}%
            </div>
            <div className="text-lg text-gray-600 mt-2">Overall Efficiency</div>
            <Badge className={`mt-2 ${getEfficiencyBadgeColor(utilization?.efficiency || 0)}`}>
              {utilization?.efficiency >= 80 ? 'Excellent' : 
               utilization?.efficiency >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>

          {/* Bottlenecks */}
          {utilization?.bottlenecks && utilization.bottlenecks.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-900">Detected Bottlenecks</h3>
              </div>
              <div className="space-y-2">
                {utilization.bottlenecks.map((agent, index) => (
                  <Badge key={index} variant="destructive" className="mr-2">
                    {agent.charAt(0).toUpperCase() + agent.slice(1)} - Overloaded
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Optimization Recommendations */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Optimization Recommendations
            </h3>
            <div className="space-y-2">
              {utilization?.recommendations?.map((recommendation, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-900 text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}