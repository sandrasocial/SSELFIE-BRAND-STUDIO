import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, Settings, TrendingUp, Activity, Crown } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'offline' | 'busy';
  description: string;
  metrics: {
    tasksCompleted: number;
    responseTime: string;
    satisfaction: number;
  };
}

const agents: Agent[] = [
  {
    id: '1',
    name: 'Rachel',
    role: 'Content & Voice Strategist',
    status: 'active',
    description: 'Masters Sandra\'s authentic voice and creates compelling content that resonates with SSELFIE\'s luxury audience.',
    metrics: { tasksCompleted: 127, responseTime: '2.3s', satisfaction: 98 }
  },
  {
    id: '2', 
    name: 'Aria',
    role: 'Creative Design Director',
    status: 'active',
    description: 'Crafts stunning visual experiences that embody SSELFIE\'s editorial luxury and sophisticated aesthetic.',
    metrics: { tasksCompleted: 89, responseTime: '1.8s', satisfaction: 97 }
  },
  {
    id: '3',
    name: 'Elena',
    role: 'Strategic Operations Coordinator',
    status: 'busy',
    description: 'Orchestrates complex workflows and ensures seamless coordination across all SSELFIE initiatives.',
    metrics: { tasksCompleted: 156, responseTime: '1.2s', satisfaction: 99 }
  },
  {
    id: '4',
    name: 'Zara',
    role: 'Technical Innovation Lead',
    status: 'active',
    description: 'Transforms vision into flawless code, architecting luxury digital experiences with technical excellence.',
    metrics: { tasksCompleted: 203, responseTime: '0.9s', satisfaction: 98 }
  },
  {
    id: '5',
    name: 'Victoria',
    role: 'Client Experience Specialist',
    status: 'active',
    description: 'Delivers personalized luxury service and maintains SSELFIE\'s reputation for exceptional client relationships.',
    metrics: { tasksCompleted: 234, responseTime: '1.5s', satisfaction: 99 }
  },
  {
    id: '6',
    name: 'Quinn',
    role: 'Business Intelligence Analyst',
    status: 'offline',
    description: 'Provides data-driven insights and strategic analysis to optimize SSELFIE\'s performance and growth.',
    metrics: { tasksCompleted: 67, responseTime: '3.1s', satisfaction: 96 }
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'busy': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'offline': return 'bg-gray-100 text-gray-600 border-gray-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      {/* Luxury Hero Section */}
      <div className="relative bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Crown className="w-12 h-12 text-amber-300 mr-4" />
              <h1 className="text-6xl font-normal tracking-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
                SSELFIE STUDIO
              </h1>
            </div>
            <p className="text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
              Command Center for Luxury Digital Excellence
            </p>
            <div className="mt-8 flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-300">6</div>
                <div className="text-sm text-stone-400">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-300">876</div>
                <div className="text-sm text-stone-400">Tasks Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-300">98%</div>
                <div className="text-sm text-stone-400">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Active Users', value: '2,847', change: '+12%', icon: Users },
                { title: 'Total Sessions', value: '18,293', change: '+23%', icon: Activity },
                { title: 'Avg Response Time', value: '1.6s', change: '-15%', icon: MessageSquare },
                { title: 'System Health', value: '99.8%', change: '+0.2%', icon: TrendingUp }
              ].map((stat, index) => (
                <Card key={index} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 font-medium">{stat.title}</p>
                        <p className="text-3xl font-bold text-stone-900 mt-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {stat.value}
                        </p>
                        <p className="text-sm text-emerald-600 mt-1">{stat.change} from last month</p>
                      </div>
                      <stat.icon className="w-8 h-8 text-stone-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Agent Status Overview */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-normal" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Agent Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {agents.slice(0, 6).map((agent) => (
                    <div key={agent.id} className="p-6 bg-stone-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-stone-900">{agent.name}</h3>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-stone-600 mb-4">{agent.role}</p>
                      <div className="space-y-2 text-xs text-stone-500">
                        <div className="flex justify-between">
                          <span>Tasks:</span>
                          <span className="font-medium">{agent.metrics.tasksCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response:</span>
                          <span className="font-medium">{agent.metrics.responseTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rating:</span>
                          <span className="font-medium">{agent.metrics.satisfaction}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {agents.map((agent) => (
                <Card key={agent.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-normal mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {agent.name}
                        </CardTitle>
                        <p className="text-stone-600 font-medium">{agent.role}</p>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-stone-700 mb-6 leading-relaxed">{agent.description}</p>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-600">Tasks Completed</span>
                        <span className="font-bold text-stone-900">{agent.metrics.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-600">Avg Response Time</span>
                        <span className="font-bold text-stone-900">{agent.metrics.responseTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-600">Satisfaction Rate</span>
                        <span className="font-bold text-emerald-600">{agent.metrics.satisfaction}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t flex space-x-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 bg-stone-900 hover:bg-stone-800">
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-normal" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600">Analytics dashboard coming soon...</p>
                  <p className="text-sm text-stone-500 mt-2">Advanced metrics and insights will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-normal" style={{ fontFamily: 'Times New Roman, serif' }}>
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600">System settings coming soon...</p>
                  <p className="text-sm text-stone-500 mt-2">Configure agents, preferences, and system parameters</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}