/**
 * EFFORT-BASED AGENT INTERFACE
 * Revolutionary cost-optimized agent interaction system
 * Pay per completed task, not API calls - like Replit's agents
 */

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, DollarSign, Zap, TrendingDown } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface TaskExecutionResult {
  success: boolean;
  taskCompleted: boolean;
  result: string;
  effortUsed: number;
  costEstimate: number;
  apiCallsUsed: number;
  toolsUsed: string[];
  checkpointId?: string;
  error?: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  estimatedCost: {
    simple: string;
    complex: string;
  };
}

export function EffortBasedAgentInterface() {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [task, setTask] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [maxEffort, setMaxEffort] = useState<number>(10);
  const [executionHistory, setExecutionHistory] = useState<TaskExecutionResult[]>([]);

  // Get available agents
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents/effort-based/available'],
    refetchOnWindowFocus: false
  });

  // Get compression statistics
  const { data: compressionData } = useQuery({
    queryKey: ['/api/agents/effort-based/compression-stats', selectedAgent],
    enabled: !!selectedAgent,
    refetchOnWindowFocus: false
  });

  // Task execution mutation
  const executeTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest('/api/agents/effort-based/execute', 'POST', taskData);
    },
    onSuccess: (data) => {
      const result = data.result;
      setExecutionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
      
      toast({
        title: result.taskCompleted ? "Task Completed Successfully!" : "Task Partially Completed",
        description: `Cost: $${result.costEstimate.toFixed(2)} • ${data.costComparison.savings}% savings vs traditional`,
        variant: result.taskCompleted ? "default" : "destructive"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Task Execution Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const handleExecuteTask = () => {
    if (!selectedAgent || !task.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an agent and enter a task",
        variant: "destructive"
      });
      return;
    }

    executeTaskMutation.mutate({
      agentName: selectedAgent,
      task: task.trim(),
      maxEffort,
      priority
    });
  };

  const agents: Agent[] = agentsData?.agents || [];
  const compressionStats = compressionData?.stats;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-black">Effort-Based AI Agents</h1>
        <p className="text-gray-600">Pay per completed task, not API calls • 70-90% cost reduction</p>
      </div>

      {/* Cost Comparison Banner */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingDown className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Revolutionary Cost Savings</h3>
                <p className="text-sm text-green-700">
                  Traditional: $58-97 per conversation • Effort-Based: $2-15 per completed task
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              85-90% Savings
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="execute" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="execute">Execute Task</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="analytics">Cost Analytics</TabsTrigger>
        </TabsList>

        {/* Task Execution Tab */}
        <TabsContent value="execute" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Task Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Task Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure your task for effort-based execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agent Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Agent</label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{agent.name}</span>
                            <span className="text-xs text-gray-500">{agent.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Description */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Task Description</label>
                  <Textarea
                    placeholder="Describe what you want the agent to accomplish..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Configuration Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Effort</label>
                    <Select value={maxEffort.toString()} onValueChange={(value) => setMaxEffort(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 (Simple tasks)</SelectItem>
                        <SelectItem value="10">10 (Standard tasks)</SelectItem>
                        <SelectItem value="15">15 (Complex tasks)</SelectItem>
                        <SelectItem value="20">20 (Maximum effort)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={handleExecuteTask}
                  disabled={executeTaskMutation.isPending || !selectedAgent || !task.trim()}
                  className="w-full"
                  size="lg"
                >
                  {executeTaskMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Executing Task...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Execute Task
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Agent Information */}
            {selectedAgent && (
              <Card>
                <CardHeader>
                  <CardTitle>Agent Information</CardTitle>
                  <CardDescription>
                    Details about the selected agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const agent = agents.find(a => a.id === selectedAgent);
                    if (!agent) return null;

                    return (
                      <>
                        <div>
                          <h4 className="font-semibold">{agent.name}</h4>
                          <p className="text-sm text-gray-600">{agent.role}</p>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Specialties</h5>
                          <div className="flex flex-wrap gap-2">
                            {agent.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Estimated Costs</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Simple tasks:</span>
                              <span className="font-medium">{agent.estimatedCost.simple}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Complex tasks:</span>
                              <span className="font-medium">{agent.estimatedCost.complex}</span>
                            </div>
                          </div>
                        </div>

                        {/* Context Compression Stats */}
                        {compressionStats && (
                          <div>
                            <h5 className="font-medium mb-2">Context Optimization</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Compression ratio:</span>
                                <span className="font-medium text-green-600">
                                  {compressionStats.compressionRatio}%
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Tokens saved:</span>
                                <span className="font-medium">
                                  {Math.round((compressionStats.original.total - compressionStats.compressed.total) / 4)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Cost savings:</span>
                                <span className="font-medium text-green-600">
                                  ${((compressionStats.original.total - compressionStats.compressed.total) * 0.0003).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Execution History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Task Executions</CardTitle>
              <CardDescription>
                History of effort-based task completions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {executionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No task executions yet</p>
              ) : (
                <div className="space-y-4">
                  {executionHistory.map((execution, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {execution.taskCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                          <span className="font-medium">
                            {execution.taskCompleted ? 'Completed' : 'Partial'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">${execution.costEstimate.toFixed(2)}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {execution.result.substring(0, 200)}...
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {execution.apiCallsUsed} API calls
                        </Badge>
                        <Badge variant="outline">
                          Effort: {execution.effortUsed}
                        </Badge>
                        {execution.toolsUsed.map((tool, toolIndex) => (
                          <Badge key={toolIndex} variant="secondary">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{executionHistory.length}</div>
                <p className="text-xs text-gray-500">Executed tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${executionHistory.reduce((sum, exec) => sum + (exec.apiCallsUsed * 25 - exec.costEstimate), 0).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">vs traditional pricing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {executionHistory.length > 0 
                    ? Math.round((executionHistory.filter(e => e.taskCompleted).length / executionHistory.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-gray-500">Task completion rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Comparison Analysis</CardTitle>
              <CardDescription>
                Effort-based vs traditional token-based pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {executionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Execute some tasks to see cost analysis</p>
              ) : (
                <div className="space-y-4">
                  {executionHistory.slice(0, 5).map((execution, index) => {
                    const traditionalCost = execution.apiCallsUsed * 25;
                    const savings = Math.round(((traditionalCost - execution.costEstimate) / traditionalCost) * 100);
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Task {index + 1}</span>
                          <span>{savings}% savings</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Traditional: ${traditionalCost.toFixed(2)}</span>
                            <span>Effort-based: ${execution.costEstimate.toFixed(2)}</span>
                          </div>
                          <Progress value={savings} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}