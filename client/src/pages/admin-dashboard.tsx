import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Navigation } from '@/components/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface QuickAction {
  title: string;
  description: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  aiImagesGenerated: number;
  revenue: number;
  conversionRate: number;
  agentTasks: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState('');
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real stats from API
  const { data: stats = {
    totalUsers: 0,
    activeSubscriptions: 0,
    aiImagesGenerated: 0,
    revenue: 0,
    conversionRate: 0,
    agentTasks: 0
  } } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      return response.json();
    }
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['/api/agents'],
    queryFn: async () => {
      const response = await fetch('/api/agents', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    retry: false
  });

  const quickActions: QuickAction[] = [
    {
      title: 'View Progress',
      description: 'Track development milestones and completed features',
      action: () => window.location.href = '/admin/progress'
    },
    {
      title: 'Post-Launch Roadmap',
      description: 'Strategic features to build after SSELFIE Studio launch',
      action: () => window.location.href = '/admin/roadmap'
    },
    {
      title: 'Agent Sandbox',
      description: 'Test and interact with AI agents safely',
      action: () => window.location.href = '/sandbox'
    },
    {
      title: 'Review AI Gallery',
      description: 'Moderate and approve AI-generated images',
      action: () => window.open('/gallery-review', '_blank')
    },
    {
      title: 'Customer Support',
      description: 'Handle user inquiries and feedback',
      action: () => window.open('/support', '_blank')
    },
    {
      title: 'Platform Settings',
      description: 'Configure system and user settings',
      action: () => window.open('/settings', '_blank'),
      variant: 'outline' as const
    }
  ];

  const handleAgentRequest = async () => {
    if (!selectedAgent || !task.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          agentId: selectedAgent,
          task: task.trim(),
          context: context.trim() || undefined
        })
      });
      
      const result = await response.json();
      setAgentResponse(result.response);
    } catch (error) {
      console.error('Agent request failed:', error);
      setAgentResponse('Sorry, I had trouble connecting to that agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Access Restricted
          </h1>
          <p className="text-gray-600 mb-6">Please log in to access the admin dashboard.</p>
          <Button onClick={() => window.location.href = '/api/login'}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroFullBleed
        backgroundImage={SandraImages.hero.dashboard}
        title={
          <div className="text-left">
            <div className="text-xs tracking-ultra-wide uppercase text-white/60 mb-8 font-light">SANDRA'S COMMAND CENTER</div>
            <div className="text-4xl md:text-6xl font-light text-white" style={{ fontFamily: 'Times New Roman, serif' }}>
              ADMIN DASHBOARD
            </div>
          </div>
        }
        tagline="Your Complete Business Control Center"
        alignment="left"
        overlay={0.7}
        fullHeight={false}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-gray-500">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats.totalUsers.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-gray-500">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats.activeSubscriptions}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-gray-500">AI Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats.aiImagesGenerated.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-gray-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                €{stats.revenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-gray-500">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats.conversionRate}%
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-gray-500">Agent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats.agentTasks}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
                    <CardHeader>
                      <CardTitle className="text-lg font-normal">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant={action.variant || 'default'} size="sm" className="w-full">
                        Open
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Recent Activity
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">New user registered</p>
                        <p className="text-sm text-gray-500">sarah.j@example.com</p>
                      </div>
                      <Badge variant="outline">2 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">AI image generated</p>
                        <p className="text-sm text-gray-500">Professional headshot for user #1243</p>
                      </div>
                      <Badge variant="outline">5 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">New subscription</p>
                        <p className="text-sm text-gray-500">SSELFIE Studio Plan - €97</p>
                      </div>
                      <Badge variant="outline">12 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">Agent task completed</p>
                        <p className="text-sm text-gray-500">Rachel created welcome email sequence</p>
                      </div>
                      <Badge variant="outline">18 min ago</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-8">
            <div>
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                AI Agent Command Center
              </h2>
              
              {/* Agent Status */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Agent Status</CardTitle>
                  <CardDescription>Current status of all AI agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {agents && agents.length > 0 ? agents.map((agent: any) => (
                      <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-gray-500">{agent.role}</p>
                        </div>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                    )) : (
                      <div className="col-span-3 text-center text-gray-500 py-8">
                        <p>Agents are loading...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Agent Communication */}
              <Card>
                <CardHeader>
                  <CardTitle>Communicate with Agents</CardTitle>
                  <CardDescription>Send tasks and get responses from your AI team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Agent</label>
                      <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Choose an agent...</option>
                        <option value="victoria">Victoria - UX Designer</option>
                        <option value="maya">Maya - Dev AI</option>
                        <option value="rachel">Rachel - Voice AI</option>
                        <option value="ava">Ava - Automation AI</option>
                        <option value="quinn">Quinn - QA AI</option>
                        <option value="sophia">Sophia - Social Media</option>
                        <option value="martha">Martha - Marketing</option>
                        <option value="diana">Diana - Business Coach</option>
                        <option value="wilma">Wilma - Workflow AI</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Context (Optional)</label>
                      <input
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Additional context for the agent..."
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task</label>
                    <textarea
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="What would you like the agent to do?"
                      rows={3}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <Button
                    onClick={handleAgentRequest}
                    disabled={!selectedAgent || !task.trim() || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Sending...' : 'Send Task to Agent'}
                  </Button>
                  
                  {agentResponse && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Agent Response:</h4>
                      <p className="text-sm whitespace-pre-wrap">{agentResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div>
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                User Management
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500">User management interface coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div>
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Content Management
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500">Content management interface coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}