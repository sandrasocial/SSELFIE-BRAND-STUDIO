import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, CheckCircle, Clock, AlertCircle, FileText, Users, Zap } from 'lucide-react';

interface WorkflowFile {
  name: string;
  path: string;
  size: number;
  created: Date;
  status: 'created' | 'modified' | 'pending';
}

interface AgentActivity {
  agentId: string;
  agentName: string;
  status: 'working' | 'completed' | 'idle' | 'error';
  currentTask: string;
  lastActivity: Date;
  filesCreated: number;
}

interface WorkflowProgress {
  workflowId: string;
  name: string;
  status: 'active' | 'completed' | 'pending';
  progress: number;
  estimatedCompletion: string;
  files: WorkflowFile[];
  agents: AgentActivity[];
}

export function WorkflowStatusPanel() {
  const [workflows, setWorkflows] = useState<WorkflowProgress[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Monitor Elena's workflow activity
  useEffect(() => {
    if (!isMonitoring) return;

    const monitorWorkflow = async () => {
      try {
        const response = await fetch('/api/admin/elena/status-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminToken: 'sandra-admin-2025' })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Create workflow from Elena's status
          const activeWorkflow: WorkflowProgress = {
            workflowId: 'admin-dashboard-redesign',
            name: 'Admin Dashboard Enhancement',
            status: data.report?.activeAgents > 0 ? 'active' : 'completed',
            progress: calculateProgress(data.report),
            estimatedCompletion: getEstimatedCompletion(data.report),
            files: extractRecentFiles(data.report),
            agents: mapAgentStatus(data.report?.agentDetails || [])
          };

          setWorkflows([activeWorkflow]);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Workflow monitoring error:', error);
      }
    };

    // Initial load
    monitorWorkflow();
    
    // Monitor every 5 seconds
    const interval = setInterval(monitorWorkflow, 5000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const calculateProgress = (report: any): number => {
    if (!report) return 0;
    const totalAgents = report.totalAgents || 10;
    const activeAgents = report.activeAgents || 0;
    return Math.round((activeAgents / totalAgents) * 100);
  };

  const getEstimatedCompletion = (report: any): string => {
    if (!report || report.activeAgents === 0) return 'Completed';
    return `${Math.max(1, report.activeAgents * 2)} minutes remaining`;
  };

  const extractRecentFiles = (report: any): WorkflowFile[] => {
    // Mock recent files based on Elena's activity - in production this would parse actual file operations
    return [
      {
        name: 'AdminHeroCoordinationPlan.ts',
        path: 'shared/types/',
        size: 293,
        created: new Date(),
        status: 'created'
      },
      {
        name: 'AdminHeroProps.ts', 
        path: 'shared/types/',
        size: 3333,
        created: new Date(),
        status: 'created'
      },
      {
        name: 'admin-dashboard-redesigned.tsx',
        path: 'client/src/pages/',
        size: 978,
        created: new Date(),
        status: 'created'
      },
      {
        name: 'agent-generated.ts',
        path: 'server/routes/',
        size: 1096,
        created: new Date(),
        status: 'created'
      }
    ];
  };

  const mapAgentStatus = (agentDetails: any[]): AgentActivity[] => {
    return agentDetails.map(agent => ({
      agentId: agent.agentId,
      agentName: agent.agentId.charAt(0).toUpperCase() + agent.agentId.slice(1),
      status: agent.status || 'idle',
      currentTask: agent.currentTask || 'Standing by',
      lastActivity: agent.lastActivity ? new Date(agent.lastActivity.timestamp) : new Date(),
      filesCreated: agent.isActive ? 1 : 0
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'working': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'working': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeWorkflow = workflows.find(w => w.status === 'active');
  const completedWorkflow = workflows.find(w => w.status === 'completed');
  const workflow = activeWorkflow || completedWorkflow || workflows[0];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="font-medium text-sm">Elena's Workflow Monitor</h3>
          <p className="text-xs text-gray-500">Real-time coordination tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {workflow ? (
        <div className="flex-1 space-y-4">
          {/* Active Workflow Status */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(workflow.status)}
                  <span className="font-medium text-sm">{workflow.name}</span>
                </div>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{workflow.progress}%</span>
                </div>
                <Progress value={workflow.progress} className="h-2" />
                <div className="text-xs text-gray-500">{workflow.estimatedCompletion}</div>
              </div>
            </CardHeader>
          </Card>

          {/* Files Created */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-sm">Files Created ({workflow.files.length})</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {workflow.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.path}</div>
                    </div>
                    <div className="text-xs text-gray-500">{file.size} chars</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Activity */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-sm">Agent Activity</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {workflow.agents.filter(a => a.status === 'working' || a.filesCreated > 0).map((agent, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <span className="text-xs font-medium">{agent.agentName}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {agent.filesCreated} files
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Last Update */}
          <div className="text-xs text-gray-500 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No active workflows</p>
            <p className="text-xs">Elena is standing by</p>
          </div>
        </div>
      )}
    </div>
  );
}