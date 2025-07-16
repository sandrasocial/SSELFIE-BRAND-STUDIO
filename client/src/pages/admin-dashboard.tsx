import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { VisualDesignPreview } from "@/components/visual-design-preview";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClientInstance = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.email !== 'ssa@ssasocial.com')) {
      setLocation('/admin-access-only');
      return;
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.email === 'ssa@ssasocial.com',
    retry: false
  });

  const { data: agents = [], isLoading: agentsLoading, error: agentsError } = useQuery({
    queryKey: ['/api/agents'],
    enabled: isAuthenticated && user?.email === 'ssa@ssasocial.com',
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  // Debug logging
  console.log('Admin Dashboard - Agents data:', { 
    agents, 
    agentsLoading, 
    agentsError, 
    agentsCount: agents.length,
    isAuthenticated,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  // Force clear cache and refetch if needed
  useEffect(() => {
    if (isAuthenticated && user?.email === 'ssa@ssasocial.com') {
      queryClientInstance.invalidateQueries({ queryKey: ['/api/agents'] });
    }
  }, [isAuthenticated, user?.email, queryClientInstance]);

  const refreshAgents = () => {
    queryClientInstance.invalidateQueries({ queryKey: ['/api/agents'] });
    queryClientInstance.refetchQueries({ queryKey: ['/api/agents'] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Admin Navigation */}
      <nav className="bg-black text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/admin">
              <div className="font-serif text-lg tracking-wide">SSELFIE ADMIN</div>
            </Link>
            <div className="flex space-x-6">
              <Link href="/admin" className="text-sm uppercase tracking-wide hover:text-gray-300">
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/workspace" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Back to Platform
            </Link>
            <a href="/api/logout" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Logout
            </a>
          </div>
        </div>
      </nav>
      
      {/* Content */}
      <div className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Business Metrics */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl mb-6">Business Overview</h2>
            {statsLoading ? (
              <div className="border border-gray-200 p-6 text-center">
                <div className="text-sm text-gray-600">Loading business metrics...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Platform Users" value={stats?.totalUsers || 0} subtitle="total registered" />
                <StatCard title="Active Subscribers" value={stats?.activeSubscriptions || 0} subtitle="paying customers" />
                <StatCard title="AI Images Created" value={stats?.totalImages || 0} subtitle="total generations" />
                <StatCard title="Monthly Revenue" value={`€${stats?.monthlyRevenue || 0}`} subtitle="current month" />
              </div>
            )}
          </section>

          {/* AI Agent Team */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl">AI Agent Team</h2>
              <button 
                onClick={refreshAgents}
                className="px-4 py-2 bg-black text-white text-sm uppercase tracking-wide hover:bg-gray-800"
              >
                Refresh Agents ({agents.length})
              </button>
            </div>
            {agentsLoading ? (
              <div className="border border-gray-200 p-6 text-center">
                <div className="text-sm text-gray-600">Loading AI agents...</div>
              </div>
            ) : agentsError ? (
              <div className="border border-red-200 bg-red-50 p-6 text-center">
                <div className="text-sm text-red-600">Error loading agents: {agentsError.message}</div>
                <button 
                  onClick={refreshAgents}
                  className="mt-2 px-4 py-2 bg-red-600 text-white text-sm"
                >
                  Retry
                </button>
              </div>
            ) : agents.length === 0 ? (
              <div className="border border-yellow-200 bg-yellow-50 p-6 text-center">
                <div className="text-sm text-yellow-600">No agents found. Expected 9 agents.</div>
                <button 
                  onClick={refreshAgents}
                  className="mt-2 px-4 py-2 bg-yellow-600 text-white text-sm"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {agents.map((agent: any) => (
                  <AgentChat 
                    key={agent.id}
                    agentId={agent.id} 
                    agentName={agent.name} 
                    role={agent.role}
                    status={agent.status || 'active'}
                    currentTask={agent.currentTask || 'Ready to assist'}
                    metrics={agent.metrics || { tasksCompleted: 0, efficiency: 100, lastActivity: new Date() }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

interface AgentChatProps {
  agentId: string;
  agentName: string;
  role: string;
  status?: string;
  currentTask?: string;
  metrics?: {
    tasksCompleted: number;
    efficiency: number;
    lastActivity: Date;
  };
}

function AgentChat({ agentId, agentName, role, status, currentTask, metrics }: AgentChatProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewType, setPreviewType] = useState<'component' | 'layout' | 'page' | 'email'>('component');

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/agents/${agentId}/chat`, { message: content });
      return response.json();
    },
    onSuccess: (data) => {
      const newMessage = {
        id: Date.now(),
        type: 'user',
        content: message,
        timestamp: new Date()
      };
      const agentResponse = {
        id: Date.now() + 1,
        type: 'agent',
        content: data.message,
        timestamp: new Date(),
        hasPreview: data.hasPreview,
        previewContent: data.previewContent,
        previewType: data.previewType
      };
      setChatHistory(prev => [...prev, newMessage, agentResponse]);
      
      // Show preview if agent provided one
      if (data.hasPreview && agentId === 'victoria') {
        setPreviewContent(data.previewContent);
        setPreviewType(data.previewType || 'component');
        setShowPreview(true);
      }
      
      setMessage('');
    }
  });

  return (
    <div className="border border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">{role}</div>
          {status && (
            <span className={`px-2 py-1 text-xs rounded ${
              status === 'active' ? 'bg-green-100 text-green-800' :
              status === 'working' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {status}
            </span>
          )}
        </div>
        <h3 className="font-serif text-xl">{agentName}</h3>
        {currentTask && (
          <div className="text-xs text-gray-500 mt-1">Current: {currentTask}</div>
        )}
        {metrics && (
          <div className="flex text-xs text-gray-500 mt-2 space-x-4">
            <span>Tasks: {metrics.tasksCompleted}</span>
            <span>Efficiency: {metrics.efficiency}%</span>
          </div>
        )}
      </div>
      
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="text-gray-500 text-sm">Ready to assist you - connected to Claude API</div>
        ) : (
          chatHistory.map((msg) => (
            <div key={msg.id} className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-xs p-2 ${
                msg.type === 'user' ? 'bg-black text-white' : 'bg-gray-100'
              }`}>
                <div className="text-sm">{msg.content}</div>
                {msg.hasPreview && (
                  <button
                    onClick={() => {
                      setPreviewContent(msg.previewContent);
                      setPreviewType(msg.previewType);
                      setShowPreview(true);
                    }}
                    className="text-xs mt-1 underline"
                  >
                    View Design Preview
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Visual Design Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-serif text-xl">{agentName} Design Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-sm uppercase tracking-wide hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <VisualDesignPreview
              designContent={previewContent}
              previewType={previewType}
              onApprove={(approved) => {
                if (approved) {
                  // Send approval message
                  sendMessage.mutate("Approved! Please implement this design.");
                } else {
                  // Send revision request
                  sendMessage.mutate("Please revise this design with my feedback.");
                }
                setShowPreview(false);
              }}
            />
          </div>
        </div>
      )}
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) {
            sendMessage.mutate(message);
          }
        }} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${agentName}...`}
            className="flex-1 px-3 py-2 border border-gray-300 text-sm"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={sendMessage.isPending || !message.trim()}
            className="px-4 py-2 bg-black text-white text-sm disabled:opacity-50"
          >
            {sendMessage.isPending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-gray-50 p-6">
      <div className="text-sm text-gray-600 uppercase tracking-wide">{title}</div>
      <div className="text-3xl font-light font-serif mt-2">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}