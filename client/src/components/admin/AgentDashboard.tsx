import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface Agent {
  id: string;
  name: string;
  role: string;
  personality?: string;
  capabilities?: string[];
  status: 'active' | 'working' | 'available';
  currentTask?: string;
  metrics: {
    tasksCompleted: number;
    efficiency: number;
    lastActivity: Date;
  };
}

const AgentDashboard: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [location, setLocation] = useLocation();

  // Fetch live agents data from API (includes Olga!)
  const { data: agents = [], isLoading: agentsLoading, error: agentsError } = useQuery({
    queryKey: ['/api/agents'],
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-black text-white';
      case 'working': return 'bg-gray-600 text-white';
      case 'available': return 'bg-gray-200 text-black';
      default: return 'bg-gray-200 text-black';
    }
  };

  const handleAgentChat = (agentId: string) => {
    // Navigate to visual editor with selected agent
    setLocation(`/visual-editor?agent=${agentId}`);
  };

  const handleQuickChat = (agentId: string) => {
    // Scroll to the quick chat interface in the admin dashboard
    const element = document.getElementById(`agent-chat-${agentId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: navigate to visual editor if quick chat not found
      setLocation(`/visual-editor?agent=${agentId}`);
    }
  };

  if (agentsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading your agent team...</p>
        </div>
      </div>
    );
  }

  if (agentsError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load agents</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                Agent Command Center
              </h1>
              <p className="text-gray-600 mt-2">
                Your complete AI team ({agents.length} agents) ready for implementation and design work
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/visual-editor')}
              className="bg-black text-white hover:bg-gray-800"
            >
              Open Visual Editor
            </Button>
          </div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card 
              key={agent.id} 
              className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium text-black mb-1">
                      {agent.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 font-medium mb-2">
                      {agent.role}
                    </p>
                    <Badge className={`text-xs ${getStatusColor(agent.status)}`}>
                      {agent.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Tasks</div>
                    <div className="text-lg font-medium text-black">
                      {agent.metrics?.tasksCompleted || 0}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {agent.personality || 'AI agent ready for tasks'}
                </p>

                {/* Current Task */}
                {agent.currentTask && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">CURRENT TASK</div>
                    <p className="text-xs text-gray-700">{agent.currentTask}</p>
                  </div>
                )}

                {/* Capabilities */}
                {agent.capabilities && agent.capabilities.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">CAPABILITIES</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.slice(0, 3).map((capability, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {capability.length > 25 ? capability.substring(0, 25) + '...' : capability}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAgentChat(agent.id)}
                    className="flex-1 bg-black text-white hover:bg-gray-800 text-sm"
                  >
                    Chat & Implement
                  </Button>
                  <Button
                    onClick={() => handleQuickChat(agent.id)}
                    variant="outline"
                    className="px-3 border-black text-black hover:bg-black hover:text-white text-sm"
                  >
                    Quick Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-light text-black">1,000+</div>
              <div className="text-sm text-gray-600">Platform Users</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-light text-black">€15,132</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-light text-black">87%</div>
              <div className="text-sm text-gray-600">Profit Margin</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-light text-black">{agents.length}</div>
              <div className="text-sm text-gray-600">AI Agents Ready</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;