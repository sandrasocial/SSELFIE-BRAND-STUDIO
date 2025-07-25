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
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Code,
  FileText,
  Bug,
  Shield,
  Zap,
  Target,
  Activity,
  Search,
  Filter,
  Download,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeQualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
  category: 'maintainability' | 'reliability' | 'security' | 'performance';
}

interface CodeIssue {
  id: string;
  type: 'bug' | 'vulnerability' | 'code-smell' | 'duplication';
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'info';
  rule: string;
  message: string;
  file: string;
  line: number;
  column: number;
  effort: string;
  tags: string[];
  debt: string;
}

interface QualityGate {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning';
  conditions: QualityCondition[];
}

interface QualityCondition {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  value: number;
  status: 'passed' | 'failed';
}

interface QualityAnalysisProps {
  onRunAnalysis: () => void;
  onFixIssue: (issueId: string) => void;
  onConfigureGates: () => void;
  onExportReport: (format: 'sonar' | 'json' | 'csv') => void;
}

export const QualityAnalysis: React.FC<QualityAnalysisProps> = ({
  onRunAnalysis,
  onFixIssue,
  onConfigureGates,
  onExportReport
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const { toast } = useToast();

  // Mock data for demonstration
  const [metrics] = useState<CodeQualityMetric[]>([
    {
      id: 'maintainability-rating',
      name: 'Maintainability Rating',
      value: 3.2,
      target: 3.0,
      unit: '/5',
      status: 'warning',
      trend: 'down',
      description: 'Technical debt ratio and code maintainability',
      category: 'maintainability'
    },
    {
      id: 'reliability-rating',
      name: 'Reliability Rating',
      value: 4.1,
      target: 4.0,
      unit: '/5',
      status: 'good',
      trend: 'up',
      description: 'Bug density and reliability issues',
      category: 'reliability'
    },
    {
      id: 'security-rating',
      name: 'Security Rating',
      value: 3.8,
      target: 4.0,
      unit: '/5',
      status: 'warning',
      trend: 'stable',
      description: 'Security vulnerabilities and hotspots',
      category: 'security'
    },
    {
      id: 'coverage',
      name: 'Test Coverage',
      value: 87.5,
      target: 90,
      unit: '%',
      status: 'warning',
      trend: 'up',
      description: 'Percentage of code covered by tests',
      category: 'reliability'
    },
    {
      id: 'duplicated-lines',
      name: 'Code Duplication',
      value: 3.2,
      target: 5.0,
      unit: '%',
      status: 'good',
      trend: 'down',
      description: 'Percentage of duplicated lines',
      category: 'maintainability'
    },
    {
      id: 'complexity',
      name: 'Cyclomatic Complexity',
      value: 8.1,
      target: 10,
      unit: '',
      status: 'good',
      trend: 'stable',
      description: 'Average complexity per function',
      category: 'maintainability'
    }
  ]);

  const [issues] = useState<CodeIssue[]>([
    {
      id: 'issue-1',
      type: 'bug',
      severity: 'major',
      rule: 'typescript:S1172',
      message: 'Remove this unused function parameter "props"',
      file: 'src/components/Button.tsx',
      line: 15,
      column: 28,
      effort: '5min',
      tags: ['unused', 'clean-code'],
      debt: '5min'
    },
    {
      id: 'issue-2',
      type: 'vulnerability',
      severity: 'critical',
      rule: 'typescript:S5852',
      message: 'Make sure that this regular expression cannot lead to regex injection attacks',
      file: 'src/utils/validation.ts',
      line: 42,
      column: 15,
      effort: '30min',
      tags: ['security', 'regex'],
      debt: '30min'
    },
    {
      id: 'issue-3',
      type: 'code-smell',
      severity: 'minor',
      rule: 'typescript:S1481',
      message: 'Remove this unused import of "useState"',
      file: 'src/pages/Dashboard.tsx',
      line: 3,
      column: 10,
      effort: '1min',
      tags: ['unused', 'imports'],
      debt: '1min'
    },
    {
      id: 'issue-4',
      type: 'duplication',
      severity: 'major',
      rule: 'common-ts:DuplicatedBlocks',
      message: 'This block of code is duplicated in 3 other locations',
      file: 'src/components/Form.tsx',
      line: 89,
      column: 1,
      effort: '15min',
      tags: ['duplication'],
      debt: '45min'
    }
  ]);

  const [qualityGates] = useState<QualityGate[]>([
    {
      id: 'main-gate',
      name: 'Main Quality Gate',
      status: 'warning',
      conditions: [
        {
          metric: 'coverage',
          operator: 'greater_than',
          threshold: 90,
          value: 87.5,
          status: 'failed'
        },
        {
          metric: 'maintainability_rating',
          operator: 'less_than',
          threshold: 3,
          value: 3.2,
          status: 'failed'
        },
        {
          metric: 'reliability_rating',
          operator: 'greater_than',
          threshold: 4,
          value: 4.1,
          status: 'passed'
        },
        {
          metric: 'security_rating',
          operator: 'greater_than',
          threshold: 4,
          value: 3.8,
          status: 'failed'
        }
      ]
    }
  ]);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    onRunAnalysis();
    
    // Simulate analysis completion
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: 'Quality Analysis Complete',
        description: `Found ${issues.length} issues across ${metrics.length} metrics`,
      });
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4 text-red-500" />;
      case 'vulnerability': return <Shield className="w-4 h-4 text-orange-500" />;
      case 'code-smell': return <Code className="w-4 h-4 text-blue-500" />;
      case 'duplication': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'blocker': return 'bg-red-600 text-white';
      case 'critical': return 'bg-red-500 text-white';
      case 'major': return 'bg-orange-500 text-white';
      case 'minor': return 'bg-yellow-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesCategory = selectedCategory === 'all' || issue.type === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    return matchesCategory && matchesSeverity;
  });

  const overallScore = Math.round(metrics.reduce((acc, metric) => acc + (metric.value / metric.target) * 20, 0) / metrics.length);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Quality Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Code Quality Analysis
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4 mr-1" />
                )}
                Analyze
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onConfigureGates}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{overallScore}%</div>
              <div className="text-xs text-gray-600">Overall Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{issues.filter(i => i.type === 'bug').length}</div>
              <div className="text-xs text-gray-600">Bugs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{issues.filter(i => i.type === 'vulnerability').length}</div>
              <div className="text-xs text-gray-600">Vulnerabilities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{issues.filter(i => i.type === 'code-smell').length}</div>
              <div className="text-xs text-gray-600">Code Smells</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{issues.filter(i => i.type === 'duplication').length}</div>
              <div className="text-xs text-gray-600">Duplications</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full bg-gray-100 rounded-md p-1">
          <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
          <TabsTrigger value="metrics" className="flex-1 text-xs">Metrics</TabsTrigger>
          <TabsTrigger value="issues" className="flex-1 text-xs">Issues</TabsTrigger>
          <TabsTrigger value="gates" className="flex-1 text-xs">Quality Gates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1 mt-4">
          <div className="space-y-4">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Maintainability</span>
                      <span>3.2/5</span>
                    </div>
                    <Progress value={64} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reliability</span>
                      <span>4.1/5</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Security</span>
                      <span>3.8/5</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance</span>
                      <span>4.3/5</span>
                    </div>
                    <Progress value={86} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {issues.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(issue.type)}
                        <div>
                          <div className="text-sm font-medium">{issue.message}</div>
                          <div className="text-xs text-gray-600">{issue.file}:{issue.line}</div>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="flex-1 mt-4">
          <div className="space-y-3">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(metric.status)}
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-xs text-gray-600">{metric.description}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {metric.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                      <div className="text-right">
                        <div className="text-lg font-bold">{metric.value}{metric.unit}</div>
                        <div className="text-xs text-gray-600">Target: {metric.target}{metric.unit}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Progress 
                      value={Math.min((metric.value / metric.target) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="flex-1 mt-4">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                className="border rounded px-3 py-2 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="bug">Bugs</option>
                <option value="vulnerability">Vulnerabilities</option>
                <option value="code-smell">Code Smells</option>
                <option value="duplication">Duplications</option>
              </select>
              <select
                className="border rounded px-3 py-2 text-sm"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="blocker">Blocker</option>
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="info">Info</option>
              </select>
              <Badge variant="secondary" className="ml-auto">
                {filteredIssues.length} issues
              </Badge>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <Card key={issue.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        {getTypeIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{issue.message}</span>
                            <Badge className={`text-xs ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {issue.file}:{issue.line}:{issue.column}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Rule: {issue.rule}</span>
                            <span>Effort: {issue.effort}</span>
                            <span>Debt: {issue.debt}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {issue.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onFixIssue(issue.id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Fix
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Quality Gates Tab */}
        <TabsContent value="gates" className="flex-1 mt-4">
          <div className="space-y-4">
            {qualityGates.map((gate) => (
              <Card key={gate.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      {getStatusIcon(gate.status)}
                      <span className="ml-2">{gate.name}</span>
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        gate.status === 'passed' ? 'bg-green-100 text-green-800' :
                        gate.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {gate.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gate.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(condition.status)}
                          <span className="text-sm font-medium capitalize">
                            {condition.metric.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {condition.value} {condition.operator.replace('_', ' ')} {condition.threshold}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};