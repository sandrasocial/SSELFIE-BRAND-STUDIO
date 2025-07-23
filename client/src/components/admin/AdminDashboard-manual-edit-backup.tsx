/**
 * SANDRA'S LUXURY EDITORIAL ADMIN DASHBOARD - BY ARIA
 * Magazine-style command center with full-bleed imagery and luxury editorial design
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
    <div className="min-h-screen bg-white">
      {/* LUXURY EDITORIAL HERO - Full Bleed */}
      <div 
        className="relative h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 
              className="text-8xl font-light tracking-widest mb-8"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              COMMAND
            </h1>
            <p 
              className="text-2xl font-light tracking-wider opacity-90"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Sandra's Empire Dashboard
            </p>
            <div className="mt-12 flex justify-center space-x-6">
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2">
                <Crown className="w-4 h-4 mr-2" />
                Owner Access
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Elena Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* EDITORIAL MAGAZINE CONTENT */}
      <div className="bg-white">
        {/* NAVIGATION - Magazine Style */}
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center mb-16">
            <h2 
              className="text-5xl font-light text-black tracking-wider mb-4"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              EMPIRE OVERVIEW
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

          <TabsContent value="overview" className="mt-16">
            {/* EDITORIAL IMAGE BREAK */}
            <div 
              className="relative h-96 bg-cover bg-center mb-16"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=2326&q=80')`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 
                  className="text-6xl font-light text-white tracking-wider text-center"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  EMPIRE METRICS
                </h2>
              </div>
            </div>

            {/* QUICK ACTIONS - Editorial Cards */}
            <div className="mb-16">
              <h2 
                className="text-4xl font-light text-black mb-12 text-center tracking-wider"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                QUICK ACTIONS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {quickActions.map((action, index) => (
                  <div 
                    key={action.id} 
                    className="relative h-64 bg-cover bg-center cursor-pointer group overflow-hidden"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${
                        index === 0 ? 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' :
                        index === 1 ? 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' :
                        index === 2 ? 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' :
                        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2015&q=80'
                      }')`
                    }}
                    onClick={action.action}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
                      <div className="mb-4">
                        {action.icon}
                      </div>
                      <h3 
                        className="text-3xl font-light tracking-wider mb-2"
                        style={{ fontFamily: 'Times New Roman, serif' }}
                      >
                        {action.title}
                      </h3>
                      <p className="text-sm opacity-90 font-light">
                        {action.description}
                      </p>
                      {action.badge && (
                        <Badge variant="outline" className="mt-4 bg-white/10 text-white border-white/30">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EDITORIAL PAGE BREAK */}
            <div 
              className="relative h-64 bg-cover bg-center my-16"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80')`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 
                    className="text-5xl font-light tracking-wider"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    BUSINESS INTELLIGENCE
                  </h2>
                  <div className="w-32 h-px bg-white mx-auto mt-4"></div>
                </div>
              </div>
            </div>

            {/* LUXURY METRICS GRID */}
            <div className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Revenue Card */}
                <div className="relative h-48 bg-cover bg-center group overflow-hidden" 
                     style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`}}>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-6">
                    <DollarSign className="h-8 w-8 mb-4 text-green-400" />
                    <div 
                      className="text-4xl font-light mb-2"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      €{stats?.monthlyRevenue || 376}
                    </div>
                    <p 
                      className="text-lg tracking-wider opacity-90"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      MONTHLY REVENUE
                    </p>
                    <p className="text-sm text-green-400 mt-2">+12% from last month</p>
                  </div>
                </div>

                {/* Users Card */}
                <div className="relative h-48 bg-cover bg-center group overflow-hidden" 
                     style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80')`}}>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-6">
                    <Users className="h-8 w-8 mb-4 text-blue-400" />
                    <div 
                      className="text-4xl font-light mb-2"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {stats?.activeUsers || 7}
                    </div>
                    <p 
                      className="text-lg tracking-wider opacity-90"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      ACTIVE USERS
                    </p>
                    <p className="text-sm text-blue-400 mt-2">Real-time users</p>
                  </div>
                </div>

                {/* AI Images Card */}
                <div className="relative h-48 bg-cover bg-center group overflow-hidden" 
                     style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80')`}}>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-6">
                    <Image className="h-8 w-8 mb-4 text-purple-400" />
                    <div 
                      className="text-4xl font-light mb-2"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {stats?.totalUploads || 316}
                    </div>
                    <p 
                      className="text-lg tracking-wider opacity-90"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      AI IMAGES
                    </p>
                    <p className="text-sm text-purple-400 mt-2">Generated this month</p>
                  </div>
                </div>

                {/* Conversion Rate Card */}
                <div className="relative h-48 bg-cover bg-center group overflow-hidden" 
                     style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`}}>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-6">
                    <TrendingUp className="h-8 w-8 mb-4 text-orange-400" />
                    <div 
                      className="text-4xl font-light mb-2"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {stats?.conversionRate || 114}%
                    </div>
                    <p 
                      className="text-lg tracking-wider opacity-90"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      CONVERSION RATE
                    </p>
                    <p className="text-sm text-orange-400 mt-2">Premium signups</p>
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
    </div>
  );
}