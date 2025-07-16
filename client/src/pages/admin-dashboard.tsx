import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

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
            <h2 className="font-serif text-2xl mb-6">AI Agent Team</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgentChat agentId="maya" agentName="Maya" role="Dev AI Expert" />
              <AgentChat agentId="rachel" agentName="Rachel" role="Voice AI Copywriter" />
              <AgentChat agentId="victoria" agentName="Victoria" role="UX Designer AI" />
              <AgentChat agentId="ava" agentName="Ava" role="Automation AI" />
            </div>
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
}

function AgentChat({ agentId, agentName, role }: AgentChatProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

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
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, newMessage, agentResponse]);
      setMessage('');
    }
  });

  return (
    <div className="border border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="text-sm text-gray-600 mb-1">{role}</div>
        <h3 className="font-serif text-xl">{agentName}</h3>
      </div>
      
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="text-gray-500 text-sm">Ready to assist you</div>
        ) : (
          chatHistory.map((msg) => (
            <div key={msg.id} className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-xs p-2 ${
                msg.type === 'user' ? 'bg-black text-white' : 'bg-gray-100'
              }`}>
                <div className="text-sm">{msg.content}</div>
              </div>
            </div>
          ))
        )}
      </div>
      
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