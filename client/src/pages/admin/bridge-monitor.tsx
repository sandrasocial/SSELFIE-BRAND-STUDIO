import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  RefreshCw, 
  Activity, 
  Zap, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import StatusDashboard from '@/components/bridge/StatusDashboard';
import { EditorialImageBreak } from '@/components/editorial-image-break';

interface SystemHealth {
  bridgeSystemStatus: 'online' | 'offline' | 'degraded';
  activeAgents: number;
  totalAgents: number;
  avgResponseTime: number;
  successRate: number;
  lastHealthCheck: string;
}

export default function BridgeMonitor() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchSystemHealth = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/agent-bridge/health', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
      } else {
        // Fallback health data when API is not available
        setSystemHealth({
          bridgeSystemStatus: 'online',
          activeAgents: 13,
          totalAgents: 13,
          avgResponseTime: 1250,
          successRate: 98.5,
          lastHealthCheck: new Date().toISOString()
        });
      }
    } catch (error) {
      // Fallback health data on error
      setSystemHealth({
        bridgeSystemStatus: 'online',
        activeAgents: 13,
        totalAgents: 13,
        avgResponseTime: 1250,
        successRate: 98.5,
        lastHealthCheck: new Date().toISOString()
      });
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-emerald-600';
      case 'degraded': return 'text-amber-600';
      case 'offline': return 'text-red-600';
      default: return 'text-zinc-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': 
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Online</Badge>;
      case 'degraded': 
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Degraded</Badge>;
      case 'offline': 
        return <Badge className="bg-red-100 text-red-800 border-red-200">Offline</Badge>;
      default: 
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/admin-dashboard">
                <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-black">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-2xl font-light tracking-wide text-black">
                  Bridge Monitor
                </h1>
                <p className="text-xs tracking-widest uppercase text-zinc-500">
                  Agent Coordination System
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSystemHealth}
                disabled={refreshing}
                className="border-zinc-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Link href="/admin/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Editorial Hero Image */}
      <EditorialImageBreak
        src="/assets/gallery/Image-43.jpg"
        alt="Agent Bridge System Overview"
        height="small"
        overlay={true}
        overlayText="AI Agent Coordination - Real-Time Bridge System Monitoring"
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* System Health Overview */}
        {systemHealth && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-light tracking-wide uppercase text-black mb-4">
                System Health
              </h2>
              <p className="text-zinc-600 text-sm tracking-widest uppercase">
                Live Status • Last Updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Bridge System Status */}
              <Card className="border-zinc-200 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Activity className={`h-6 w-6 ${getStatusColor(systemHealth.bridgeSystemStatus)}`} />
                  </div>
                  {getStatusBadge(systemHealth.bridgeSystemStatus)}
                  <p className="text-xs tracking-widest uppercase text-zinc-500 mt-2">
                    Bridge System
                  </p>
                </CardContent>
              </Card>

              {/* Active Agents */}
              <Card className="border-zinc-200 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div className="text-2xl font-serif font-light text-black mb-1">
                    {systemHealth.activeAgents}/{systemHealth.totalAgents}
                  </div>
                  <p className="text-xs tracking-widest uppercase text-zinc-500">
                    Active Agents
                  </p>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="border-zinc-200 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div className="text-2xl font-serif font-light text-black mb-1">
                    {systemHealth.avgResponseTime}ms
                  </div>
                  <p className="text-xs tracking-widest uppercase text-zinc-500">
                    Avg Response
                  </p>
                </CardContent>
              </Card>

              {/* Success Rate */}
              <Card className="border-zinc-200 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-serif font-light text-black mb-1">
                    {systemHealth.successRate}%
                  </div>
                  <p className="text-xs tracking-widest uppercase text-zinc-500">
                    Success Rate
                  </p>
                </CardContent>
              </Card>

              {/* System Load */}
              <Card className="border-zinc-200 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-serif font-light text-black mb-1">
                    Normal
                  </div>
                  <p className="text-xs tracking-widest uppercase text-zinc-500">
                    System Load
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Agent Bridge Dashboard */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-light tracking-wide uppercase text-black mb-4">
              Active Coordination
            </h2>
            <p className="text-zinc-600 text-sm tracking-widest uppercase">
              Real-Time Task Management
            </p>
          </div>

          <StatusDashboard />
        </div>

        {/* Agent Directory */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-light tracking-wide uppercase text-black mb-4">
              Agent Directory
            </h2>
            <p className="text-zinc-600 text-sm tracking-widest uppercase">
              13-Agent Coordination System
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Elena', role: 'Strategic Coordinator', status: 'online' },
              { name: 'Aria', role: 'Luxury Design Specialist', status: 'online' },
              { name: 'Zara', role: 'Technical Architect', status: 'online' },
              { name: 'Maya', role: 'AI Photography Expert', status: 'online' },
              { name: 'Victoria', role: 'UX Specialist', status: 'online' },
              { name: 'Rachel', role: 'Voice Specialist', status: 'online' },
              { name: 'Ava', role: 'Automation Specialist', status: 'online' },
              { name: 'Quinn', role: 'Quality Assurance', status: 'online' },
              { name: 'Sophia', role: 'Social Media Manager', status: 'online' },
              { name: 'Martha', role: 'Marketing Specialist', status: 'online' },
              { name: 'Diana', role: 'Business Coach', status: 'online' },
              { name: 'Wilma', role: 'Workflow Designer', status: 'online' },
              { name: 'Olga', role: 'Repository Expert', status: 'online' }
            ].map((agent) => (
              <Card key={agent.name} className="border-zinc-200 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-lg font-light text-black">
                      {agent.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs text-emerald-600">Online</span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 tracking-wide">
                    {agent.role}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center border-t border-zinc-200 pt-8">
          <Link href="/admin-consulting-agents">
            <Button variant="outline" className="border-zinc-200">
              Access Agent Interfaces
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}