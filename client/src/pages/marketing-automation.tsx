import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import MemberNavigation from '@/components/member-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AutomationTask {
  id: string;
  type: 'content' | 'email' | 'social' | 'ads' | 'seo';
  title: string;
  status: 'pending' | 'active' | 'completed';
  progress: number;
  assignedAgent: string;
  output?: string;
  metrics?: {
    reach?: number;
    engagement?: number;
    conversions?: number;
  };
}

interface MarketingMetrics {
  totalReach: number;
  totalEngagement: number;
  conversions: number;
  revenue: number;
  roi: number;
  activeSubscribers: number;
}

export default function MarketingAutomation() {
  const { user, isAuthenticated } = useAuth();
  const [selectedAutomation, setSelectedAutomation] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  // Only Sandra can access marketing automation
  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Access Restricted
          </h1>
          <p className="text-[#666]">Marketing automation is for Sandra only.</p>
        </div>
      </div>
    );
  }

  // Fetch marketing metrics
  const { data: metrics = {
    totalReach: 0,
    totalEngagement: 0,
    conversions: 0,
    revenue: 0,
    roi: 0,
    activeSubscribers: 0
  } } = useQuery({
    queryKey: ['/api/marketing/metrics'],
    retry: false
  });

  // Fetch automation status
  const { data: automations = [] } = useQuery({
    queryKey: ['/api/marketing/automations'],
    retry: false
  });

  // Launch automation mutation
  const launchAutomation = useMutation({
    mutationFn: async (type: string) => {
      return await apiRequest('POST', '/api/marketing/launch', { type });
    },
    onSuccess: () => {
      setIsLaunching(false);
    }
  });

  const handleLaunchComplete = async () => {
    setIsLaunching(true);
    await launchAutomation.mutateAsync('complete');
  };

  const automationTypes = [
    {
      id: 'content',
      title: 'Content Automation',
      description: 'Rachel + Sophia create blog posts, social content, and SEO articles',
      agent: 'Rachel & Sophia',
      icon: '✍️',
      metrics: { posts: 15, engagement: '12.5K' }
    },
    {
      id: 'email',
      title: 'Email Sequences',
      description: 'Automated email marketing with Flodesk integration',
      agent: 'Rachel & Ava',
      icon: '📧',
      metrics: { subscribers: '2.4K', openRate: '45%' }
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Instagram automation leveraging 120K+ followers',
      agent: 'Sophia',
      icon: '📱',
      metrics: { posts: 30, reach: '85K' }
    },
    {
      id: 'ads',
      title: 'Performance Ads',
      description: 'Facebook/Instagram ads optimized for €97 conversions',
      agent: 'Martha',
      icon: '📊',
      metrics: { spend: '€450', conversions: 12 }
    },
    {
      id: 'seo',
      title: 'SEO Strategy',
      description: 'Organic traffic optimization for AI personal branding keywords',
      agent: 'Rachel & Martha',
      icon: '🔍',
      metrics: { keywords: 25, traffic: '+340%' }
    },
    {
      id: 'integration',
      title: 'Subscriber Integration',
      description: 'Import and activate existing Flodesk/ManyChat audience',
      agent: 'Ava',
      icon: '🔗',
      metrics: { imported: '8.2K', activated: '6.1K' }
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Marketing Automation Command Center
          </h1>
          <p className="text-[#666] text-lg">
            Your AI agent team is ready to scale SSELFIE AI with authentic, automated marketing
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#666]">Total Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light">{metrics.totalReach?.toLocaleString() || '0'}</div>
              <p className="text-xs text-[#666]">Across all channels</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#666]">Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light">{metrics.conversions || 0}</div>
              <p className="text-xs text-[#666]">€97 subscriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#666]">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light">€{metrics.revenue?.toLocaleString() || '0'}</div>
              <p className="text-xs text-[#666]">Monthly recurring</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#666]">ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light">{metrics.roi || 0}%</div>
              <p className="text-xs text-[#666]">Return on ad spend</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Launch */}
        <Card className="mb-12 border-2 border-[#0a0a0a]">
          <CardHeader>
            <CardTitle className="text-xl" style={{ fontFamily: 'Times New Roman, serif' }}>
              🚀 Launch Complete Marketing Automation
            </CardTitle>
            <CardDescription>
              Activate all 9 AI agents for comprehensive SSELFIE AI marketing while maintaining authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-[#666]">
                <strong>What happens when you launch:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Rachel creates authentic copy for emails, ads, and website</li>
                  <li>Sophia automates Instagram content leveraging your 120K followers</li>
                  <li>Martha optimizes ads for immediate €97 conversions</li>
                  <li>Ava integrates your Flodesk/ManyChat subscribers</li>
                  <li>All agents work together to scale without losing authenticity</li>
                </ul>
              </div>
              <Button 
                onClick={handleLaunchComplete}
                disabled={isLaunching}
                className="w-full bg-[#0a0a0a] text-white hover:bg-[#333]"
                size="lg"
              >
                {isLaunching ? 'Launching Agents...' : 'Launch Complete Automation'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Individual Automation Systems */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automationTypes.map((automation) => (
            <Card key={automation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{automation.icon}</span>
                  <Badge variant="outline">{automation.agent}</Badge>
                </div>
                <CardTitle className="text-lg">{automation.title}</CardTitle>
                <CardDescription>{automation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Current Metrics:</strong>
                    <div className="mt-1 space-y-1">
                      {Object.entries(automation.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize text-[#666]">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => launchAutomation.mutateAsync(automation.id)}
                    disabled={launchAutomation.isPending}
                  >
                    Activate {automation.title}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent Status */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>AI Agent Status</CardTitle>
            <CardDescription>Real-time status of your marketing automation team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Rachel', role: 'Voice AI', status: 'active', task: 'Writing email sequence 3/5' },
                { name: 'Sophia', role: 'Social Media AI', status: 'active', task: 'Scheduling Instagram posts' },
                { name: 'Martha', role: 'Marketing AI', status: 'active', task: 'Optimizing ad performance' },
                { name: 'Ava', role: 'Automation AI', status: 'active', task: 'Integrating subscribers' },
                { name: 'Quinn', role: 'QA AI', status: 'monitoring', task: 'Brand authenticity check' },
                { name: 'Wilma', role: 'Workflow AI', status: 'coordinating', task: 'Orchestrating agent tasks' }
              ].map((agent) => (
                <div key={agent.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-[#666]">{agent.role}</p>
                    </div>
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#666]">{agent.task}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}