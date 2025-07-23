import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Image, 
  Brain,
  Settings,
  MessageSquare,
  Eye
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  aiImagesGenerated: number;
  revenue: number;
  conversionRate: number;
  agentTasks: number;
  monthlyRevenue?: number;
  activeUsers?: number;
  totalUploads?: number;
  storageUsed?: string;
  activeTasks?: number;
  totalRevenue?: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const quickActions = [
    {
      id: 1,
      title: 'Visual Editor',
      description: 'Open agent workspace',
      icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
      action: () => window.open('/visual-editor', '_blank'),
      badge: 'Active'
    },
    {
      id: 2,
      title: 'User Analytics',
      description: 'View user metrics',
      icon: <Users className="w-5 h-5 text-green-400" />,
      action: () => setActiveTab('analytics')
    },
    {
      id: 3,
      title: 'AI Performance',
      description: 'Monitor agents',
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      action: () => setActiveTab('agents')
    },
    {
      id: 4,
      title: 'System Health',
      description: 'Platform status',
      icon: <Activity className="w-5 h-5 text-orange-400" />,
      action: () => setActiveTab('analytics')
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* LUXURY EDITORIAL HERO - Full Bleed */}
      <div 
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2874&q=80')`
        }}
      >
        <div className="text-center text-white">
          <h1 
            className="text-8xl font-light text-white mb-8 tracking-widest"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            COMMAND
          </h1>
          <div className="w-32 h-px bg-white mx-auto mb-8"></div>
          <p 
            className="text-2xl font-light tracking-wider opacity-90"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Sandra's Empire Control Center
          </p>
        </div>
      </div>

      {/* EDITORIAL IMAGE BREAK */}
      <div 
        className="h-96 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80')`
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* LUXURY TYPOGRAPHY HEADER */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl font-light text-black mb-6 tracking-wider"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            ADMINISTRATION
          </h2>
          <div className="w-24 h-px bg-black mx-auto"></div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-50 border-0 h-16">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-black data-[state=active]:text-white text-black text-lg"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:bg-black data-[state=active]:text-white text-black text-lg"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              AI AGENTS
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-black data-[state=active]:text-white text-black text-lg"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              ANALYTICS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            {/* LUXURY IMAGE OVERLAY CARDS - Quick Actions */}
            <div className="mb-16">
              <h2 
                className="text-3xl text-black mb-8 text-center"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                QUICK ACTIONS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {quickActions.map((action) => (
                  <div
                    key={action.id}
                    className="relative h-64 bg-cover bg-center cursor-pointer group overflow-hidden"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80')`
                    }}
                    onClick={action.action}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-all duration-300"></div>
                    <div className="relative h-full flex flex-col justify-end p-6 text-white">
                      <div className="mb-4">{action.icon}</div>
                      <h3 
                        className="text-xl font-light mb-2 tracking-wide"
                        style={{ fontFamily: 'Times New Roman, serif' }}
                      >
                        {action.title}
                      </h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                      {action.badge && (
                        <span className="absolute top-4 right-4 bg-white text-black px-2 py-1 text-xs">
                          {action.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EDITORIAL IMAGE BREAK */}
            <div 
              className="h-64 bg-cover bg-center mb-16"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2874&q=80')`
              }}
            ></div>

            {/* LUXURY METRICS GRID WITH BACKGROUND IMAGES */}
            <div className="mb-16">
              <h2 
                className="text-3xl text-black mb-8 text-center"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                BUSINESS INTELLIGENCE
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div 
                  className="relative h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80')`
                  }}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <DollarSign className="h-6 w-6 mb-2 text-green-400" />
                    <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                      €{stats?.revenue || 0}
                    </div>
                    <p className="text-sm opacity-90">Monthly Revenue</p>
                    <p className="text-xs text-green-400 mt-1">+12% from last month</p>
                  </div>
                </div>

                <div 
                  className="relative h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80')`
                  }}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <Users className="h-6 w-6 mb-2 text-blue-400" />
                    <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {stats?.totalUsers || 0}
                    </div>
                    <p className="text-sm opacity-90">Total Users</p>
                    <p className="text-xs text-blue-400 mt-1">Active users</p>
                  </div>
                </div>

                <div 
                  className="relative h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1551651883-1bf16b4f5e18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80')`
                  }}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <Image className="h-6 w-6 mb-2 text-purple-400" />
                    <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {stats?.aiImagesGenerated || 0}
                    </div>
                    <p className="text-sm opacity-90">AI Images</p>
                    <p className="text-xs text-purple-400 mt-1">Generated this month</p>
                  </div>
                </div>

                <div 
                  className="relative h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80')`
                  }}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <TrendingUp className="h-6 w-6 mb-2 text-orange-400" />
                    <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {stats?.conversionRate || 0}%
                    </div>
                    <p className="text-sm opacity-90">Conversion Rate</p>
                    <p className="text-xs text-orange-400 mt-1">Premium signups</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Agent Status */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Agent Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Elena', role: 'Workflow Coordinator', status: 'Active', color: 'green' },
                      { name: 'Aria', role: 'Design Director', status: 'Standby', color: 'blue' },
                      { name: 'Zara', role: 'Dev Architect', status: 'Active', color: 'green' },
                      { name: 'Rachel', role: 'Voice Specialist', status: 'Standby', color: 'blue' },
                      { name: 'Maya', role: 'AI Photographer', status: 'Active', color: 'green' }
                    ].map((agent) => (
                      <div key={agent.name} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${agent.color === 'green' ? 'bg-green-400' : 'bg-blue-400'} animate-pulse`}></div>
                          <div>
                            <p className="text-white font-medium">{agent.name}</p>
                            <p className="text-gray-400 text-sm">{agent.role}</p>
                          </div>
                        </div>
                        <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Agent Actions */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Agent Controls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => window.open('/visual-editor', '_blank')}
                      className="w-full bg-white text-black hover:bg-gray-200"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Open Visual Editor
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-white hover:bg-gray-800"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Agent Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-white hover:bg-gray-800"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Performance Monitor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Analytics */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Total Revenue</span>
                        <span className="text-white">€{stats?.revenue || 0}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Monthly Growth</span>
                        <span className="text-green-400">+12%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Analytics */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Platform Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Active Sessions</span>
                      <span className="text-white">{stats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Storage Used</span>
                      <span className="text-white">2.4 GB</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">AI Tasks</span>
                      <span className="text-white">{stats?.agentTasks || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;