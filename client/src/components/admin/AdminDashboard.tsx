import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from 'wouter';
import { 
  Crown, 
  Shield, 
  MessageSquare, 
  Users, 
  Brain, 
  Activity, 
  TrendingUp, 
  Edit3,
  Settings,
  Eye,
  BarChart3,
  Sparkles,
  Send,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  recentActivity: Array<{
    id: string;
    type: 'user_joined' | 'post_created' | 'like_given';
    description: string;
    timestamp: string;
  }>;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'working' | 'available';
  color: string;
  tasksCompleted: number;
  currentTask?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  message: string;
  timestamp: string;
}

const agents: Agent[] = [
  { id: 'elena', name: 'Elena', role: 'Workflow Coordinator', status: 'active', color: 'from-purple-500 to-pink-500', tasksCompleted: 847 },
  { id: 'aria', name: 'Aria', role: 'Design Director', status: 'available', color: 'from-blue-500 to-indigo-500', tasksCompleted: 234 },
  { id: 'rachel', name: 'Rachel', role: 'Voice & Copy', status: 'working', color: 'from-green-500 to-emerald-500', tasksCompleted: 567, currentTask: 'Writing campaign copy' },
  { id: 'maya', name: 'Maya', role: 'Dev AI', status: 'available', color: 'from-orange-500 to-red-500', tasksCompleted: 892 },
  { id: 'ava', name: 'Ava', role: 'Automation', status: 'active', color: 'from-cyan-500 to-blue-500', tasksCompleted: 445 },
  { id: 'quinn', name: 'Quinn', role: 'Quality Guardian', status: 'available', color: 'from-violet-500 to-purple-500', tasksCompleted: 321 },
  { id: 'sophia', name: 'Sophia', role: 'Social Media', status: 'working', color: 'from-pink-500 to-rose-500', tasksCompleted: 678, currentTask: 'Instagram strategy' },
  { id: 'martha', name: 'Martha', role: 'Marketing & Ads', status: 'available', color: 'from-amber-500 to-orange-500', tasksCompleted: 234 },
  { id: 'diana', name: 'Diana', role: 'Business Coach', status: 'active', color: 'from-emerald-500 to-teal-500', tasksCompleted: 456 },
  { id: 'wilma', name: 'Wilma', role: 'Workflow Architect', status: 'available', color: 'from-slate-500 to-gray-500', tasksCompleted: 123 }
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState<{ [agentId: string]: ChatMessage[] }>({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    enabled: !!(user && (user.email === 'ssa@ssasocial.com' || user.role === 'admin')),
  });

  // Check if user is Sandra (admin access required)  
  if (!user || (user.email !== 'ssa@ssasocial.com' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  const sendMessage = async (agentId: string, message: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    const messageId = Date.now().toString();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: messageId,
      sender: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), userMessage]
    }));
    
    setCurrentMessage('');
    
    try {
      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          adminToken: 'sandra-admin-2025',
          agentId,
          message: message.trim(),
          conversationHistory: chatMessages[agentId] || []
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          message: data.response || 'I received your message!',
          timestamp: new Date().toISOString()
        };
        
        setChatMessages(prev => ({
          ...prev,
          [agentId]: [...(prev[agentId] || []), userMessage, agentMessage]
        }));
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), userMessage, errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'working': return 'bg-yellow-500';
      case 'available': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const quickActions = [
    {
      id: 'visual-editor',
      title: 'Visual Editor',
      description: 'Access development environment',
      icon: <Edit3 className="w-5 h-5" />,
      action: () => setLocation('/admin-visual-editor'),
      badge: 'Dev'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'View and manage platform users',
      icon: <Users className="w-5 h-5" />,
      action: () => console.log('Navigate to users'),
      badge: 'Live'
    },
    {
      id: 'ai-agents',
      title: 'AI Agent Hub',
      description: 'Coordinate with Elena and team',
      icon: <Brain className="w-5 h-5" />,
      action: () => setActiveTab('agents'),
      badge: 'Active'
    },
    {
      id: 'analytics',
      title: 'Business Analytics',
      description: 'Revenue and performance insights',
      icon: <TrendingUp className="w-5 h-5" />,
      action: () => setActiveTab('analytics')
    }
  ];

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
          <div className="text-white text-xl" style={{ fontFamily: 'Times New Roman, serif' }}>
            Loading command center...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* LUXURY EDITORIAL HERO - Full Bleed */}
      <div 
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 
              className="text-6xl font-light tracking-widest mb-6"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              COMMAND
            </h1>
            <p 
              className="text-xl font-light tracking-wider opacity-90"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Sandra's Empire Dashboard
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1">
                <Crown className="w-4 h-4 mr-2" />
                Owner Access
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1">
                <Shield className="w-4 h-4 mr-2" />
                Elena Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-100 h-12">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="agents" 
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                AI Agents
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-serif text-black mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action) => (
                  <Card 
                    key={action.id} 
                    className="bg-white border-2 border-gray-200 hover:border-black transition-colors cursor-pointer group"
                    onClick={action.action}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        {action.icon}
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-medium text-black mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div>
                <h2 className="text-2xl font-serif text-black mb-6">Platform Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gray-50 border-0">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-600 uppercase tracking-wide">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-light font-serif">{stats.totalUsers}</div>
                      <div className="text-sm text-gray-500 mt-1">Registered members</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-0">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-600 uppercase tracking-wide">AI Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-light font-serif">{stats.totalPosts}</div>
                      <div className="text-sm text-gray-500 mt-1">Generated this month</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-0">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-600 uppercase tracking-wide">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-light font-serif">{stats.totalLikes}</div>
                      <div className="text-sm text-gray-500 mt-1">Total interactions</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif text-black">AI Agent Command Center</h2>
              <Badge className="bg-green-100 text-green-800">
                {agents.filter(a => a.status === 'active').length} Agents Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agent Grid */}
              <div className="space-y-4">
                {agents.map((agent) => (
                  <Card 
                    key={agent.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedAgent === agent.id 
                        ? 'border-black shadow-lg' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                          <div>
                            <h3 className="font-medium text-black">{agent.name}</h3>
                            <p className="text-sm text-gray-600">{agent.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-black">{agent.tasksCompleted}</div>
                          <div className="text-xs text-gray-500">tasks completed</div>
                        </div>
                      </div>
                      {agent.currentTask && (
                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Currently: {agent.currentTask}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Agent Chat Interface */}
              <div className="lg:sticky lg:top-8">
                {selectedAgent ? (
                  <Card className="h-96">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Chat with {agents.find(a => a.id === selectedAgent)?.name}
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedAgent(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full p-0">
                      <ScrollArea className="flex-1 px-4">
                        <div className="space-y-3 py-2">
                          {(chatMessages[selectedAgent] || []).map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                  msg.sender === 'user'
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-black'
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t">
                        <div className="flex space-x-2">
                          <Input
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            placeholder={`Message ${agents.find(a => a.id === selectedAgent)?.name}...`}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !isLoading) {
                                sendMessage(selectedAgent, currentMessage);
                              }
                            }}
                            disabled={isLoading}
                          />
                          <Button 
                            onClick={() => sendMessage(selectedAgent, currentMessage)}
                            disabled={isLoading || !currentMessage.trim()}
                            size="sm"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Brain className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p>Select an agent to start chatting</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-black mb-6">Business Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-50 border-0">
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-light font-serif mb-2">€0</div>
                    <div className="text-sm text-gray-500">Pre-launch phase</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 border-0">
                  <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">All systems operational</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}