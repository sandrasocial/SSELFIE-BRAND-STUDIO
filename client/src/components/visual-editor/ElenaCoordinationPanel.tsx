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

interface ElenaUpdate {
  timestamp: string;
  message: string;
}

interface WorkflowProgress {
  workflowId: string;
  workflowName: string;
  currentStep: number;
  totalSteps: number;
  status: 'creating' | 'ready' | 'executing' | 'completed' | 'failed';
  currentAgent?: string;
  estimatedTimeRemaining?: string;
  completedTasks: string[];
  nextActions: string[];
  elenaUpdates?: ElenaUpdate[];
}

export function ElenaCoordinationPanel({ onAgentSelect, currentWorkflow }: ElenaCoordinationPanelProps) {
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null);
  const [elenaUpdates, setElenaUpdates] = useState<ElenaUpdate[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Monitor Elena's live workflow progress
  useEffect(() => {
    const checkForActiveWorkflows = async () => {
      try {
        // Check for active workflows
        const response = await fetch('/api/elena/active-workflows', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.workflows && data.workflows.length > 0) {
            const activeWorkflow = data.workflows.find(w => w.status === 'executing');
            if (activeWorkflow) {
              setIsMonitoring(true);
              startWorkflowMonitoring(activeWorkflow.id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to check for active workflows:', error);
      }
    };

    checkForActiveWorkflows();
  }, []);

  const startWorkflowMonitoring = (workflowId: string) => {
    const monitorInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/elena/workflow-status/${workflowId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.progress) {
            setWorkflowProgress(data.progress);
            if (data.progress.elenaUpdates) {
              setElenaUpdates(data.progress.elenaUpdates);
            }
            
            // Stop monitoring if workflow is complete
            if (data.progress.status === 'completed' || data.progress.status === 'failed') {
              clearInterval(monitorInterval);
              setIsMonitoring(false);
            }
          }
        }
      } catch (error) {
        console.error('Elena workflow monitoring error:', error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(monitorInterval);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Elena Live Coordination</h2>
            <p className="text-sm text-gray-500">Real-time AI Workflow Management</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? 'Live' : 'Standby'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Live Workflow Progress */}
      {workflowProgress && (
        <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{workflowProgress.workflowName}</h3>
            <Badge variant="outline" className={
              workflowProgress.status === 'executing' ? 'bg-blue-50 text-blue-700' :
              workflowProgress.status === 'completed' ? 'bg-green-50 text-green-700' :
              'bg-gray-50 text-gray-700'
            }>
              {workflowProgress.status}
            </Badge>
          </div>
          <Progress 
            value={(workflowProgress.currentStep / workflowProgress.totalSteps) * 100} 
            className="w-full" 
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Step {workflowProgress.currentStep} of {workflowProgress.totalSteps}</span>
            <span>{workflowProgress.estimatedTimeRemaining || 'Calculating...'}</span>
          </div>
          {workflowProgress.currentAgent && (
            <p className="text-sm text-blue-600 mt-2">
              🤖 Current: {workflowProgress.currentAgent}
            </p>
          )}
        </div>
      )}

      {/* Elena Live Updates Feed */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="font-medium text-gray-900 mb-3">Elena's Live Updates</h3>
        
        {elenaUpdates.length > 0 ? (
          <div className="space-y-3">
            {elenaUpdates.slice().reverse().map((update, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-gray-900">{update.message}</p>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active workflows</p>
            <p className="text-xs">Elena will appear here when coordinating agents</p>
          </div>
        )}

        {/* Completed Tasks */}
        {workflowProgress && workflowProgress.completedTasks.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Completed Tasks</h4>
            <div className="space-y-2">
              {workflowProgress.completedTasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-900">{task}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Actions */}
        {workflowProgress && workflowProgress.nextActions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-3">Next Actions</h4>
            <div className="space-y-2">
              {workflowProgress.nextActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-900">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}