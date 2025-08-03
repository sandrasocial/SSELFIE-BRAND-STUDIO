import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'working' | 'idle' | 'error';
  lastActivity: string;
  filesCreated: number;
  currentTask: string;
}

interface AdminMetrics {
  totalUsers: number;
  activeAgents: number;
  systemHealth: number;
  todayRevenue: number;
}

export default function UnifiedAdminSystem() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [taskInput, setTaskInput] = useState('');

  // Check admin access
  const isAdmin = user?.email === 'ssa@ssasocial.com' || user?.role === 'admin';

  // Get admin metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<AdminMetrics>({
    queryKey: ['/api/admin/metrics'],
    enabled: isAdmin,
    refetchInterval: 30000
  });

  // Get agent statuses
  const { data: agents = [], isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ['/api/admin/agents/status'],
    enabled: isAdmin,
    refetchInterval: 10000
  });

  // Execute agent task
  const executeTaskMutation = useMutation({
    mutationFn: async ({ agentId, task }: { agentId: string; task: string }) => {
      const response = await fetch('/api/admin/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, task, adminToken: 'sandra-admin-2025' })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Task Executed",
        description: `${selectedAgent} is now working on: ${taskInput}`,
      });
      setTaskInput('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/agents/status'] });
    },
    onError: (error) => {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleExecuteTask = () => {
    if (!selectedAgent || !taskInput.trim()) return;
    executeTaskMutation.mutate({ agentId: selectedAgent, task: taskInput });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-serif mb-4">Authentication Required</h2>
            <p>Please sign in to access the admin system.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-serif mb-4">Access Denied</h2>
            <p>Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* UNIFIED ADMIN HEADER */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-light text-black mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            SSELFIE ADMIN SYSTEM
          </h1>
          <p className="text-xl text-gray-600">Unified Control Center</p>
        </div>

        {/* METRICS DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif text-black">
                {metricsLoading ? '...' : metrics?.totalUsers?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide">Active Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif text-black">
                {metricsLoading ? '...' : metrics?.activeAgents || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif text-black">
                {metricsLoading ? '...' : `${metrics?.systemHealth || 0}%`}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide">Today Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif text-black">
                €{metricsLoading ? '...' : metrics?.todayRevenue?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AGENT COMMAND CENTER */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">Agent Command Center</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Agent Selection & Task Input */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="p-3 border border-gray-300 rounded"
                >
                  <option value="">Select Agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.role}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Enter task for agent..."
                  className="p-3 border border-gray-300 rounded"
                />
                
                <Button
                  onClick={handleExecuteTask}
                  disabled={!selectedAgent || !taskInput.trim() || executeTaskMutation.isPending}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {executeTaskMutation.isPending ? 'Executing...' : 'Execute Task'}
                </Button>
              </div>

              {/* Agent Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <Card key={agent.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-serif">{agent.name}</CardTitle>
                        <Badge variant={agent.status === 'working' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{agent.role}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>Current Task: {agent.currentTask || 'None'}</div>
                        <div>Files Created: {agent.filesCreated}</div>
                        <div>Last Activity: {agent.lastActivity}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}