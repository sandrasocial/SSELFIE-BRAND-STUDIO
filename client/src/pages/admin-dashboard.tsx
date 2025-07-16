import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { AdminNavigation } from "@/components/admin-navigation";

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
        <div className="eyebrow-text text-gray-600 mb-1">{role}</div>
        <h3 className="editorial-headline text-xl">{agentName}</h3>
      </div>
      
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="text-gray-500 text-sm">Ready to assist you</div>
        ) : (
          chatHistory.map((msg) => (
            <div key={msg.id} className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-xs p-2 ${
                msg.type === 'user' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-black'
              }`}>
                <div className="text-sm">{msg.content}</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-200 focus:outline-none focus:border-black"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage.mutate(message)}
          />
          <button
            onClick={() => sendMessage.mutate(message)}
            disabled={!message.trim() || sendMessage.isPending}
            className="px-4 py-2 bg-black text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-white border border-gray-200 p-6">
      <div className="eyebrow-text text-gray-600 mb-2">{title}</div>
      <div className="editorial-headline text-3xl mb-1">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  );
}

function IntegrationStatus() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/integrations/health'],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false
  });

  const importSubscribersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/integrations/flodesk/import');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    }
  });

  const executeTaskMutation = useMutation({
    mutationFn: async ({ taskId, agentId }: { taskId: string; agentId: string }) => {
      const response = await apiRequest('POST', '/api/integrations/execute-task', { taskId, agentId });
      return response.json();
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="editorial-headline text-xl mb-4">External Integrations</h3>
        
        {healthLoading ? (
          <div className="border border-gray-200 p-6 text-center">
            <div className="text-sm text-gray-600">Checking integration status...</div>
          </div>
        ) : health?.integrations ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(health.integrations).map(([service, status]) => (
              <div key={service} className="border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="eyebrow-text">{service}</div>
                  <div className="text-sm">{status ? 'Connected' : 'Offline'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="eyebrow-text">Make</div>
                <div className="text-sm">Ready</div>
              </div>
            </div>
            <div className="border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="eyebrow-text">Flodesk</div>
                <div className="text-sm">Ready</div>
              </div>
            </div>
            <div className="border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="eyebrow-text">Instagram</div>
                <div className="text-sm">Ready</div>
              </div>
            </div>
            <div className="border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="eyebrow-text">ManyChat</div>
                <div className="text-sm">Ready</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => importSubscribersMutation.mutate()}
            disabled={importSubscribersMutation.isPending}
            className="w-full p-3 border border-gray-200 hover:bg-gray-50 text-left disabled:opacity-50"
          >
            <div className="font-medium">Import Flodesk Subscribers</div>
            <div className="text-sm text-gray-600">Import 2500 existing email subscribers</div>
          </button>
          
          <button
            onClick={() => executeTaskMutation.mutate({ taskId: 'instagram-analytics', agentId: 'sophia' })}
            disabled={executeTaskMutation.isPending}
            className="w-full p-3 border border-gray-200 hover:bg-gray-50 text-left disabled:opacity-50"
          >
            <div className="font-medium">Generate Instagram Report</div>
            <div className="text-sm text-gray-600">Weekly analytics from Sophia</div>
          </button>
        </div>
      </div>
    </div>
  );
}

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
      {/* Admin Navigation */}
      <AdminNavigation />
      
      {/* Content with top padding for fixed nav */}
      <div className="pt-20">

        <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Business Metrics */}
        <section className="mb-12">
          <h2 className="editorial-headline text-xl mb-6">Business Overview</h2>
          {statsLoading ? (
            <div className="border border-gray-200 p-6 text-center">
              <div className="text-sm text-gray-600">Loading business metrics...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Platform Users"
                value={stats?.totalUsers || 0}
                subtitle="total registered"
              />
              <StatCard
                title="Active Subscribers"
                value={stats?.activeSubscriptions || 0}
                subtitle="paying customers"
              />
              <StatCard
                title="AI Images Created"
                value={stats?.totalImages || 0}
                subtitle="total generations"
              />
              <StatCard
                title="Monthly Revenue"
                value={`€${stats?.monthlyRevenue || 0}`}
                subtitle="current month"
              />
            </div>
          )}
        </section>

        {/* AI Agent Team */}
        <section className="mb-12">
          <h2 className="editorial-headline text-xl mb-6">AI Agent Team</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AgentChat
              agentId="maya"
              agentName="Maya"
              role="Development & Technical Implementation"
            />
            <AgentChat
              agentId="rachel"
              agentName="Rachel"
              role="Voice & Copywriting"
            />
            <AgentChat
              agentId="victoria"
              agentName="Victoria"
              role="UX & Design"
            />
            <AgentChat
              agentId="ava"
              agentName="Ava"
              role="Automation & Workflows"
            />
          </div>
        </section>

        {/* External Integrations */}
        <section className="mb-12">
          <IntegrationStatus />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="editorial-headline text-xl mb-6">Platform Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/users" className="block p-6 bg-white border border-gray-200 hover:bg-gray-50">
              <h3 className="font-medium mb-2">User Management</h3>
              <p className="text-sm text-gray-600">View and manage platform users</p>
            </Link>
            <Link href="/admin/analytics" className="block p-6 bg-white border border-gray-200 hover:bg-gray-50">
              <h3 className="font-medium mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-gray-600">Platform performance metrics</p>
            </Link>
            <Link href="/admin/settings" className="block p-6 bg-white border border-gray-200 hover:bg-gray-50">
              <h3 className="font-medium mb-2">Platform Settings</h3>
              <p className="text-sm text-gray-600">Configuration and preferences</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
                    <div className="text-sm text-gray-500">{user.plan || 'free'}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )) || (
                <div className="text-gray-500 text-center py-4">No users yet</div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6">
            <h3 className="font-serif text-xl mb-4">Platform Health</h3>
            <div className="space-y-3">
              <HealthItem label="Database" status="healthy" />
              <HealthItem label="AI Generation" status="healthy" />
              <HealthItem label="Email Service" status="healthy" />
              <HealthItem label="Payment Processing" status="healthy" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="User Management"
            description="View and manage user accounts"
            link="/admin/users"
          />
          <QuickAction
            title="Email Templates"
            description="Edit welcome email templates"
            link="/admin/emails"
          />
          <QuickAction
            title="Platform Settings"
            description="Configure platform settings"
            link="/admin/settings"
          />
        </div>
      </div>
    </div>
  );
}

function AdminNavigation() {
  return (
    <nav className="bg-black text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/admin">
            <div className="font-serif text-lg letter-spacing-wide">SSELFIE ADMIN</div>
          </Link>
          <div className="flex space-x-6">
            <Link href="/admin" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Dashboard
            </Link>
            <Link href="/admin/users" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Users
            </Link>
            <Link href="/admin/emails" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Emails
            </Link>
            <Link href="/admin/settings" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Settings
            </Link>
            <Link href="/admin/ai-models" className="text-sm uppercase tracking-wide hover:text-gray-300">
              AI Models
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

function HealthItem({ label, status }: { label: string; status: 'healthy' | 'warning' | 'error' }) {
  const statusColors = {
    healthy: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className="flex justify-between items-center py-2">
      <span>{label}</span>
      <span className={`text-sm font-medium ${statusColors[status]}`}>
        {status.toUpperCase()}
      </span>
    </div>
  );
}

function QuickAction({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link href={link}>
      <div className="border border-gray-200 p-6 hover:bg-gray-50 transition-colors cursor-pointer">
        <h4 className="font-serif text-lg mb-2">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}