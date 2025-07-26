import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAgentActivityData } from '@/hooks/useAgentActivityData';

interface AgentStatus {
  agentName: string;
  specializations: string[];
  currentLoad: number;
  averageTaskTime: number;
  successRate: number;
  isAvailable: boolean;
  maxConcurrentTasks: number;
  currentTasks: string[];
}

interface Deployment {
  id: string;
  missionType: string;
  status: string;
  progress: number;
  currentPhase: number;
  totalPhases: number;
  startTime: string;
  estimatedCompletion: string;
  completedTasks: number;
  totalTasks: number;
  assignedAgents: any[];
  recentLogs: string[];
}

interface CoordinationMetrics {
  agentCoordination: {
    totalAgents: number;
    availableAgents: number;
    activeAgents: number;
    averageLoad: number;
    averageSuccessRate: number;
  };
  deploymentMetrics: {
    activeDeployments: number;
    totalDeployments: number;
    completionRate: number;
  };
  knowledgeSharing: {
    totalInsights: number;
    totalStrategies: number;
    avgEffectiveness: number;
    knowledgeConnections: number;
  };
  systemHealth: {
    orchestratorStatus: string;
    taskDistributorStatus: string;
    knowledgeSharingStatus: string;
    lastHealthCheck: string;
  };
}

export default function AgentActivityDashboard() {
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  
  // Use the new data hook for coordination metrics and deployments
  const { 
    coordinationMetrics,
    activeDeployments,
    isLoading,
    error,
    refreshAll,
    lastUpdated
  } = useAgentActivityData();

  const deploymentsList = activeDeployments || [];

  // Fetch Elena's staged workflows
  const { data: stagedWorkflowsData, refetch: refetchStagedWorkflows } = useQuery({
    queryKey: ['/api/elena/staged-workflows'],
    refetchInterval: 10000 // Check every 10 seconds for new workflows
  });

  const stagedWorkflows = stagedWorkflowsData?.workflows || [];

  // Execute staged workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const response = await fetch(`/api/elena/execute-staged-workflow/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to execute workflow');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Refresh all data after successful execution
      refetchStagedWorkflows();
      refreshAll();
      setSelectedDeployment(data.deploymentId);
      
      alert(`🚀 WORKFLOW EXECUTED!\n\n${data.message}\n\nDeployment ID: ${data.deploymentId.split('-')[1]}\nAgents: ${data.agents.join(', ')}\n\nView progress in Active Deployments tab.`);
    },
    onError: (error: Error) => {
      alert(`❌ Workflow Execution Failed: ${error.message}`);
    }
  });

  // Fetch specific deployment details
  const { data: deploymentDetails } = useQuery({
    queryKey: ['/api/autonomous-orchestrator/deployment-status', selectedDeployment],
    enabled: !!selectedDeployment,
    refetchInterval: 2000
  });





  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-200 rounded w-64"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-zinc-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMetrics: CoordinationMetrics = coordinationMetrics || {
    agentCoordination: { totalAgents: 13, availableAgents: 13, activeAgents: 0, averageLoad: 0, averageSuccessRate: 95 },
    deploymentMetrics: { activeDeployments: 0, totalDeployments: 0, completionRate: 0 },
    knowledgeSharing: { totalInsights: 0, totalStrategies: 4, avgEffectiveness: 85, knowledgeConnections: 0 },
    systemHealth: { orchestratorStatus: 'operational', taskDistributorStatus: 'operational', knowledgeSharingStatus: 'operational', lastHealthCheck: new Date().toISOString() }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* LUXURY EDITORIAL HEADER */}
      <div className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="font-times text-4xl font-normal tracking-wider mb-2">
            A G E N T  A C T I V I T Y
          </h1>
          <p className="text-zinc-300 text-lg">Real-time autonomous agent coordination dashboard</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* SYSTEM OVERVIEW METRICS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="border-zinc-200">
            <CardHeader className="pb-3">
              <CardTitle className="font-times text-lg tracking-wide text-zinc-900">
                A C T I V E  A G E N T S
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black mb-2">
                {currentMetrics.agentCoordination.activeAgents}/{currentMetrics.agentCoordination.totalAgents}
              </div>
              <div className="text-sm text-zinc-600">
                {Math.round(currentMetrics.agentCoordination.averageLoad)}% average load
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardHeader className="pb-3">
              <CardTitle className="font-times text-lg tracking-wide text-zinc-900">
                D E P L O Y M E N T S
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black mb-2">
                {currentMetrics.deploymentMetrics.activeDeployments}
              </div>
              <div className="text-sm text-zinc-600">
                {Math.round(currentMetrics.deploymentMetrics.completionRate)}% completion rate
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardHeader className="pb-3">
              <CardTitle className="font-times text-lg tracking-wide text-zinc-900">
                K N O W L E D G E
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black mb-2">
                {currentMetrics.knowledgeSharing.totalStrategies}
              </div>
              <div className="text-sm text-zinc-600">
                {Math.round(currentMetrics.knowledgeSharing.avgEffectiveness)}% effectiveness
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardHeader className="pb-3">
              <CardTitle className="font-times text-lg tracking-wide text-zinc-900">
                S U C C E S S  R A T E
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black mb-2">
                {Math.round(currentMetrics.agentCoordination.averageSuccessRate)}%
              </div>
              <div className="text-sm text-zinc-600">
                System performance
              </div>
            </CardContent>
          </Card>
        </div>



        <Tabs defaultValue="staged" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="staged">Elena's Workflows</TabsTrigger>
            <TabsTrigger value="deployments">Active Deployments</TabsTrigger>
            <TabsTrigger value="agents">Agent Status</TabsTrigger>
            <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="staged" className="space-y-6">
            {stagedWorkflows.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-times text-xl tracking-wide text-zinc-900">
                      Elena's Workflows Ready for Execution
                    </h3>
                    <p className="text-zinc-600 text-sm mt-1">
                      Workflows detected from Elena's conversation are staged here for manual execution
                    </p>
                  </div>
                  <Badge variant="outline" className="text-zinc-600">
                    {stagedWorkflows.length} workflows ready
                  </Badge>
                </div>
                
                {stagedWorkflows.map((workflow: any) => (
                  <Card key={workflow.id} className="border-zinc-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-times text-lg tracking-wide">
                          {workflow.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            workflow.priority === 'critical' ? 'destructive' :
                            workflow.priority === 'high' ? 'default' :
                            workflow.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {workflow.priority}
                          </Badge>
                          <Badge variant="outline">
                            {workflow.agents.length} agents
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-zinc-700">{workflow.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-zinc-500">Agents:</span>
                            <div className="font-medium">{workflow.agents.join(', ')}</div>
                          </div>
                          <div>
                            <span className="text-zinc-500">Duration:</span>
                            <div className="font-medium">{workflow.estimatedDuration} minutes</div>
                          </div>
                          <div>
                            <span className="text-zinc-500">Requirements:</span>
                            <div className="font-medium">{workflow.customRequirements.length} tasks</div>
                          </div>
                          <div>
                            <span className="text-zinc-500">Created:</span>
                            <div className="font-medium">
                              {new Date(workflow.detectedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        
                        {workflow.customRequirements.length > 0 && (
                          <div>
                            <span className="text-zinc-500 text-sm">Workflow Tasks:</span>
                            <ul className="list-disc list-inside text-sm text-zinc-700 mt-1 space-y-1">
                              {workflow.customRequirements.slice(0, 3).map((req: string, index: number) => (
                                <li key={index}>{req}</li>
                              ))}
                              {workflow.customRequirements.length > 3 && (
                                <li className="text-zinc-500">... and {workflow.customRequirements.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => executeWorkflowMutation.mutate(workflow.id)}
                          disabled={executeWorkflowMutation.isPending}
                          className="bg-black text-white hover:bg-zinc-800 w-full"
                        >
                          {executeWorkflowMutation.isPending ? 'Executing...' : `Execute "${workflow.name}"`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-zinc-200">
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="text-zinc-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="font-times text-xl tracking-wide text-zinc-700 mb-2">
                      N O  W O R K F L O W S  S T A G E D
                    </h3>
                    <p className="text-zinc-500 mb-4">Chat with Elena to create workflows that will appear here for manual execution</p>
                    <p className="text-zinc-400 text-sm">
                      When Elena creates a workflow in conversation, it will automatically be detected and staged here with a manual trigger button
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deployments" className="space-y-6">
            {deploymentsList?.length > 0 ? (
              deploymentsList.map((deployment: any) => (
                <Card key={deployment.id} className="border-zinc-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-times text-xl tracking-wide">
                        {deployment.missionType.toUpperCase().replace('-', ' ')}
                      </CardTitle>
                      <Badge variant={
                        deployment.status === 'active' ? 'default' :
                        deployment.status === 'completed' ? 'secondary' :
                        deployment.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {deployment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={deployment.progress} className="h-2" />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-500">Progress:</span>
                          <div className="font-medium">{deployment.progress}%</div>
                        </div>
                        <div>
                          <span className="text-zinc-500">Agents:</span>
                          <div className="font-medium">{deployment.assignedAgents} assigned</div>
                        </div>
                        <div>
                          <span className="text-zinc-500">Started:</span>
                          <div className="font-medium">
                            {new Date(deployment.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedDeployment(deployment.id)}
                        className="text-black hover:bg-zinc-100"
                      >
                        View Details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-zinc-200">
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="text-zinc-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-times text-xl tracking-wide text-zinc-700 mb-2">
                      N O  A C T I V E  D E P L O Y M E N T S
                    </h3>
                    <p className="text-zinc-500">All agents are on standby ready for deployment</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* This would show individual agent statuses */}
              {['Elena', 'Aria', 'Zara', 'Maya', 'Victoria', 'Rachel', 'Ava', 'Quinn', 'Sophia', 'Martha', 'Diana', 'Wilma', 'Olga'].map(agent => (
                <Card key={agent} className="border-zinc-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-times text-lg tracking-wide">{agent.toUpperCase()}</h3>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                    <div className="text-sm text-zinc-600 mb-3">
                      {agent === 'Elena' && 'Strategic Coordinator'}
                      {agent === 'Aria' && 'Luxury Design Specialist'}
                      {agent === 'Zara' && 'Technical Architect'}
                      {agent === 'Maya' && 'AI Photography Expert'}
                      {agent === 'Victoria' && 'UX Specialist'}
                      {agent === 'Rachel' && 'Voice & Copy Expert'}
                      {agent === 'Ava' && 'Automation Specialist'}
                      {agent === 'Quinn' && 'Quality Assurance'}
                      {agent === 'Sophia' && 'Social Media Manager'}
                      {agent === 'Martha' && 'Marketing Specialist'}
                      {agent === 'Diana' && 'Business Coach'}
                      {agent === 'Wilma' && 'Workflow Designer'}
                      {agent === 'Olga' && 'Repository Expert'}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Load: 0%</span>
                      <span className="text-zinc-500">Success: 95%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-zinc-200">
                <CardHeader>
                  <CardTitle className="font-times text-xl tracking-wide">
                    S Y S T E M  H E A L T H
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Orchestrator</span>
                    <Badge variant="secondary">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Task Distributor</span>
                    <Badge variant="secondary">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Knowledge Sharing</span>
                    <Badge variant="secondary">Operational</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200">
                <CardHeader>
                  <CardTitle className="font-times text-xl tracking-wide">
                    P E R F O R M A N C E
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Response Time</span>
                    <span className="font-medium">2.3s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Task Success Rate</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* DEPLOYMENT DETAILS MODAL */}
        {selectedDeployment && deploymentDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-auto border-zinc-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-times text-2xl tracking-wide">
                    {deploymentDetails.deployment?.missionType?.toUpperCase().replace('-', ' ')}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedDeployment(null)}
                    className="text-zinc-500 hover:text-black"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-times text-lg tracking-wide mb-3">P R O G R E S S</h3>
                    <Progress value={deploymentDetails.deployment?.progress || 0} className="h-3 mb-2" />
                    <p className="text-sm text-zinc-600">
                      Phase {deploymentDetails.deployment?.currentPhase + 1 || 1} of {deploymentDetails.deployment?.totalPhases || 1}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-times text-lg tracking-wide mb-3">T A S K S</h3>
                    <div className="text-2xl font-bold text-black">
                      {deploymentDetails.deployment?.completedTasks || 0}/{deploymentDetails.deployment?.totalTasks || 0}
                    </div>
                    <p className="text-sm text-zinc-600">Completed</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-times text-lg tracking-wide mb-3">R E C E N T  L O G S</h3>
                  <div className="bg-zinc-50 rounded p-4 max-h-40 overflow-y-auto">
                    {deploymentDetails.deployment?.recentLogs?.map((log: string, index: number) => (
                      <div key={index} className="text-sm font-mono mb-1">
                        {log}
                      </div>
                    )) || <div className="text-sm text-zinc-500">No logs available</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}