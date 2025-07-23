/**
 * SANDRA'S LUXURY ADMIN DASHBOARD - REDESIGNED BY ELENA'S WORKFLOW
 * Single-page command center with elegant UX and powerful insights
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  Image, 
  TrendingUp, 
  MessageSquare, 
  Settings,
  Crown,
  Sparkles,
  Activity,
  Upload,
  Database,
  Eye,
  Brain,
  Zap,
  Shield,
  Palette,
  Edit3
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalUploads: number;
  storageUsed: string;
  monthlyRevenue: number;
  totalRevenue: number;
  conversionRate: number;
  activeTasks: number;
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
  }>;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const quickActions: QuickAction[] = [
    {
      id: 'visual-editor',
      title: 'Visual Editor',
      description: 'Access development environment',
      icon: <Edit3 className="w-5 h-5" />,
      action: () => window.open('/visual-editor', '_blank'),
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
      action: () => console.log('Navigate to AI agents'),
      badge: 'Active'
    },
    {
      id: 'analytics',
      title: 'Business Analytics',
      description: 'Revenue and performance insights',
      icon: <TrendingUp className="w-5 h-5" />,
      action: () => console.log('Navigate to analytics')
    }
  ];

  if (isLoading) {
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
    <div className="min-h-screen bg-black text-white">
      {/* Luxury Header */}
      <div className="relative bg-black py-12 px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-5xl font-light text-white uppercase tracking-wider mb-2"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Command Center
              </h1>
              <p 
                className="text-lg text-gray-300 font-light italic"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                SSELFIE Studio • Enterprise Dashboard
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-950 text-green-400 border-green-400">
                <Crown className="w-3 h-3 mr-1" />
                Owner Access
              </Badge>
              <Badge variant="outline" className="bg-blue-950 text-blue-400 border-blue-400">
                <Shield className="w-3 h-3 mr-1" />
                Elena Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-800">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:text-black"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:bg-white data-[state=active]:text-black"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              AI Agents
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-white data-[state=active]:text-black"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            {/* Quick Actions */}
            <div className="mb-8">
              <h2 
                className="text-2xl font-light text-white mb-6"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Quick Actions
              </h2>
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
                      <CardTitle 
                        className="text-sm text-white mb-1"
                        style={{ fontFamily: 'Times New Roman, serif' }}
                      >
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
              <h2 
                className="text-2xl font-light text-white mb-6"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Business Intelligence
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle 
                      className="text-sm font-medium text-gray-300"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      Monthly Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-3xl font-light text-white"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      €{stats?.monthlyRevenue || 0}
                    </div>
                    <p className="text-xs text-green-400 mt-1">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle 
                      className="text-sm font-medium text-gray-300"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      Active Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-3xl font-light text-white"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {stats?.activeUsers || 0}
                    </div>
                    <p className="text-xs text-blue-400 mt-1">
                      Real-time users
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle 
                      className="text-sm font-medium text-gray-300"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      AI Images
                    </CardTitle>
                    <Image className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-3xl font-light text-white"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {stats?.totalUploads || 0}
                    </div>
                    <p className="text-xs text-purple-400 mt-1">
                      Generated this month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle 
                      className="text-sm font-medium text-gray-300"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      Conversion Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-3xl font-light text-white"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
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
                  <CardTitle 
                    className="text-xl text-white flex items-center"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    AI Agent Status
                  </CardTitle>
                  <CardDescription>
                    Real-time agent performance and activity
                  </CardDescription>
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
                  <CardTitle 
                    className="text-xl text-white flex items-center"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Agent Commands
                  </CardTitle>
                  <CardDescription>
                    Direct agent coordination and workflow management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => window.open('/visual-editor', '_blank')}
                      className="w-full bg-white text-black hover:bg-gray-200"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Open Visual Editor
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-white hover:bg-gray-800"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Agent Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-white hover:bg-gray-800"
                      style={{ fontFamily: 'Times New Roman, serif' }}
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
                  <CardTitle 
                    className="text-xl text-white flex items-center"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Revenue Analytics
                  </CardTitle>
                  <CardDescription>
                    Financial performance and growth metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Total Revenue</span>
                        <span className="text-white font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                          €{stats?.totalRevenue || 0}
                        </span>
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
                  <CardTitle 
                    className="text-xl text-white flex items-center"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Platform Insights
                  </CardTitle>
                  <CardDescription>
                    User behavior and platform performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Active Sessions</span>
                      <span className="text-white">{stats?.activeUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Storage Used</span>
                      <span className="text-white">{stats?.storageUsed || '0 GB'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">AI Tasks</span>
                      <span className="text-white">{stats?.activeTasks || 0}</span>
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
}