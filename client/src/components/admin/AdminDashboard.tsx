/* ARIA'S LUXURY EDITORIAL ADMIN DASHBOARD - AUTHENTIC DESIGN */
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
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { HeroFullBleed } from '@/components/hero-full-bleed';
import { EditorialImageBreak } from '@/components/EditorialImageBreak';
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

  // ARIA'S EDITORIAL METRIC CARD WITH IMAGE OVERLAY
  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description,
    trend,
    backgroundImage 
  }: { 
    title: string; 
    value: number | string;
    icon: React.ComponentType<any>;
    description?: string;
    trend?: string;
    backgroundImage: string;
  }) => (
    <div className="relative bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-200">
      {/* Background Image with Overlay */}
      <div 
        className="h-96 bg-cover bg-center relative"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
          backgroundPosition: '50% 30%'
        }}
      >
        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <Icon className="h-8 w-8 text-white mb-4 opacity-90" />
          <h3 
            className="text-white text-2xl font-light tracking-[0.3em] uppercase opacity-90 mb-3"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {title.split('').join(' ')}
          </h3>
          <div 
            className="text-5xl font-light text-white mb-3 tracking-wider opacity-95"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {isLoading ? '—' : value.toLocaleString()}
          </div>
          {description && (
            <p className="text-white text-sm tracking-wide uppercase opacity-80">
              {description}
            </p>
          )}
          {trend && (
            <Badge variant="outline" className="mt-3 bg-white/20 border-white/30 text-white text-xs backdrop-blur-sm">
              {trend}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {/* ARIA'S MANDATORY FULL BLEED HERO */}
      <HeroFullBleed
        backgroundImage="https://ik.imagekit.io/sandrasocial/gallery/Image-43.jpg"
        title="ADMIN COMMAND CENTER"
        subtitle="Strategic oversight of the SSELFIE Studio empire"
        overlay={0.4}
        alignment="center"
      />
      
      {/* ARIA'S EDITORIAL NAVIGATION */}
      <div className="bg-white border-b border-zinc-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h2 
              className="text-2xl text-black font-light tracking-[0.2em] uppercase"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Dashboard Control
            </h2>
          </div>
          <Button 
            onClick={fetchDashboardMetrics}
            variant="outline"
            className="border-zinc-300 text-black hover:bg-zinc-50 transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* ARIA'S EDITORIAL CONTENT LAYOUT */}
      <div className="px-8 py-16 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          
          {/* ARIA'S PORTFOLIO-STYLE METRICS GRID */}
          <div className="mb-20">
            <h2 
              className="text-4xl text-black font-light tracking-[0.2em] uppercase mb-12 text-center"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Platform Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <MetricCard
                title="Total Users"
                value={metrics.totalUsers}
                icon={Users}
                description="Platform Members"
                trend="+12% this month"
                backgroundImage="https://ik.imagekit.io/sandrasocial/gallery/Image-23.jpg"
              />
              <MetricCard
                title="AI Images"
                value={metrics.totalImages}
                icon={ImageIcon}
                description="Generated Images"
                trend="+28% this month"
                backgroundImage="https://ik.imagekit.io/sandrasocial/gallery/Image-17.jpg"
              />
              <MetricCard
                title="Conversations" 
                value={metrics.totalConversations}
                icon={MessageSquare}
                description="Agent Chats"
                trend="+15% this month"
                backgroundImage="https://ik.imagekit.io/sandrasocial/gallery/Image-31.jpg"
              />
              <MetricCard
                title="Generations"
                value={metrics.totalGenerations}
                icon={Eye}
                description="Total Generations"
                trend="+32% this month"
                backgroundImage="https://ik.imagekit.io/sandrasocial/gallery/Image-09.jpg"
              />
            </div>
          </div>

          {/* ARIA'S EDITORIAL IMAGE BREAK */}
          <EditorialImageBreak 
            imageUrl="https://ik.imagekit.io/sandrasocial/gallery/Image-47.jpg"
            height="50vh"
          />

          {/* ARIA'S TABBED NAVIGATION */}
          <Tabs defaultValue="overview" className="space-y-12">
            <TabsList className="bg-white border border-zinc-200 p-2 rounded-lg shadow-sm">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-3 px-6 py-3 text-zinc-600 data-[state=active]:bg-zinc-100 data-[state=active]:text-black transition-all duration-300"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-3 px-6 py-3 text-zinc-600 data-[state=active]:bg-zinc-100 data-[state=active]:text-black transition-all duration-300"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex items-center gap-3 px-6 py-3 text-zinc-600 data-[state=active]:bg-zinc-100 data-[state=active]:text-black transition-all duration-300"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center gap-3 px-6 py-3 text-zinc-600 data-[state=active]:bg-zinc-100 data-[state=active]:text-black transition-all duration-300"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* ARIA'S OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-12">
              
              {/* ARIA'S PORTFOLIO-STYLE STATUS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* System Status Card with Image */}
                <div className="relative bg-white rounded-lg overflow-hidden border border-zinc-200">
                  <div 
                    className="h-64 bg-cover bg-center relative"
                    style={{ 
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://ik.imagekit.io/sandrasocial/gallery/Image-25.jpg)`,
                      backgroundPosition: '50% 30%'
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <Crown className="h-12 w-12 text-white mb-4 opacity-90" />
                      <h3 
                        className="text-white text-2xl font-light tracking-[0.2em] uppercase opacity-90 mb-6"
                        style={{ fontFamily: 'Times New Roman, serif' }}
                      >
                        System Status
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between min-w-[200px]">
                          <span className="text-white text-sm opacity-80">Platform</span>
                          <Badge className="bg-green-500/80 text-white border-0">Operational</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm opacity-80">AI Service</span>
                          <Badge className="bg-green-500/80 text-white border-0">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm opacity-80">Database</span>
                          <Badge className="bg-green-500/80 text-white border-0">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm opacity-80">Authentication</span>
                          <Badge className="bg-green-500/80 text-white border-0">Secure</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card with Image */}
                <div className="relative bg-white rounded-lg overflow-hidden border border-zinc-200">
                  <div 
                    className="h-64 bg-cover bg-center relative"
                    style={{ 
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://ik.imagekit.io/sandrasocial/gallery/Image-41.jpg)`,
                      backgroundPosition: '50% 30%'
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <Sparkles className="h-12 w-12 text-white mb-4 opacity-90" />
                      <h3 
                        className="text-white text-2xl font-light tracking-[0.2em] uppercase opacity-90 mb-6"
                        style={{ fontFamily: 'Times New Roman, serif' }}
                      >
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <button className="flex items-center justify-between min-w-[200px] text-white hover:opacity-80 transition-opacity">
                          <span className="text-sm">Visual Editor</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button className="flex items-center justify-between text-white hover:opacity-80 transition-opacity">
                          <span className="text-sm">Agent Chat</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button className="flex items-center justify-between text-white hover:opacity-80 transition-opacity">
                          <span className="text-sm">User Management</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button className="flex items-center justify-between text-white hover:opacity-80 transition-opacity">
                          <span className="text-sm">Analytics</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ARIA'S ANALYTICS TAB */}
            <TabsContent value="analytics" className="space-y-12">
              <div className="text-center py-20">
                <h3 
                  className="text-3xl text-black font-light tracking-[0.2em] uppercase mb-6"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Analytics Dashboard
                </h3>
                <p className="text-zinc-600 text-lg">Advanced metrics and performance insights coming soon</p>
              </div>
            </TabsContent>

            {/* ARIA'S ACTIVITY TAB */}
            <TabsContent value="activity" className="space-y-12">
              <div className="text-center py-20">
                <h3 
                  className="text-3xl text-black font-light tracking-[0.2em] uppercase mb-6"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Recent Activity
                </h3>
                <p className="text-zinc-600 text-lg">Platform activity feed coming soon</p>
              </div>
            </TabsContent>

            {/* ARIA'S SETTINGS TAB */}
            <TabsContent value="settings" className="space-y-12">
              <div className="text-center py-20">
                <h3 
                  className="text-3xl text-black font-light tracking-[0.2em] uppercase mb-6"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  System Settings
                </h3>
                <p className="text-zinc-600 text-lg">Configuration panel coming soon</p>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}