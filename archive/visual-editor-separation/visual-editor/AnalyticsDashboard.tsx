import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Code,
  GitBranch,
  Clock,
  Target,
  Zap,
  Eye,
  Brain,
  Cpu,
  Database,
  Globe,
  Shield,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  PieChart,
  LineChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  timeframe: string;
}

interface AnalyticsData {
  codeMetrics: {
    linesOfCode: number;
    filesCount: number;
    complexity: number;
    coverage: number;
    techDebt: number;
  };
  performanceMetrics: {
    buildTime: number;
    testTime: number;
    deployTime: number;
    errorRate: number;
    uptime: number;
  };
  userMetrics: {
    activeUsers: number;
    engagement: number;
    retention: number;
    satisfaction: number;
  };
  activityMetrics: {
    commits: number;
    deployments: number;
    tests: number;
    issues: number;
  };
}

interface TimeSeriesData {
  date: string;
  value: number;
  label: string;
}

interface AnalyticsDashboardProps {
  onRefreshData: () => void;
  onExportReport: (format: 'pdf' | 'excel' | 'csv') => void;
  onConfigureMetrics: () => void;
  onSetupAlerts: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onRefreshData,
  onExportReport,
  onConfigureMetrics,
  onSetupAlerts
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock analytics data
  const [analyticsData] = useState<AnalyticsData>({
    codeMetrics: {
      linesOfCode: 42650,
      filesCount: 327,
      complexity: 8.2,
      coverage: 87.5,
      techDebt: 2.3
    },
    performanceMetrics: {
      buildTime: 45,
      testTime: 23,
      deployTime: 120,
      errorRate: 0.12,
      uptime: 99.98
    },
    userMetrics: {
      activeUsers: 1247,
      engagement: 73.2,
      retention: 85.4,
      satisfaction: 4.7
    },
    activityMetrics: {
      commits: 89,
      deployments: 12,
      tests: 456,
      issues: 23
    }
  });

  const metricCards: MetricCard[] = [
    {
      id: 'lines-of-code',
      title: 'Lines of Code',
      value: analyticsData.codeMetrics.linesOfCode.toLocaleString(),
      change: 12.5,
      trend: 'up',
      icon: Code,
      color: 'text-blue-600',
      description: 'Total lines of code in project',
      timeframe: 'Last 7 days'
    },
    {
      id: 'test-coverage',
      title: 'Test Coverage',
      value: `${analyticsData.codeMetrics.coverage}%`,
      change: 3.2,
      trend: 'up',
      icon: Shield,
      color: 'text-green-600',
      description: 'Percentage of code covered by tests',
      timeframe: 'Current'
    },
    {
      id: 'active-users',
      title: 'Active Users',
      value: analyticsData.userMetrics.activeUsers.toLocaleString(),
      change: 8.7,
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      description: 'Daily active users',
      timeframe: 'Last 24 hours'
    },
    {
      id: 'uptime',
      title: 'System Uptime',
      value: `${analyticsData.performanceMetrics.uptime}%`,
      change: 0.1,
      trend: 'stable',
      icon: Activity,
      color: 'text-emerald-600',
      description: 'System availability',
      timeframe: 'Last 30 days'
    },
    {
      id: 'build-time',
      title: 'Build Time',
      value: `${analyticsData.performanceMetrics.buildTime}s`,
      change: -15.3,
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600',
      description: 'Average build duration',
      timeframe: 'Last 7 days'
    },
    {
      id: 'commits',
      title: 'Commits',
      value: analyticsData.activityMetrics.commits,
      change: 23.1,
      trend: 'up',
      icon: GitBranch,
      color: 'text-indigo-600',
      description: 'Git commits made',
      timeframe: 'Last 7 days'
    }
  ];

  const [timeSeriesData] = useState<TimeSeriesData[]>([
    { date: '2025-01-14', value: 1152, label: 'Active Users' },
    { date: '2025-01-15', value: 1203, label: 'Active Users' },
    { date: '2025-01-16', value: 1189, label: 'Active Users' },
    { date: '2025-01-17', value: 1267, label: 'Active Users' },
    { date: '2025-01-18', value: 1298, label: 'Active Users' },
    { date: '2025-01-19', value: 1234, label: 'Active Users' },
    { date: '2025-01-20', value: 1189, label: 'Active Users' },
    { date: '2025-01-21', value: 1247, label: 'Active Users' }
  ]);

  const handleRefreshData = () => {
    setIsLoading(true);
    onRefreshData();
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Analytics Refreshed',
        description: 'Latest data has been loaded successfully',
      });
    }, 2000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'stable') return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Analytics Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Analytics Dashboard
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select
                className="border rounded px-3 py-1 text-sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Button
                size="sm"
                onClick={handleRefreshData}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExportReport('pdf')}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metricCards.map((metric) => (
              <div key={metric.id} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className="text-lg font-bold">{metric.value}</div>
                <div className="text-xs text-gray-600 mb-1">{metric.title}</div>
                <div className={`text-xs flex items-center justify-center ${getTrendColor(metric.trend, metric.change)}`}>
                  {getTrendIcon(metric.trend)}
                  <span className="ml-1">
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full bg-gray-100 rounded-md p-1">
          <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="flex-1 text-xs">Performance</TabsTrigger>
          <TabsTrigger value="code-quality" className="flex-1 text-xs">Code Quality</TabsTrigger>
          <TabsTrigger value="user-insights" className="flex-1 text-xs">User Insights</TabsTrigger>
          <TabsTrigger value="predictions" className="flex-1 text-xs">Predictions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <LineChart className="w-4 h-4 mr-2" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeSeriesData.slice(-5).map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {new Date(data.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(data.value / 1500) * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium">{data.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Project Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Code Quality</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Test Coverage</span>
                    <span>87.5%</span>
                  </div>
                  <Progress value={87.5} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Performance</span>
                    <span>94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Security</span>
                    <span>91%</span>
                  </div>
                  <Progress value={91} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="flex-1 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Build Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Cpu className="w-4 h-4 mr-2" />
                  Build Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Average Build Time</span>
                  <span className="font-medium">45s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Fastest Build</span>
                  <span className="font-medium text-green-600">32s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Slowest Build</span>
                  <span className="font-medium text-red-600">78s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium">96.8%</span>
                </div>
              </CardContent>
            </Card>

            {/* Test Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Test Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Tests</span>
                  <span className="font-medium">456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Passing</span>
                  <span className="font-medium text-green-600">441</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Failing</span>
                  <span className="font-medium text-red-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Skipped</span>
                  <span className="font-medium text-yellow-600">12</span>
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span>82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Code Quality Tab */}
        <TabsContent value="code-quality" className="flex-1 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Code Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">8.2</div>
                    <div className="text-xs text-gray-600">Complexity</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">2.3h</div>
                    <div className="text-xs text-gray-600">Tech Debt</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">327</div>
                    <div className="text-xs text-gray-600">Files</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">42.6k</div>
                    <div className="text-xs text-gray-600">Lines</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quality Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maintainability</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={78} className="w-20 h-2" />
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reliability</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={91} className="w-20 h-2" />
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20 h-2" />
                      <Activity className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Performance</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={94} className="w-20 h-2" />
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Insights Tab */}
        <TabsContent value="user-insights" className="flex-1 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">73.2%</div>
                  <div className="text-sm text-gray-600">Average Engagement</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Session Duration</span>
                    <span className="font-medium">12m 34s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pages per Session</span>
                    <span className="font-medium">4.7</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bounce Rate</span>
                    <span className="font-medium">26.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Satisfaction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">4.7/5</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">5 Stars</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={68} className="w-16 h-2" />
                      <span className="text-xs">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">4 Stars</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={22} className="w-16 h-2" />
                      <span className="text-xs">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">3 Stars</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={7} className="w-16 h-2" />
                      <span className="text-xs">7%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="flex-1 mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  AI-Powered Insights & Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Growth Predictions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="text-sm font-medium">User Growth</div>
                          <div className="text-xs text-gray-600">Next 30 days</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">+24%</div>
                          <div className="text-xs text-gray-500">High confidence</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="text-sm font-medium">Code Quality</div>
                          <div className="text-xs text-gray-600">Next sprint</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-blue-600">+8%</div>
                          <div className="text-xs text-gray-500">Medium confidence</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Risk Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 border rounded border-yellow-200 bg-yellow-50">
                        <div>
                          <div className="text-sm font-medium">Performance Degradation</div>
                          <div className="text-xs text-gray-600">Build times increasing</div>
                        </div>
                        <Badge className="bg-yellow-500 text-white text-xs">
                          Medium Risk
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded border-red-200 bg-red-50">
                        <div>
                          <div className="text-sm font-medium">Test Coverage Drop</div>
                          <div className="text-xs text-gray-600">Coverage trending down</div>
                        </div>
                        <Badge className="bg-red-500 text-white text-xs">
                          High Risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 border rounded">
                    <Zap className="w-4 h-4 mt-0.5 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Optimize Bundle Size</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Consider code splitting and lazy loading to reduce initial bundle size by ~30%
                      </div>
                      <Badge variant="secondary" className="text-xs mt-2">Performance</Badge>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded">
                    <Target className="w-4 h-4 mt-0.5 text-green-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Increase Test Coverage</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Add unit tests for 23 uncovered functions to reach 95% coverage target
                      </div>
                      <Badge variant="secondary" className="text-xs mt-2">Quality</Badge>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded">
                    <Shield className="w-4 h-4 mt-0.5 text-purple-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Security Enhancement</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Update 5 dependencies with known vulnerabilities to latest secure versions
                      </div>
                      <Badge variant="secondary" className="text-xs mt-2">Security</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};