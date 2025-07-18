import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentEnhancementDashboard from '@/components/AgentEnhancementDashboard';

// Agent configurations with clean data
const AGENTS = [
  { id: 'victoria', name: 'Victoria', role: 'UX Designer AI' },
  { id: 'maya', name: 'Maya', role: 'Dev AI' },
  { id: 'rachel', name: 'Rachel', role: 'Voice AI' },
  { id: 'ava', name: 'Ava', role: 'Automation AI' },
  { id: 'quinn', name: 'Quinn', role: 'QA AI' },
  { id: 'sophia', name: 'Sophia', role: 'Social Media AI' },
  { id: 'martha', name: 'Martha', role: 'Marketing AI' },
  { id: 'diana', name: 'Diana', role: 'Business Coach AI' },
  { id: 'wilma', name: 'Wilma', role: 'Workflow AI' }
];

interface AgentChatMessage {
  id: number;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentName?: string;
}

function AgentChat({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<AgentChatMessage[]>(() => {
    const saved = localStorage.getItem(`admin-chat-${agentId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: AgentChatMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    try {
      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          message,
          adminToken: 'sandra-admin-2025',
          conversationHistory: chatHistory.slice(-10)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const agentMessage: AgentChatMessage = {
          id: Date.now() + 1,
          type: 'agent',
          content: data.message,
          timestamp: new Date(),
          agentName: data.agentName
        };

        const newHistory = [...chatHistory, userMessage, agentMessage];
        setChatHistory(newHistory);
        localStorage.setItem(`admin-chat-${agentId}`, JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error('Chat error:', error);
    }

    setMessage('');
  };

  const clearChat = () => {
    setChatHistory([]);
    localStorage.removeItem(`admin-chat-${agentId}`);
  };

  const rollbackLastMessage = () => {
    if (chatHistory.length >= 2) {
      const newHistory = chatHistory.slice(0, -2);
      setChatHistory(newHistory);
      localStorage.setItem(`admin-chat-${agentId}`, JSON.stringify(newHistory));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-serif text-lg text-black">{agentName}</h3>
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={rollbackLastMessage}
            disabled={chatHistory.length < 2}
            className="border-black text-black hover:bg-black hover:text-white text-xs"
          >
            Rollback
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="border-black text-black hover:bg-black hover:text-white text-xs"
          >
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] ${
              msg.type === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div
              className={`p-3 rounded text-sm ${
                msg.type === 'user'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black'
              }`}
            >
              {msg.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${agentName}...`}
            className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-black text-white hover:bg-gray-800"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardRedesigned() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Security check
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.email !== 'ssa@ssasocial.com')) {
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  // Fetch data
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.email === 'ssa@ssasocial.com',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif text-black">SANDRA COMMAND</h1>
              <p className="text-gray-600 mt-1">Administrative Dashboard</p>
            </div>
            <div className="flex gap-3">
              <Link href="/visual-editor">
                <Button className="border-black text-black hover:bg-black hover:text-white">
                  Visual Editor
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  Back to App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-black">
                {stats?.totalUsers?.toLocaleString() || '—'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-black">
                {stats?.activeSubscriptions || '—'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">AI Images Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-black">
                {stats?.aiImagesGenerated?.toLocaleString() || '—'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-serif text-black">
                €{stats?.revenue?.toLocaleString() || '—'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="agents" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Agents
            </TabsTrigger>
            <TabsTrigger value="enhancements" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Enhancements
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {AGENTS.map((agent) => (
                <Card key={agent.id} className="border-black h-96">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="font-serif text-black">{agent.name}</CardTitle>
                    <p className="text-sm text-gray-600">{agent.role}</p>
                  </CardHeader>
                  <CardContent className="p-0 h-80">
                    <AgentChat agentId={agent.id} agentName={agent.name} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="enhancements" className="mt-6">
            <AgentEnhancementDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="font-serif text-black">Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-serif text-black">
                      {stats?.conversionRate ? `${stats.conversionRate}%` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Agent Tasks Completed</span>
                    <span className="font-serif text-black">
                      {stats?.agentTasks?.toLocaleString() || '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}