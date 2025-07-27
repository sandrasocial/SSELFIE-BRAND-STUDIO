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

export const AdminDashboard: React.FC = () => {
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 
            className="text-5xl font-light text-white mb-4 tracking-wider"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            ADMIN DASHBOARD
          </h1>
          <div className="w-24 h-px bg-white mx-auto"></div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-0 h-12">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
            >
              AI Agents
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action) => (
                  <Card 
                    key={action.id} 
                    className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-colors cursor-pointer"
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
                      <CardTitle className="text-sm text-white mb-1">
                        {action.title}
                      </CardTitle>
                      <p className="text-xs text-gray-400">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Business Metrics */}
            <div className="mb-8">
              <h2 className="text-xl text-white mb-6">Business Intelligence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Monthly Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      €{stats?.revenue || 0}
                    </div>
                    <p className="text-xs text-green-400 mt-1">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {stats?.totalUsers || 0}
                    </div>
                    <p className="text-xs text-blue-400 mt-1">
                      Active users
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      AI Images
                    </CardTitle>
                    <Image className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {stats?.aiImagesGenerated || 0}
                    </div>
                    <p className="text-xs text-purple-400 mt-1">
                      Generated this month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      Conversion Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {stats?.conversionRate || 0}%
                    </div>
                    <p className="text-xs text-orange-400 mt-1">
                      Premium signups
                    </p>
                  </CardContent>
                </Card>
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