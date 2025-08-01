/**
 * Progress Visualization Dashboard - Real-time multi-agent progress tracking
 * SSELFIE Studio Enhancement Project - Aria Implementation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Target,
  Zap,
  Timer,
  BarChart3,
  RefreshCw,
  Eye,
  Calendar
} from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  currentTask?: {
    id: string;
    name: string;
    progress: number;
    estimatedCompletion: Date;
  };
  tasksCompleted: number;
  tasksAssigned: number;
  efficiency: number;
  lastActivity: Date;
}

interface WorkflowProgress {
  id: string;
  name: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  estimatedCompletion: Date | null;
  milestones: Array<{
    name: string;
    completed: boolean;
    completedAt?: Date;
  }>;
}

interface SystemMetrics {
  tasksPerHour: number;
  averageTaskDuration: number;
  systemEfficiency: number;
  uptime: number;
  errorRate: number;
  collaborationIndex: number;
}

export default function ProgressVisualizationDashboard() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'victoria',
      name: 'Victoria',
      avatar: '👩‍💼',
      status: 'active',
      currentTask: {
        id: 'backend-services',
        name: 'Backend Services Integration',
        progress: 100,
        estimatedCompletion: new Date(Date.now() + 0)
      },
      tasksCompleted: 6,
      tasksAssigned: 6,
      efficiency: 100,
      lastActivity: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 'aria',
      name: 'Aria',
      avatar: '🎨',
      status: 'busy',
      currentTask: {
        id: 'ui-components',
        name: 'Luxury UI Components',
        progress: 75,
        estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000)
      },
      tasksCompleted: 2,
      tasksAssigned: 3,
      efficiency: 85,
      lastActivity: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: 'maya',
      name: 'Maya',
      avatar: '🔧',
      status: 'active',
      currentTask: {
        id: 'system-integration',
        name: 'System Integration',
        progress: 90,
        estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000)
      },
      tasksCompleted: 3,
      tasksAssigned: 4,
      efficiency: 95,
      lastActivity: new Date(Date.now() - 1 * 60 * 1000)
    },
    {
      id: 'zara',
      name: 'Zara',
      avatar: '📊',
      status: 'idle',
      tasksCompleted: 1,
      tasksAssigned: 2,
      efficiency: 78,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'elena',
      name: 'Elena',
      avatar: '🧠',
      status: 'active',
      currentTask: {
        id: 'memory-optimization',
        name: 'Memory System Optimization',
        progress: 100,
        estimatedCompletion: new Date(Date.now() + 0)
      },
      tasksCompleted: 4,
      tasksAssigned: 4,
      efficiency: 100,
      lastActivity: new Date(Date.now() - 3 * 60 * 1000)
    },
    {
      id: 'rachel',
      name: 'Rachel',
      avatar: '🔍',
      status: 'idle',
      tasksCompleted: 0,
      tasksAssigned: 1,
      efficiency: 0,
      lastActivity: new Date(Date.now() - 45 * 60 * 1000)
    }
  ]);

  const [workflow, setWorkflow] = useState<WorkflowProgress>({
    id: 'enhancement_implementation',
    name: 'Enhancement Project Implementation',
    progress: 75,
    totalTasks: 13,
    completedTasks: 8,
    inProgressTasks: 3,
    blockedTasks: 0,
    estimatedCompletion: new Date(Date.now() + 25 * 60 * 1000),
    milestones: [
      { name: 'Backend Services', completed: true, completedAt: new Date(Date.now() - 60 * 60 * 1000) },
      { name: 'Service Integration', completed: true, completedAt: new Date(Date.now() - 45 * 60 * 1000) },
      { name: 'UI Components', completed: false },
      { name: 'System Integration', completed: false },
      { name: 'Testing & QA', completed: false }
    ]
  });

  const [metrics, setMetrics] = useState<SystemMetrics>({
    tasksPerHour: 12,
    averageTaskDuration: 25,
    systemEfficiency: 87,
    uptime: 24,
    errorRate: 3,
    collaborationIndex: 83
  });

  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Update agent progress
      setAgents(prev => prev.map(agent => {
        if (agent.currentTask && agent.status === 'busy') {
          const newProgress = Math.min(100, agent.currentTask.progress + Math.random() * 5);
          return {
            ...agent,
            currentTask: {
              ...agent.currentTask,
              progress: newProgress
            },
            lastActivity: new Date()
          };
        }
        return agent;
      }));

      // Update workflow progress
      setWorkflow(prev => ({
        ...prev,
        progress: Math.min(100, prev.progress + Math.random() * 2),
        lastUpdate: new Date()
      }));

      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'busy': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'idle': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'offline': return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'busy': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'idle': return <Clock className="h-4 w-4 text-amber-600" />;
      case 'offline': return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Progress Dashboard</h2>
          <p className="text-gray-600 mt-1">Real-time multi-agent collaboration monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {isLive ? 'Live' : 'Paused'}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Tasks/Hour</p>
                <p className="text-xl font-semibold">{metrics.tasksPerHour}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-xl font-semibold">{metrics.averageTaskDuration}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Efficiency</p>
                <p className="text-xl font-semibold">{metrics.systemEfficiency}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-xl font-semibold">{metrics.uptime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-xl font-semibold">{metrics.errorRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Collaboration</p>
                <p className="text-xl font-semibold">{metrics.collaborationIndex}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Workflow Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Enhancement Project Progress
              </CardTitle>
              <CardDescription>Overall implementation status and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{workflow.progress}% Complete</span>
                </div>
                <Progress value={workflow.progress} className="h-2" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{workflow.completedTasks}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{workflow.inProgressTasks}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{workflow.blockedTasks}</div>
                    <div className="text-sm text-gray-600">Blocked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{workflow.totalTasks}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.filter(agent => agent.status !== 'offline').map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{agent.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{agent.name}</h4>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                      {agent.currentTask && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-600 truncate">{agent.currentTask.name}</p>
                          <Progress value={agent.currentTask.progress} className="h-1 mt-1" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{agent.avatar}</div>
                      <div>
                        <CardTitle>{agent.name}</CardTitle>
                        <CardDescription>AI Agent</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {getStatusIcon(agent.status)}
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agent.currentTask && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">Current Task</h4>
                          <span className="text-sm text-gray-600">{agent.currentTask.progress}%</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{agent.currentTask.name}</p>
                        <Progress value={agent.currentTask.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          ETA: {agent.currentTask.estimatedCompletion.toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">{agent.tasksCompleted}</div>
                        <div className="text-xs text-gray-600">Completed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{agent.tasksAssigned}</div>
                        <div className="text-xs text-gray-600">Assigned</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{agent.efficiency}%</div>
                        <div className="text-xs text-gray-600">Efficiency</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Last activity: {agent.lastActivity.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
              <CardDescription>Project milestone completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {milestone.completed ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-medium ${milestone.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                        {milestone.name}
                      </h4>
                      {milestone.completedAt && (
                        <p className="text-sm text-gray-500">
                          Completed: {milestone.completedAt.toLocaleString()}
                        </p>
                      )}
                    </div>
                    {milestone.completed && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Complete
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  Performance chart would be rendered here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{agent.avatar}</span>
                        <span className="text-sm font-medium">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={agent.efficiency} className="w-16 h-2" />
                        <span className="text-sm text-gray-600 w-8">{agent.efficiency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}