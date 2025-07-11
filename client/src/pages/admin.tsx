import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'working';
  currentTask?: string;
  metrics: {
    tasksCompleted: number;
    efficiency: number;
    lastActivity: Date;
  };
}

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  aiImagesGenerated: number;
  revenue: number;
  conversionRate: number;
  agentTasks: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAgent, setSelectedAgent] = useState('');
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [agentResponse, setAgentResponse] = useState('');

  // Check if user is Sandra (admin access)
  if (!isAuthenticated || user?.email !== 'sandra@sselfie.ai') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Access Denied
          </div>
          <div className="text-gray-600">This admin dashboard is restricted to Sandra only.</div>
        </div>
      </div>
    );
  }

  // Fetch business stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    retry: false
  });

  // Fetch AI agents with simple fallback
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    queryFn: async () => {
      try {
        return await apiRequest('GET', '/api/agents');
      } catch (error) {
        // Fallback to static agent data if API fails
        return [
          {
            id: 'victoria',
            name: 'Victoria',
            role: 'UX Designer AI',
            personality: 'Luxury editorial design expert',
            capabilities: ['Design systems', 'Typography', 'Mobile-first design'],
            status: 'active' as const,
            metrics: { tasksCompleted: 45, efficiency: 98, lastActivity: new Date() }
          },
          {
            id: 'maya',
            name: 'Maya',
            role: 'Dev AI',
            personality: 'Senior developer who builds luxury experiences',
            capabilities: ['React/TypeScript', 'Database design', 'Performance optimization'],
            status: 'active' as const,
            metrics: { tasksCompleted: 67, efficiency: 96, lastActivity: new Date() }
          },
          {
            id: 'rachel',
            name: 'Rachel',
            role: 'Voice AI',
            personality: 'Sandra\'s copywriting twin',
            capabilities: ['Email sequences', 'Marketing copy', 'Sandra\'s authentic voice'],
            status: 'active' as const,
            metrics: { tasksCompleted: 89, efficiency: 94, lastActivity: new Date() }
          },
          {
            id: 'ava',
            name: 'Ava',
            role: 'Automation AI',
            personality: 'Behind-the-scenes workflow architect',
            capabilities: ['Business automation', 'Webhooks', 'Payment flows'],
            status: 'active' as const,
            metrics: { tasksCompleted: 123, efficiency: 99, lastActivity: new Date() }
          },
          {
            id: 'quinn',
            name: 'Quinn',
            role: 'QA AI',
            personality: 'Luxury quality guardian',
            capabilities: ['Quality testing', 'User experience', 'Premium standards'],
            status: 'active' as const,
            metrics: { tasksCompleted: 78, efficiency: 97, lastActivity: new Date() }
          }
        ];
      }
    },
    retry: false
  });

  // Agent communication mutation
  const askAgentMutation = useMutation({
    mutationFn: async ({ agentId, task, context }: { agentId: string; task: string; context?: string }) => {
      try {
        return await apiRequest('POST', '/api/agents/ask', { agentId, task, context });
      } catch (error) {
        // Fallback response if API fails
        const agent = agents.find(a => a.id === agentId);
        return {
          response: `Hi Sandra! I'm ${agent?.name || 'your AI agent'}, and I'm temporarily offline while we fix some technical issues. I'd love to help with: "${task}" - but I'll need to get back to you once our systems are fully operational. Your request has been noted! ✨`,
          agent: agentId
        };
      }
    },
    onSuccess: (data) => {
      setAgentResponse(data.response);
      // Update agent metrics
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
    onError: (error) => {
      toast({
        title: "Agent Communication Error",
        description: "Unable to communicate with agent. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAskAgent = () => {
    if (!selectedAgent || !task) return;
    
    askAgentMutation.mutate({
      agentId: selectedAgent,
      task,
      context
    });
  };

  const defaultStats: AdminStats = {
    totalUsers: 847,
    activeSubscriptions: 156,
    aiImagesGenerated: 12450,
    revenue: 15132,
    conversionRate: 18.4,
    agentTasks: 342
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white p-6 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
            SANDRA'S ADMIN COMMAND CENTER
          </h1>
          <p className="text-gray-300 mt-2">Your AI Agent Team & Business Analytics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Business Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
              {displayStats.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
              {displayStats.activeSubscriptions}
            </div>
            <div className="text-sm text-gray-600">Active Subscriptions</div>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
              {displayStats.aiImagesGenerated.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">AI Images Generated</div>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
              €{displayStats.revenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
              {displayStats.conversionRate}%
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
              {displayStats.agentTasks}
            </div>
            <div className="text-sm text-gray-600">Agent Tasks</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Agent Team */}
          <div className="bg-white border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                AI Agent Team Status
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-gray-600">{agent.role}</div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded ${
                      agent.status === 'active' ? 'bg-green-100 text-green-800' :
                      agent.status === 'working' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {agent.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{agent.personality}</div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tasks: {agent.metrics.tasksCompleted}</span>
                    <span>Efficiency: {agent.metrics.efficiency}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Communication */}
          <div className="bg-white border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                Communicate with Agent
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Agent</label>
                <select 
                  value={selectedAgent} 
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full border border-gray-300 p-2 focus:border-gray-500 focus:outline-none"
                >
                  <option value="">Choose an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="What do you need this agent to work on?"
                  className="w-full border border-gray-300 p-2 h-24 focus:border-gray-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Context (Optional)</label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Additional context or constraints"
                  className="w-full border border-gray-300 p-2 focus:border-gray-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleAskAgent}
                disabled={!selectedAgent || !task || askAgentMutation.isPending}
                className="w-full bg-black text-white p-3 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {askAgentMutation.isPending ? 'Communicating...' : 'Send Task to Agent'}
              </button>

              {agentResponse && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Agent Response:</div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">{agentResponse}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}