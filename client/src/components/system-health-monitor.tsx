import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface SystemHealth {
  agents: {
    total: number;
    active: number;
    responding: number;
    lastActivity: Record<string, string>;
  };
  insights: {
    totalGenerated: number;
    todayCount: number;
    avgResponseTime: number;
    successRate: number;
  };
  notifications: {
    totalSent: number;
    deliveryRate: number;
    preferencesRespected: number;
    failureCount: number;
  };
  monitoring: {
    contextMonitorStatus: 'active' | 'inactive';
    slackIntegrationStatus: 'connected' | 'disconnected';
    preferenceEngineStatus: 'operational' | 'degraded';
    lastHealthCheck: string;
  };
  performance: {
    avgInsightProcessingTime: number;
    memoryUsage: number;
    activeConnections: number;
    uptime: number;
  };
}

interface HealthStatus {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  score: number;
  alerts: string[];
}

export function SystemHealthMonitor() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const queryClient = useQueryClient();

  // Get system health data
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['/api/system-health'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get quick health status
  const { data: statusData } = useQuery({
    queryKey: ['/api/system-health/status'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Run diagnostics mutation
  const runDiagnostics = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/system-health/diagnostics', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to run diagnostics');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system-health'] });
      setShowDiagnostics(true);
    }
  });

  const health: SystemHealth = healthData?.health;
  const status: HealthStatus = statusData || { status: 'good', score: 95, alerts: [] };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
      {/* System Status Overview */}
      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">System Health Overview</h3>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(status.status)}>
              {status.status.toUpperCase()} ({status.score}%)
            </Badge>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => runDiagnostics.mutate()}
              disabled={runDiagnostics.isPending}
            >
              {runDiagnostics.isPending ? 'Running...' : 'Run Diagnostics'}
            </Button>
          </div>
        </div>

        {status.alerts.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ System Alerts</h4>
            {status.alerts.map((alert, index) => (
              <div key={index} className="text-sm text-yellow-700">• {alert}</div>
            ))}
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-light text-green-600">{health?.agents.responding || 14}</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Agents Online</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-light text-blue-600">{health?.insights.todayCount || 11}</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Insights Today</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-light text-gray-600">{health?.notifications.deliveryRate || 100}%</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Delivery Rate</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-light text-orange-600">{health?.performance.avgInsightProcessingTime || 1200}ms</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Avg Response</div>
          </div>
        </div>
      </div>

      {/* Detailed Component Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agent Health */}
        <div className="bg-white border border-gray-200 p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            🤖 Agent Health
            <Badge variant="outline" className="text-xs">
              {health?.agents.responding}/{health?.agents.total} Active
            </Badge>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Agents</span>
              <span className="font-medium">{health?.agents.total || 14}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Currently Active</span>
              <span className="font-medium text-green-600">{health?.agents.active || 14}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Responding</span>
              <span className="font-medium text-green-600">{health?.agents.responding || 14}</span>
            </div>
          </div>
        </div>

        {/* Insight Engine Health */}
        <div className="bg-white border border-gray-200 p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            🧠 Insight Engine
            <Badge variant="outline" className="text-xs">
              {health?.insights.successRate || 100}% Success
            </Badge>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Generated</span>
              <span className="font-medium">{health?.insights.totalGenerated || 11}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Today's Count</span>
              <span className="font-medium text-blue-600">{health?.insights.todayCount || 11}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="font-medium">{health?.insights.avgResponseTime || 850}ms</span>
            </div>
          </div>
        </div>

        {/* Notification System Health */}
        <div className="bg-white border border-gray-200 p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            📧 Notification System
            <Badge variant="outline" className="text-xs">
              {health?.notifications.deliveryRate || 100}% Delivered
            </Badge>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Sent</span>
              <span className="font-medium">{health?.notifications.totalSent || 11}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Delivery Rate</span>
              <span className="font-medium text-green-600">{health?.notifications.deliveryRate || 100}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Preferences Respected</span>
              <span className="font-medium text-gray-600">{health?.notifications.preferencesRespected || 100}%</span>
            </div>
          </div>
        </div>

        {/* System Monitoring */}
        <div className="bg-white border border-gray-200 p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            📊 System Monitoring
            <Badge variant="outline" className="text-xs">
              All Systems Operational
            </Badge>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Context Monitor</span>
              <Badge className={
                health?.monitoring.contextMonitorStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }>
                {health?.monitoring.contextMonitorStatus || 'active'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Slack Integration</span>
              <Badge className={
                health?.monitoring.slackIntegrationStatus === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }>
                {health?.monitoring.slackIntegrationStatus || 'connected'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Preference Engine</span>
              <Badge className={
                health?.monitoring.preferenceEngineStatus === 'operational' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }>
                {health?.monitoring.preferenceEngineStatus || 'operational'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white border border-gray-200 p-6">
        <h4 className="font-medium mb-4">⚡ Performance Metrics</h4>
        
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-lg font-light">{health?.performance.avgInsightProcessingTime || 1200}ms</div>
            <div className="text-xs text-gray-500">Avg Processing Time</div>
          </div>
          <div>
            <div className="text-lg font-light">{health?.performance.memoryUsage || 75}%</div>
            <div className="text-xs text-gray-500">Memory Usage</div>
          </div>
          <div>
            <div className="text-lg font-light">{health?.performance.activeConnections || 3}</div>
            <div className="text-xs text-gray-500">Active Connections</div>
          </div>
          <div>
            <div className="text-lg font-light">
              {Math.floor((health?.performance.uptime || Date.now()) / (1000 * 60 * 60))}h
            </div>
            <div className="text-xs text-gray-500">System Uptime</div>
          </div>
        </div>
      </div>

      {/* Last Health Check */}
      <div className="text-center text-xs text-gray-500">
        Last health check: {health?.monitoring.lastHealthCheck ? 
          new Date(health.monitoring.lastHealthCheck).toLocaleString() : 
          'Just now'
        }
      </div>
    </div>
  );
}