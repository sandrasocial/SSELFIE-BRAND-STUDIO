import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  Monitor, 
  Cpu, 
  Database, 
  Globe, 
  Users,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  name: string;
  type: 'service' | 'agent' | 'api' | 'database';
  status: 'running' | 'idle' | 'error' | 'stopped';
  cpu: number;
  memory: number;
  lastActivity: Date;
  connections: string[];
}

interface WorkflowMetrics {
  totalRequests: number;
  activeAgents: number;
  systemLoad: number;
  uptime: string;
  lastDeployment: Date;
}

export default function WorkflowVisualizationDashboard() {
  const [workflows] = useState<WorkflowNode[]>([
    {
      id: 'vite-dev',
      name: 'Vite Development Server',
      type: 'service',
      status: 'running',
      cpu: 25,
      memory: 180,
      lastActivity: new Date(),
      connections: ['express-server', 'hmr-websocket']
    },
    {
      id: 'express-server',
      name: 'Express Backend',
      type: 'service',
      status: 'running',
      cpu: 15,
      memory: 145,
      lastActivity: new Date(Date.now() - 30000),
      connections: ['postgres-db', 'agent-system']
    },
    {
      id: 'agent-system',
      name: 'Autonomous Agent System',
      type: 'agent',
      status: 'running',
      cpu: 35,
      memory: 220,
      lastActivity: new Date(Date.now() - 5000),
      connections: ['aria-agent', 'maya-agent', 'victoria-agent']
    },
    {
      id: 'postgres-db',
      name: 'PostgreSQL Database',
      type: 'database',
      status: 'running',
      cpu: 8,
      memory: 95,
      lastActivity: new Date(Date.now() - 10000),
      connections: ['express-server']
    },
    {
      id: 'aria-agent',
      name: 'Aria (UX/UI Agent)',
      type: 'agent',
      status: 'running',
      cpu: 12,
      memory: 65,
      lastActivity: new Date(Date.now() - 120000),
      connections: ['agent-system']
    },
    {
      id: 'maya-agent',
      name: 'Maya (AI Photoshoot)',
      type: 'agent',
      status: 'idle',
      cpu: 5,
      memory: 32,
      lastActivity: new Date(Date.now() - 300000),
      connections: ['agent-system']
    }
  ]);

  const [metrics] = useState<WorkflowMetrics>({
    totalRequests: 1847,
    activeAgents: 4,
    systemLoad: 28,
    uptime: '2h 15m',
    lastDeployment: new Date(Date.now() - 7200000)
  });

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  const getStatusIcon = (status: WorkflowNode['status']) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'idle': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'stopped': return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status: WorkflowNode['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'idle': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'stopped': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'service': return <Monitor className="h-4 w-4" />;
      case 'agent': return <Users className="h-4 w-4" />;
      case 'api': return <Globe className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Workflow Visualization</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time system monitoring and workflow orchestration
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Pause className="mr-2 h-4 w-4" />
            Pause All
          </Button>
          <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            <Play className="mr-2 h-4 w-4" />
            Start Workflow
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {metrics.totalRequests.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-black dark:text-white">{metrics.activeAgents}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Agents</div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-black dark:text-white">{metrics.systemLoad}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">System Load</div>
              </div>
              <Cpu className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-black dark:text-white">{metrics.uptime}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node List */}
        <Card>
          <CardHeader>
            <CardTitle>System Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflows.map((node) => (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(node.type)}
                    <div>
                      <div className="font-medium text-black dark:text-white">{node.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        CPU: {node.cpu}% • Memory: {node.memory}MB
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(node.status)}
                    <Badge className={getStatusBadgeColor(node.status)}>
                      {node.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Node Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedNode ? selectedNode.name : 'Select a Component'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedNode.type)}
                  <Badge className={getStatusBadgeColor(selectedNode.status)}>
                    {selectedNode.status}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</div>
                    <Progress value={selectedNode.cpu} className="mt-1" />
                    <div className="text-sm text-gray-500 mt-1">{selectedNode.cpu}%</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</div>
                    <Progress value={(selectedNode.memory / 500) * 100} className="mt-1" />
                    <div className="text-sm text-gray-500 mt-1">{selectedNode.memory}MB</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Activity</div>
                    <div className="text-sm text-black dark:text-white">
                      {selectedNode.lastActivity.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Connections</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.connections.map((connection) => (
                        <Badge key={connection} variant="outline">
                          {connection}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Click on a component to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}