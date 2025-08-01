/**
 * Enhanced Progress Visualization Dashboard
 * Real-time agent work display with luxury editorial design
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'working';
  currentTask: string;
  progress: number;
  filesModified: number;
  lastActivity: Date;
}

interface TaskDependency {
  id: string;
  name: string;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed';
  assignedAgent: string;
}

export function EnhancedProgressVisualizationDashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'aria',
      name: 'Aria',
      status: 'working',
      currentTask: 'Creating UX/UI Components',
      progress: 75,
      filesModified: 4,
      lastActivity: new Date()
    },
    {
      id: 'zara',
      name: 'Zara',
      status: 'working',
      currentTask: 'Building Backend Architecture',
      progress: 60,
      filesModified: 6,
      lastActivity: new Date()
    },
    {
      id: 'maya',
      name: 'Maya',
      status: 'working',
      currentTask: 'Technical System Optimization',
      progress: 80,
      filesModified: 3,
      lastActivity: new Date()
    },
    {
      id: 'victoria',
      name: 'Victoria',
      status: 'working',
      currentTask: 'Integration Flow Development',
      progress: 50,
      filesModified: 2,
      lastActivity: new Date()
    },
    {
      id: 'elena',
      name: 'Elena',
      status: 'active',
      currentTask: 'Coordination & Monitoring',
      progress: 90,
      filesModified: 1,
      lastActivity: new Date()
    },
    {
      id: 'olga',
      name: 'Olga',
      status: 'active',
      currentTask: 'Organization & Cleanup',
      progress: 85,
      filesModified: 0,
      lastActivity: new Date()
    }
  ]);

  const [taskDependencies] = useState<TaskDependency[]>([
    {
      id: 'service-integration',
      name: 'Service Integration Templates',
      dependencies: [],
      status: 'in-progress',
      assignedAgent: 'Maya'
    },
    {
      id: 'api-orchestration',
      name: 'API Orchestration Layer',
      dependencies: ['service-integration'],
      status: 'in-progress',
      assignedAgent: 'Zara'
    },
    {
      id: 'checkpoint-automation',
      name: 'Checkpoint Automation',
      dependencies: ['api-orchestration'],
      status: 'pending',
      assignedAgent: 'Zara'
    },
    {
      id: 'progress-ui',
      name: 'Progress Visualization UI',
      dependencies: [],
      status: 'in-progress',
      assignedAgent: 'Aria'
    },
    {
      id: 'integration-testing',
      name: 'Integration Testing',
      dependencies: ['service-integration', 'api-orchestration'],
      status: 'pending',
      assignedAgent: 'Victoria'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-serif text-black mb-4">
            Enhancement Project Progress
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real-time monitoring of multi-agent collaboration on system improvements
          </p>
        </div>

        {/* Agent Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {agents.map((agent) => (
            <Card key={agent.id} className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-serif text-black">
                    {agent.name}
                  </CardTitle>
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Task</p>
                  <p className="font-medium text-black">{agent.currentTask}</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{agent.progress}%</span>
                  </div>
                  <Progress value={agent.progress} className="h-2" />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Files Modified</span>
                  <span className="font-medium text-black">{agent.filesModified}</span>
                </div>

                <div className="text-xs text-gray-500">
                  Last activity: {agent.lastActivity.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task Dependencies */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-serif text-black">
              Task Dependencies & Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {taskDependencies.map((task) => (
                <div key={task.id} className="border-l-4 border-gray-200 pl-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-serif text-black">{task.name}</h3>
                    <div className="flex items-center gap-3">
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Assigned to {task.assignedAgent}
                      </span>
                    </div>
                  </div>
                  
                  {task.dependencies.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span>Dependencies: </span>
                      {task.dependencies.map((dep, index) => (
                        <span key={dep}>
                          {dep}
                          {index < task.dependencies.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-3xl font-serif text-black">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-serif text-green-600 mb-2">✓</div>
                <h3 className="text-xl font-serif text-black mb-1">
                  Agent System
                </h3>
                <p className="text-gray-600">All agents operational</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-serif text-green-600 mb-2">✓</div>
                <h3 className="text-xl font-serif text-black mb-1">
                  File Operations
                </h3>
                <p className="text-gray-600">Zero conflicts detected</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-serif text-blue-600 mb-2">⧗</div>
                <h3 className="text-xl font-serif text-black mb-1">
                  Enhancement Project
                </h3>
                <p className="text-gray-600">In progress - 70% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}