import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Users, Clock, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  id: string;
  agentId: string;
  agentName: string;
  taskDescription: string;
  estimatedTime: string;
  dependencies: string[];
  deliverables: string[];
  priority: 'high' | 'medium' | 'low';
}

interface CustomWorkflow {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string;
  steps: WorkflowStep[];
  businessImpact: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'draft' | 'ready' | 'running' | 'completed' | 'failed';
}

export default function WorkflowCreator() {
  const [request, setRequest] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflow, setWorkflow] = useState<CustomWorkflow | null>(null);
  const { toast } = useToast();

  const handleCreateWorkflow = async () => {
    if (!request.trim()) {
      toast({
        title: "Request Required",
        description: "Please describe what you need Elena to create a workflow for.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiRequest('POST', '/api/elena/create-workflow', {
        request: request.trim()
      });

      const data = await response.json();
      
      if (data.success) {
        setWorkflow(data.workflow);
        toast({
          title: "Workflow Created!",
          description: data.message,
        });
      } else {
        throw new Error(data.error || 'Failed to create workflow');
      }
    } catch (error) {
      console.error('Workflow creation error:', error);
      toast({
        title: "Workflow Creation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!workflow) return;

    setIsExecuting(true);
    try {
      const response = await apiRequest('POST', '/api/elena/execute-workflow', {
        workflowId: workflow.id
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Workflow Started!",
          description: "Elena and the agents are now executing your workflow.",
        });
        // Update workflow status
        setWorkflow({ ...workflow, status: 'running' });
      } else {
        throw new Error(data.error || 'Failed to execute workflow');
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
      toast({
        title: "Workflow Execution Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Elena Workflow Creator Header */}
      <div className="text-center space-y-4">
        <h1 style={{ fontFamily: 'Times New Roman' }} className="text-4xl font-bold text-black">
          Elena's Workflow Creator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Tell Elena what you need done, and she'll create the perfect workflow with coordinated agent tasks. 
          One click to execute, full transparency on progress.
        </p>
      </div>

      {/* Request Input */}
      <Card className="p-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Describe what you need Elena to create a workflow for:
          </label>
          <Textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Example: Create a new pricing page with luxury design and premium copy
            
Example: Build a dashboard component with user analytics and interactive charts

Example: Optimize the Maya AI system for better hair texture recognition

Example: Design and implement a new onboarding flow with progress tracking"
            className="min-h-32"
          />
          <Button 
            onClick={handleCreateWorkflow}
            disabled={isCreating || !request.trim()}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Elena is analyzing your request...
              </>
            ) : (
              'Create Workflow with Elena'
            )}
          </Button>
        </div>
      </Card>

      {/* Workflow Display */}
      {workflow && (
        <Card className="p-6 space-y-6">
          {/* Workflow Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 style={{ fontFamily: 'Times New Roman' }} className="text-2xl font-bold text-black">
                {workflow.name}
              </h2>
              <div className="flex items-center gap-2">
                <Badge className={getRiskBadgeColor(workflow.riskLevel)}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {workflow.riskLevel} risk
                </Badge>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {workflow.estimatedDuration}
                </Badge>
              </div>
            </div>
            
            <p className="text-gray-600">{workflow.description}</p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Business Impact</h3>
              <p className="text-blue-800">{workflow.businessImpact}</p>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <h3 style={{ fontFamily: 'Times New Roman' }} className="text-xl font-bold text-black">
              Workflow Steps ({workflow.steps.length} steps)
            </h3>
            
            <div className="space-y-3">
              {workflow.steps.map((step, index) => (
                <Card key={step.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          Step {index + 1}
                        </Badge>
                        <Badge className={getPriorityBadgeColor(step.priority)}>
                          {step.priority}
                        </Badge>
                        <span className="font-medium">{step.agentName}</span>
                      </div>
                      
                      <p className="text-gray-700">{step.taskDescription}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {step.deliverables.length} deliverables
                        </span>
                      </div>
                      
                      {step.deliverables.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 font-medium">Deliverables:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {step.deliverables.map((deliverable, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {deliverable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Execute Button */}
          {workflow.status === 'ready' && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleExecuteWorkflow}
                disabled={isExecuting}
                className="w-full bg-black hover:bg-gray-800 text-white"
                size="lg"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting workflow execution...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Workflow - Start All Agents
                  </>
                )}
              </Button>
            </div>
          )}

          {workflow.status === 'running' && (
            <div className="pt-4 border-t">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
                <p className="text-blue-800 font-medium">Workflow is running...</p>
                <p className="text-blue-600 text-sm">Elena and the agents are executing your workflow</p>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}