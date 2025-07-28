import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, User, CheckCircle, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'offline';
}

interface ExecutionResult {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  message?: string;
}

interface AgentsResponse {
  success: boolean;
  agents: Agent[];
}

export function UnifiedAgentInterface() {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [task, setTask] = useState<string>('');
  const [context, setContext] = useState<string>('{}');
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const queryClient = useQueryClient();

  // Fetch available agents
  const { data: agentsData, isLoading: agentsLoading } = useQuery<AgentsResponse>({
    queryKey: ['/api/unified-agents/available'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Execute agent task mutation
  const executeTaskMutation = useMutation({
    mutationFn: async (params: { agentName: string; task: string; context: any; priority?: string }) => {
      return apiRequest('/api/unified-agents/execute', 'POST', params);
    },
    onSuccess: (data) => {
      setExecutionResults(prev => [data, ...prev]);
      setTask('');
      queryClient.invalidateQueries({ queryKey: ['/api/unified-agents/available'] });
    }
  });

  const handleExecuteTask = () => {
    if (!selectedAgent || !task.trim()) return;

    let parsedContext = {};
    try {
      parsedContext = JSON.parse(context);
    } catch (error) {
      console.error('Invalid JSON context:', error);
      parsedContext = { note: context };
    }

    executeTaskMutation.mutate({
      agentName: selectedAgent,
      task: task.trim(),
      context: parsedContext,
      priority: 'medium'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading unified agent architecture...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Selection and Task Input */}
        <Card>
          <CardHeader>
            <CardTitle>Unified Agent Execution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Available Agents */}
            <div>
              <label className="text-sm font-medium mb-2 block">Available Agents</label>
              <div className="grid grid-cols-1 gap-2">
                {agentsData?.agents?.map((agent: Agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAgent === agent.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-600">{agent.role}</div>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Task Description</label>
              <Textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe the task you want the agent to perform..."
                rows={3}
              />
            </div>

            {/* Context Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Context (JSON)</label>
              <Input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder='{"type": "development", "priority": "high"}'
              />
            </div>

            {/* Execute Button */}
            <Button
              onClick={handleExecuteTask}
              disabled={!selectedAgent || !task.trim() || executeTaskMutation.isPending}
              className="w-full"
            >
              {executeTaskMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Task
                </>
              )}
            </Button>

            {executeTaskMutation.error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                Error: {executeTaskMutation.error.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution Results */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {executionResults.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No executions yet. Select an agent and run a task to see results.
                </div>
              ) : (
                executionResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">
                          Execution {result.executionId?.substr(-8)}
                        </span>
                      </div>
                      <Badge variant="outline">{result.status}</Badge>
                    </div>
                    
                    {result.message && (
                      <div className="text-sm text-gray-600">
                        {result.message}
                      </div>
                    )}
                    
                    {result.result && (
                      <div className="text-xs bg-gray-50 p-2 rounded font-mono">
                        {JSON.stringify(result.result, null, 2)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {agentsData?.agents?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Available Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {executionResults.length}
              </div>
              <div className="text-sm text-gray-600">Total Executions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {executionResults.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed Tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}