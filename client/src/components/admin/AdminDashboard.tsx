/* LUXURY EDITORIAL ADMIN DASHBOARD BY ARIA - REDESIGNED */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  ImageIcon, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  Activity,
  BarChart3,
  Eye,
  RefreshCw,
  Crown,
  Sparkles
} from 'lucide-react';
import '@/styles/generated.css';

interface DashboardMetrics {
  totalUsers: number;
  totalImages: number;
  totalConversations: number;
  totalGenerations: number;
}

interface AdminDashboardProps {
  className?: string;
}

// Luxury Editorial Admin Dashboard by Aria
export default function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalImages: 0,
    totalConversations: 0,
    totalGenerations: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/dashboard-metrics', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description,
    trend 
  }: { 
    title: string; 
    value: number | string;
    icon: React.ComponentType<any>;
    description?: string;
    trend?: string;
  }) => (
    <Card className="bg-black border border-zinc-800 hover:border-zinc-700 transition-all duration-500 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-xs font-light text-zinc-400 tracking-[0.2em] uppercase"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {title}
          </CardTitle>
          <Icon className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className="text-4xl font-light text-white mb-3 tracking-wider"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {isLoading ? '—' : value.toLocaleString()}
        </div>
        {description && (
          <p className="text-xs text-zinc-500 tracking-wide uppercase">
            {description}
          </p>
        )}
        {trend && (
          <Badge variant="outline" className="mt-3 bg-transparent border-zinc-700 text-zinc-400 text-xs">
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`min-h-screen bg-black ${className}`}>
      {/* ARIA'S LUXURY EDITORIAL HEADER */}
      <div className="bg-black border-b border-zinc-700 px-12 py-16">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 
              className="text-5xl text-white font-light tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              ADMIN DASHBOARD
            </h1>
            <p className="text-zinc-400 tracking-[0.2em] uppercase text-xs font-light">
              SSELFIE STUDIO • LUXURY EDITORIAL PLATFORM
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Crown className="h-6 w-6 text-zinc-400" />
            <Button 
              onClick={fetchDashboardMetrics}
              variant="outline"
              size="lg"
              className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900 hover:border-zinc-600 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              REFRESH DATA
            </Button>
          </div>
        </div>
      </div>

      {/* ARIA'S LUXURY CONTENT AREA */}
      <div className="px-12 py-16 bg-zinc-950">
        <Tabs defaultValue="overview" className="space-y-12">
          <TabsList className="bg-black border border-zinc-700 p-2 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-3 px-6 py-3 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              <BarChart3 className="h-4 w-4" />
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-3 px-6 py-3 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              <TrendingUp className="h-4 w-4" />
              ANALYTICS
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="flex items-center gap-3 px-6 py-3 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              <Activity className="h-4 w-4" />
              ACTIVITY
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-3 px-6 py-3 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              <Settings className="h-4 w-4" />
              SETTINGS
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Users"
                value={metrics.totalUsers}
                icon={Users}
                description="Registered platform users"
                trend="+12% this month"
              />
              <MetricCard
                title="AI Images"
                value={metrics.totalImages}
                icon={ImageIcon}
                description="Generated AI images"
                trend="+28% this month"
              />
              <MetricCard
                title="Conversations"
                value={metrics.totalConversations}
                icon={MessageSquare}
                description="Agent conversations"
                trend="+15% this month"
              />
              <MetricCard
                title="Generations"
                value={metrics.totalGenerations}
                icon={Eye}
                description="Total image generations"
                trend="+32% this month"
              />
            </div>

            {/* Platform Status */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle 
                  className="text-xl font-bold text-black dark:text-white"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Platform Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">System Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">AI Generation Service</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Database Connection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Authentication Service</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle 
                  className="text-xl font-bold text-black dark:text-white"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Platform Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed analytics and performance metrics will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle 
                  className="text-xl font-bold text-black dark:text-white"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Recent platform activity and user actions will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle 
                  className="text-xl font-bold text-black dark:text-white"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  System configuration and settings panel will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}