import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  Shield,
  Rocket,
  Settings,
  RefreshCw,
  Download,
  Share
} from 'lucide-react';

interface IntelligenceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  description: string;
  suggestions: string[];
}

interface WorkspaceInsight {
  id: string;
  type: 'optimization' | 'security' | 'performance' | 'quality' | 'learning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  automated: boolean;
}

const SAMPLE_METRICS: IntelligenceMetric[] = [
  {
    id: 'code-quality',
    name: 'Code Quality',
    value: 87,
    target: 90,
    trend: 'up',
    status: 'good',
    description: 'Overall code quality based on complexity, maintainability, and standards',
    suggestions: [
      'Extract large components into smaller modules',
      'Add TypeScript strict mode',
      'Implement automated linting rules'
    ]
  },
  {
    id: 'test-coverage',
    name: 'Test Coverage',
    value: 45,
    target: 80,
    trend: 'stable',
    status: 'warning',
    description: 'Percentage of code covered by automated tests',
    suggestions: [
      'Add unit tests for Category 3 features',
      'Implement integration tests for agent system',
      'Set up automated test pipeline'
    ]
  },
  {
    id: 'performance',
    name: 'Performance Score',
    value: 92,
    target: 85,
    trend: 'up',
    status: 'good',
    description: 'Application performance including load times and responsiveness',
    suggestions: [
      'Optimize large component renders',
      'Implement code splitting',
      'Add performance monitoring'
    ]
  },
  {
    id: 'dependency-health',
    name: 'Dependency Health',
    value: 78,
    target: 85,
    trend: 'down',
    status: 'warning',
    description: 'Health and security of project dependencies',
    suggestions: [
      'Update 3 outdated packages',
      'Audit security vulnerabilities',
      'Remove unused dependencies'
    ]
  }
];

const SAMPLE_INSIGHTS: WorkspaceInsight[] = [
  {
    id: 'category-4-ready',
    type: 'optimization',
    title: 'Category 4 Implementation Ready',
    description: 'File management and project organization features are ready for implementation with existing infrastructure',
    impact: 'high',
    effort: 'medium',
    confidence: 95,
    actionable: true,
    automated: false
  },
  {
    id: 'component-extraction',
    type: 'quality',
    title: 'Extract Common UI Patterns',
    description: 'Multiple components share similar patterns that could be extracted into reusable utilities',
    impact: 'medium',
    effort: 'low',
    confidence: 88,
    actionable: true,
    automated: true
  },
  {
    id: 'agent-monitoring',
    type: 'performance',
    title: 'Enhanced Agent Monitoring',
    description: 'Implement real-time monitoring for agent performance and conversation quality',
    impact: 'high',
    effort: 'high',
    confidence: 82,
    actionable: true,
    automated: false
  },
  {
    id: 'security-audit',
    type: 'security',
    title: 'Security Audit Recommended',
    description: 'Regular security audit needed for authentication and agent communication systems',
    impact: 'high',
    effort: 'medium',
    confidence: 90,
    actionable: true,
    automated: false
  }
];

interface WorkspaceIntelligenceProps {
  onApplyInsight?: (insightId: string) => void;
  onRefreshMetrics?: () => void;
}

export function WorkspaceIntelligence({
  onApplyInsight,
  onRefreshMetrics
}: WorkspaceIntelligenceProps) {
  const [metrics, setMetrics] = useState<IntelligenceMetric[]>(SAMPLE_METRICS);
  const [insights, setInsights] = useState<WorkspaceInsight[]>(SAMPLE_INSIGHTS);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default: return <TrendingUp className="w-3 h-3 text-gray-500 rotate-90" />;
    }
  };

  // Get insight type icon
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return Rocket;
      case 'security': return Shield;
      case 'performance': return Zap;
      case 'quality': return CheckCircle;
      case 'learning': return Lightbulb;
      default: return Brain;
    }
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    onRefreshMetrics?.();
    setIsRefreshing(false);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Workspace Intelligence
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs bg-black text-white">
                Category 4
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Metrics Dashboard */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 space-y-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}%
                    </span>
                    <span className="text-xs text-gray-500">/ {metric.target}%</span>
                  </div>
                </div>
                
                <Progress 
                  value={metric.value} 
                  className="h-2" 
                />
                
                <div className="text-xs text-gray-600">
                  {metric.description}
                </div>

                {metric.suggestions.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Suggestions:</div>
                    {metric.suggestions.slice(0, 2).map((suggestion, index) => (
                      <div key={index} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {insights.map((insight) => {
              const IconComponent = getInsightIcon(insight.type);
              const isSelected = selectedInsight === insight.id;
              
              return (
                <div
                  key={insight.id}
                  onClick={() => setSelectedInsight(isSelected ? null : insight.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className="w-4 h-4 mt-0.5 text-gray-500" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{insight.title}</span>
                        <Badge variant="secondary" className={`text-xs ${getImpactColor(insight.impact)}`}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2">
                        {insight.description}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>Effort: {insight.effort}</span>
                          <span>Confidence: {insight.confidence}%</span>
                          {insight.automated && (
                            <Badge variant="outline" className="text-xs">
                              Auto-fixable
                            </Badge>
                          )}
                        </div>
                        
                        {insight.actionable && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplyInsight?.(insight.id);
                            }}
                            className="text-xs"
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Actions */}
            <div className="pt-3 border-t">
              <div className="text-xs font-medium text-gray-600 mb-2">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  View Report
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Share className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">87%</div>
              <div className="text-xs text-gray-600">Overall Health</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{insights.length}</div>
              <div className="text-xs text-gray-600">Active Insights</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {insights.filter(i => i.automated).length}
              </div>
              <div className="text-xs text-gray-600">Auto-fixable</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {insights.filter(i => i.actionable).length}
              </div>
              <div className="text-xs text-gray-600">Ready to Apply</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}