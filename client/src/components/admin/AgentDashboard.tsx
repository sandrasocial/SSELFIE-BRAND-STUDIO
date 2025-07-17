import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'wouter';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  specialties: string[];
  status: 'active' | 'working' | 'available';
  tasksCompleted: number;
  currentTask?: string;
}

const agents: Agent[] = [
  {
    id: 'victoria',
    name: 'Victoria',
    role: 'UX Designer AI',
    description: 'Luxury editorial design expert creating pixel-perfect layouts with Times New Roman typography',
    specialties: ['Vogue Aesthetic', 'Luxury Design', 'Editorial Layouts', 'Component Design'],
    status: 'available',
    tasksCompleted: 47
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Dev AI',
    description: 'Senior full-stack developer specializing in luxury digital experiences and performance optimization',
    specialties: ['React/TypeScript', 'Database Design', 'API Development', 'Performance'],
    status: 'available',
    tasksCompleted: 32
  },
  {
    id: 'rachel',
    name: 'Rachel',
    role: 'Voice AI',
    description: 'Sandra\'s copywriting twin who writes exactly like her with authentic conversion-focused copy',
    specialties: ['Brand Voice', 'Conversion Copy', 'Email Campaigns', 'Content Strategy'],
    status: 'available',
    tasksCompleted: 28
  },
  {
    id: 'ava',
    name: 'Ava',
    role: 'Automation AI',
    description: 'Behind-the-scenes workflow architect creating invisible automation that feels like personal assistance',
    specialties: ['Workflow Design', 'API Integration', 'Email Automation', 'Business Logic'],
    status: 'available',
    tasksCompleted: 19
  },
  {
    id: 'quinn',
    name: 'Quinn',
    role: 'QA AI',
    description: 'Luxury quality guardian with perfectionist attention ensuring everything feels expensive and flawless',
    specialties: ['Quality Testing', 'User Experience', 'Performance Audit', 'Bug Detection'],
    status: 'available',
    tasksCompleted: 15
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Social Media Manager AI',
    description: 'Content calendar creator and Instagram engagement specialist for the 120K+ community',
    specialties: ['Content Strategy', 'Community Management', 'Analytics', 'Visual Content'],
    status: 'available',
    tasksCompleted: 23
  },
  {
    id: 'martha',
    name: 'Martha',
    role: 'Marketing/Ads AI',
    description: 'Performance marketing expert who runs ads and identifies opportunities for revenue growth',
    specialties: ['Ad Campaigns', 'Performance Analytics', 'Revenue Optimization', 'A/B Testing'],
    status: 'available',
    tasksCompleted: 12
  },
  {
    id: 'diana',
    name: 'Diana',
    role: 'Personal Mentor & Business Coach AI',
    description: 'Sandra\'s strategic advisor providing business coaching and decision-making guidance',
    specialties: ['Strategic Planning', 'Business Coaching', 'Team Direction', 'Goal Setting'],
    status: 'available',
    tasksCompleted: 8
  },
  {
    id: 'wilma',
    name: 'Wilma',
    role: 'Workflow AI',
    description: 'Workflow architect designing efficient business processes and coordinating agent collaboration',
    specialties: ['Process Design', 'System Integration', 'Efficiency Optimization', 'Team Coordination'],
    status: 'available',
    tasksCompleted: 6
  }
];

const AgentDashboard: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const navigate = useNavigate();

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
    navigate(`/visual-editor?agent=${agentId}`);
  };

  const handleQuickChat = (agentId: string) => {
    setSelectedAgent(agentId);
    // This will open a quick chat modal (to be implemented)
  };

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
                Your complete AI team ready for implementation and design work
              </p>
            </div>
            <Button 
              onClick={() => navigate('/visual-editor')}
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
                      {agent.tasksCompleted}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {agent.description}
                </p>

                {/* Specialties */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">SPECIALTIES</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 border border-gray-200"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Task */}
                {agent.currentTask && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">CURRENT TASK</div>
                    <div className="text-sm text-gray-700">{agent.currentTask}</div>
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
              <div className="text-2xl font-light text-black">9</div>
              <div className="text-sm text-gray-600">AI Agents Ready</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;