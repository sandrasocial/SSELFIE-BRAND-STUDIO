import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, Clock, Users, Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  currentTask: string;
  progress: number;
  lastActivity: string;
  timeRemaining: string;
}

interface WorkflowTask {
  id: string;
  name: string;
  assignedAgent: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startTime: Date | null;
  completedTime: Date | null;
  estimatedDuration: string;
}

interface ElenaCoordinationPanelProps {
  onAgentSelect?: (agentId: string) => void;
  currentWorkflow?: string;
}

export function ElenaCoordinationPanel({ onAgentSelect, currentWorkflow }: ElenaCoordinationPanelProps) {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { id: 'aria', name: 'Aria', status: 'idle', currentTask: 'Awaiting design tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
    { id: 'zara', name: 'Zara', status: 'idle', currentTask: 'Awaiting development tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
    { id: 'rachel', name: 'Rachel', status: 'idle', currentTask: 'Awaiting copywriting tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
    { id: 'ava', name: 'Ava', status: 'idle', currentTask: 'Awaiting automation tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
    { id: 'quinn', name: 'Quinn', status: 'idle', currentTask: 'Awaiting QA tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
    { id: 'sophia', name: 'Sophia', status: 'idle', currentTask: 'Awaiting social media tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
    { id: 'martha', name: 'Martha', status: 'idle', currentTask: 'Awaiting marketing tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
    { id: 'diana', name: 'Diana', status: 'idle', currentTask: 'Awaiting business tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
    { id: 'wilma', name: 'Wilma', status: 'idle', currentTask: 'Awaiting workflow tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
    { id: 'olga', name: 'Olga', status: 'idle', currentTask: 'Awaiting organization tasks', progress: 0, lastActivity: 'Ready', timeRemaining: '--' },
  ]);

  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Monitor agent activities and update statuses
  useEffect(() => {
    if (!isMonitoring) return;

    const monitorInterval = setInterval(async () => {
      try {
        // Check agent conversation database for recent activity
        const response = await fetch('/api/admin/agent-activity-monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminToken: 'sandra-admin-2025' })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.agentStatuses) {
            setAgentStatuses(data.agentStatuses);
          }
          if (data.workflowTasks) {
            setWorkflowTasks(data.workflowTasks);
          }
        }
      } catch (error) {
        console.error('Agent monitoring error:', error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(monitorInterval);
  }, [isMonitoring]);

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'working': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: AgentStatus['status']) => {
    const colors = {
      idle: 'bg-gray-200 text-gray-700',
      working: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.idle;
  };

  const activeAgents = agentStatuses.filter(agent => agent.status === 'working').length;
  const completedTasks = workflowTasks.filter(task => task.status === 'completed').length;
  const totalTasks = workflowTasks.length;

  return (
    <div className="p-4 space-y-4" style={{ fontFamily: '"Times New Roman", serif' }}>
      {/* Elena's Control Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-black">Elena's Agent Command Center</h3>
            <p className="text-sm text-gray-600">Live monitoring and coordination of all AI agents</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                // Signal to parent component to clear Elena chat
                if (onAgentSelect) {
                  // This will trigger a fresh chat with Elena
                  onAgentSelect('elena');
                }
              }}
              variant="ghost"
              size="sm"
              className="text-xs flex items-center gap-1"
            >
              <span className="text-sm">+</span>
              New Elena Chat
            </Button>
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? 'default' : 'outline'}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{isMonitoring ? 'Monitoring Active' : 'Start Monitoring'}</span>
            </Button>
          </div>
        </div>
        
        {/* Status Overview */}
        <div className="flex items-center space-x-4 mt-3 text-sm">
          <div className="flex items-center space-x-1">
            <Activity className="h-4 w-4 text-blue-600" />
            <span>{activeAgents} Working</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-gray-600" />
            <span>{agentStatuses.length} Total Agents</span>
          </div>
          {totalTasks > 0 && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{completedTasks}/{totalTasks} Tasks</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Workflow Progress */}
      {currentWorkflow && workflowTasks.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-2 text-black">Current Workflow: {currentWorkflow}</h4>
          <div className="space-y-2">
            {workflowTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="text-sm font-medium">{task.name}</span>
                  <div className="text-xs text-gray-500">
                    Assigned to {task.assignedAgent} • {task.estimatedDuration}
                  </div>
                </div>
                <Badge className={getStatusBadge(task.status as any)}>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
          
          {totalTasks > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Workflow Progress</span>
                <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
              </div>
              <Progress value={(completedTasks / totalTasks) * 100} className="h-2" />
            </div>
          )}
        </Card>
      )}

      {/* Agent Status Grid */}
      <div className="grid grid-cols-2 gap-3">
        {agentStatuses.map(agent => (
          <Card 
            key={agent.id}
            className={`p-3 cursor-pointer border transition-colors ${
              agent.status === 'working' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onAgentSelect?.(agent.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(agent.status)}
                <span className="font-medium text-sm">{agent.name}</span>
              </div>
              <Badge className={`text-xs ${getStatusBadge(agent.status)}`}>
                {agent.status}
              </Badge>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              {agent.currentTask}
            </div>
            
            {agent.status === 'working' && agent.progress > 0 && (
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{agent.progress}%</span>
                </div>
                <Progress value={agent.progress} className="h-1" />
              </div>
            )}
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Last: {agent.lastActivity}</span>
              {agent.timeRemaining !== '--' && (
                <span>ETA: {agent.timeRemaining}</span>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium mb-2 text-black">Elena's Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Trigger Elena to check all agent status
              fetch('/api/admin/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  agentId: 'elena',
                  message: 'Please provide current status update on all agents and their work progress',
                  adminToken: 'sandra-admin-2025'
                })
              });
            }}
          >
            Status Update
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Ask Elena to coordinate agents
              fetch('/api/admin/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  agentId: 'elena',
                  message: 'Coordinate all agents to report their current tasks and progress',
                  adminToken: 'sandra-admin-2025'
                })
              });
            }}
          >
            Coordinate All
          </Button>
        </div>
      </div>
    </div>
  );
}