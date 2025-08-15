/**
 * Elena Workflows Tab - Displays staged workflows with manual execution buttons
 * Revolutionary conversational-to-autonomous bridge interface
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Clock, Users, Zap, AlertTriangle } from 'lucide-react';
import { useToast } from './hooks/use-toast';

interface StagedWorkflow {
  id: string;
  title: string;
  description: string;
  agents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: string;
  tasksCount: number;
  createdAt: string;
  status: 'staged' | 'executing' | 'completed' | 'failed';
}

export function ElenaWorkflowsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [executingWorkflows, setExecutingWorkflows] = useState<Set<string>>(new Set());

  // Query staged workflows - NO POLLING in chat interface, only manual refresh
  const { data: workflowsData, isLoading } = useQuery({
    queryKey: ['/api/elena/staged-workflows'],
    staleTime: 300000, // Data is stale after 5 minutes (no auto-refresh)
  });

  // Mutation to execute workflow - Connected to Elena execution API
  const executeWorkflowMutation = useMutation({
    mutationFn: async (workflow: StagedWorkflow) => {
      // Execute workflow through Elena API
      
      const response = await fetch('/api/elena/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          workflowId: workflow.id,
          workflowName: workflow.title,
          agents: workflow.agents.map(agentId => ({
            agentId: agentId,
            task: `Execute ${workflow.title} - ${workflow.description}`,
            filePath: null // Will be determined by agent
          })),
          priority: workflow.priority
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to execute workflow: ${response.statusText} - ${errorData}`);
      }
      
      return response.json();
    },
    onSuccess: (data, workflow) => {
      if (data.success) {
        toast({
          title: "Elena Workflow Deployed",
          description: `${data.workflowName} deployed successfully with ${data.agentsDeployed} agents`,
        });
        
        // Workflow execution successful
        
        // Add to executing set
        setExecutingWorkflows(prev => new Set([...Array.from(prev), workflow.id]));
        
        // Refresh both workflows and active deployments
        queryClient.invalidateQueries({ queryKey: ['/api/elena/staged-workflows'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/agents/active-deployments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/agents/coordination-metrics'] });
      } else {
        toast({
          variant: "destructive",
          title: "Elena Execution Failed",
          description: data.error || "Failed to execute Elena's workflow",
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Execution Error",
        description: error.message,
      });
    },
  });

  const workflows: StagedWorkflow[] = (workflowsData as { workflows?: StagedWorkflow[] })?.workflows || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <Zap className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-serif text-black mb-2">Elena's Workflows</h1>
        <p className="text-zinc-600 text-sm">
          Revolutionary conversational-to-autonomous bridge system. Elena creates workflows through natural conversation, 
          then you can execute them manually with these buttons.
        </p>
      </div>

      {/* Workflows Grid */}
      {workflows.length === 0 ? (
        <Card className="border-zinc-200">
          <CardContent className="pt-6 text-center">
            <div className="text-zinc-500 mb-4">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">No Workflows Staged</p>
              <p className="text-sm">Elena will automatically stage workflows when she creates them through conversation.</p>
            </div>
            <div className="text-xs text-zinc-400 bg-zinc-50 p-3 rounded-md mt-4">
              <strong>How it works:</strong> Elena analyzes her responses for workflow patterns like "I'll coordinate", 
              "Let me assign", or mentions of multiple agents. When detected, workflows appear here for manual execution.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => {
            const isExecuting = executingWorkflows.has(workflow.id) || executeWorkflowMutation.isPending;
            
            return (
              <Card key={workflow.id} className="border-zinc-200 hover:border-zinc-300 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-serif text-black">{workflow.title}</CardTitle>
                      <CardDescription className="text-zinc-600">
                        {workflow.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-white ${getPriorityColor(workflow.priority)}`}>
                        {getPriorityIcon(workflow.priority)}
                        <span className="ml-1 capitalize">{workflow.priority}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-zinc-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{workflow.agents.length} agents</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{workflow.estimatedDuration}</span>
                      </div>
                      <div className="text-xs">
                        {workflow.tasksCount} tasks
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => executeWorkflowMutation.mutate(workflow)}
                      disabled={isExecuting || workflow.status !== 'staged'}
                      className="bg-black hover:bg-zinc-800 text-white font-medium"
                    >
                      {isExecuting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Execute Workflow
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Agent List */}
                  <div className="mt-3 pt-3 border-t border-zinc-100">
                    <div className="flex flex-wrap gap-2">
                      {workflow.agents.map((agent) => (
                        <Badge key={agent} variant="secondary" className="text-xs">
                          {agent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Creation Time */}
                  <div className="mt-2 text-xs text-zinc-400">
                    Created {new Date(workflow.createdAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}