import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  target?: number;
  description: string;
}

interface ComponentPerformance {
  id: string;
  name: string;
  renderTime: number;
  memoryUsage: number;
  reRenders: number;
  lastUpdate: Date;
  status: 'optimized' | 'needs-attention' | 'critical';
}

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  size: number;
  timestamp: Date;
  type: 'api' | 'asset' | 'analytics';
}

const SAMPLE_METRICS: PerformanceMetric[] = [
  {
    id: 'page-load',
    name: 'Page Load Time',
    value: 1.2,
    unit: 's',
    status: 'good',
    trend: 'down',
    target: 2.0,
    description: 'Time from navigation to page interactive'
  },
  {
    id: 'bundle-size',
    name: 'Bundle Size',
    value: 2.8,
    unit: 'MB',
    status: 'warning',
    trend: 'up',
    target: 2.5,
    description: 'Total JavaScript bundle size'
  },
  {
    id: 'memory-usage',
    name: 'Memory Usage',
    value: 45,
    unit: 'MB',
    status: 'good',
    trend: 'stable',
    target: 100,
    description: 'Current application memory consumption'
  },
  {
    id: 'api-latency',
    name: 'API Latency',
    value: 180,
    unit: 'ms',
    status: 'good',
    trend: 'down',
    target: 300,
    description: 'Average API response time'
  }
];

const SAMPLE_COMPONENTS: ComponentPerformance[] = [
  {
    id: 'optimized-visual-editor',
    name: 'OptimizedVisualEditor',
    renderTime: 45,
    memoryUsage: 12.5,
    reRenders: 3,
    lastUpdate: new Date(),
    status: 'needs-attention'
  },
  {
    id: 'file-management',
    name: 'FileManagement',
    renderTime: 8,
    memoryUsage: 3.2,
    reRenders: 1,
    lastUpdate: new Date(),
    status: 'optimized'
  },
  {
    id: 'code-intelligence',
    name: 'CodeIntelligence',
    renderTime: 15,
    memoryUsage: 5.8,
    reRenders: 2,
    lastUpdate: new Date(),
    status: 'optimized'
  },
  {
    id: 'workspace-intelligence',
    name: 'WorkspaceIntelligence',
    renderTime: 22,
    memoryUsage: 7.1,
    reRenders: 4,
    lastUpdate: new Date(),
    status: 'needs-attention'
  }
];

const SAMPLE_NETWORK: NetworkRequest[] = [
  {
    id: '1',
    url: '/api/admin/agents/chat',
    method: 'POST',
    status: 200,
    duration: 245,
    size: 1.2,
    timestamp: new Date(),
    type: 'api'
  },
  {
    id: '2',
    url: '/api/auth/user',
    method: 'GET',
    status: 200,
    duration: 125,
    size: 0.3,
    timestamp: new Date(Date.now() - 1000),
    type: 'api'
  },
  {
    id: '3',
    url: '/api/ai-images',
    method: 'GET',
    status: 200,
    duration: 380,
    size: 15.7,
    timestamp: new Date(Date.now() - 2000),
    type: 'api'
  }
];

interface PerformanceMonitorProps {
  onOptimize?: (componentId: string) => void;
  onRefresh?: () => void;
}

export function PerformanceMonitor({
  onOptimize,
  onRefresh
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(SAMPLE_METRICS);
  const [components, setComponents] = useState<ComponentPerformance[]>(SAMPLE_COMPONENTS);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>(SAMPLE_NETWORK);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  // Get status color and icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'optimized': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
      case 'needs-attention': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'optimized': return 'bg-green-100 text-green-800';
      case 'warning':
      case 'needs-attention': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  // Calculate performance score
  const calculatePerformanceScore = () => {
    const goodMetrics = metrics.filter(m => m.status === 'good').length;
    return Math.round((goodMetrics / metrics.length) * 100);
  };

  // Toggle monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      // Simulate real-time updates
      const interval = setInterval(() => {
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * 0.1
        })));
      }, 2000);

      return () => clearInterval(interval);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Performance Monitor
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs bg-black text-white">
                Category 5
              </Badge>
              <Button
                variant={isMonitoring ? 'default' : 'outline'}
                size="sm"
                onClick={toggleMonitoring}
              >
                {isMonitoring ? 'Stop' : 'Start'} Monitoring
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{calculatePerformanceScore()}%</div>
              <div className="text-xs text-gray-600">Performance Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics[0].value}{metrics[0].unit}</div>
              <div className="text-xs text-gray-600">Page Load</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics[2].value}{metrics[2].unit}</div>
              <div className="text-xs text-gray-600">Memory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{networkRequests.length}</div>
              <div className="text-xs text-gray-600">Requests</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Core Metrics */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Core Metrics
              </CardTitle>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 space-y-3">
            {metrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(metric.status)}
                    <span className="text-sm font-medium">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{metric.value.toFixed(1)}{metric.unit}</span>
                    {metric.target && (
                      <span className="text-xs text-gray-500">/ {metric.target}{metric.unit}</span>
                    )}
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </Badge>
                  </div>
                </div>
                
                {metric.target && (
                  <Progress 
                    value={Math.min((metric.value / metric.target) * 100, 100)} 
                    className="h-2" 
                  />
                )}
                
                <div className="text-xs text-gray-600">
                  {metric.description}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Component Performance */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              Component Performance
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {components.map((component) => (
              <div key={component.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(component.status)}
                    <span className="font-medium text-sm">{component.name}</span>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${getStatusColor(component.status)}`}>
                    {component.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                  <div>Render: {component.renderTime}ms</div>
                  <div>Memory: {component.memoryUsage}MB</div>
                  <div>Re-renders: {component.reRenders}</div>
                  <div>Updated: {component.lastUpdate.toLocaleTimeString()}</div>
                </div>

                {component.status === 'needs-attention' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOptimize?.(component.id)}
                    className="w-full text-xs"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Optimize
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Network Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Wifi className="w-4 h-4 mr-2" />
            Network Activity
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {networkRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className={`text-xs ${
                    request.status === 200 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {request.method}
                  </Badge>
                  <span className="text-sm font-mono">{request.url}</span>
                  <Badge variant="secondary" className="text-xs">
                    {request.type}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <span>{request.duration}ms</span>
                  <span>{request.size}KB</span>
                  <span>{request.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </Button>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Monitor className="w-3 h-3" />
                <span>Desktop</span>
              </div>
              <div className="flex items-center space-x-1">
                <Smartphone className="w-3 h-3" />
                <span>Mobile Ready</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Production</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}