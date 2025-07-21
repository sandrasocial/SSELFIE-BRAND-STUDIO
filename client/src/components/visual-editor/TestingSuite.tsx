import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  FileText,
  Code,
  Bug,
  Shield,
  Accessibility,
  Zap,
  BarChart3,
  Download,
  Filter,
  Search,
  Plus,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestCase {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'accessibility';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  file: string;
  lastRun: Date;
  error?: string;
  coverage?: number;
}

interface TestSuite {
  id: string;
  name: string;
  tests: TestCase[];
  status: 'idle' | 'running' | 'completed';
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
  duration: number;
}

interface QualityMetric {
  id: string;
  name: string;
  score: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  suggestions: string[];
}

interface TestingSuiteProps {
  onRunTests: (suiteId: string, testIds?: string[]) => void;
  onStopTests: () => void;
  onGenerateReport: (format: 'html' | 'json' | 'junit') => void;
  onConfigureTest: (testId: string) => void;
}

export const TestingSuite: React.FC<TestingSuiteProps> = ({
  onRunTests,
  onStopTests,
  onGenerateReport,
  onConfigureTest
}) => {
  const [activeTab, setActiveTab] = useState('suites');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Mock data for demonstration
  const [testSuites] = useState<TestSuite[]>([
    {
      id: 'unit-tests',
      name: 'Unit Tests',
      status: 'completed',
      passed: 145,
      failed: 3,
      skipped: 2,
      coverage: 87.5,
      duration: 2.3,
      tests: [
        {
          id: 'test-1',
          name: 'Component Rendering',
          description: 'Tests component render without errors',
          type: 'unit',
          status: 'passed',
          duration: 0.12,
          file: 'components/Button.test.tsx',
          lastRun: new Date(),
          coverage: 95
        },
        {
          id: 'test-2',
          name: 'API Integration',
          description: 'Tests API endpoint responses',
          type: 'integration',
          status: 'failed',
          duration: 1.45,
          file: 'api/users.test.ts',
          lastRun: new Date(),
          error: 'Expected status 200 but received 404',
          coverage: 78
        },
        {
          id: 'test-3',
          name: 'User Authentication Flow',
          description: 'End-to-end authentication testing',
          type: 'e2e',
          status: 'passed',
          duration: 5.2,
          file: 'e2e/auth.spec.ts',
          lastRun: new Date(),
          coverage: 92
        }
      ]
    },
    {
      id: 'integration-tests',
      name: 'Integration Tests',
      status: 'idle',
      passed: 28,
      failed: 1,
      skipped: 0,
      coverage: 73.2,
      duration: 8.7,
      tests: []
    },
    {
      id: 'e2e-tests',
      name: 'End-to-End Tests',
      status: 'idle',
      passed: 12,
      failed: 0,
      skipped: 1,
      coverage: 85.1,
      duration: 45.6,
      tests: []
    }
  ]);

  const [qualityMetrics] = useState<QualityMetric[]>([
    {
      id: 'code-coverage',
      name: 'Code Coverage',
      score: 87.5,
      target: 90,
      status: 'warning',
      description: 'Percentage of code covered by tests',
      suggestions: ['Add tests for error handlers', 'Cover edge cases in utils']
    },
    {
      id: 'complexity',
      name: 'Cyclomatic Complexity',
      score: 6.2,
      target: 10,
      status: 'good',
      description: 'Average complexity per function',
      suggestions: ['Refactor large components', 'Extract utility functions']
    },
    {
      id: 'maintainability',
      name: 'Maintainability Index',
      score: 78,
      target: 80,
      status: 'warning',
      description: 'Overall code maintainability score',
      suggestions: ['Improve documentation', 'Reduce technical debt']
    },
    {
      id: 'performance',
      name: 'Performance Score',
      score: 92,
      target: 90,
      status: 'good',
      description: 'Application performance metrics',
      suggestions: ['Optimize image loading', 'Implement code splitting']
    }
  ]);

  const handleRunTests = (suiteId?: string) => {
    setIsRunning(true);
    onRunTests(suiteId || 'all', selectedTests);
    
    // Simulate test completion
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: 'Tests Completed',
        description: `${suiteId ? 'Suite' : 'All tests'} execution finished`,
      });
    }, 3000);
  };

  const handleStopTests = () => {
    setIsRunning(false);
    onStopTests();
    toast({
      title: 'Tests Stopped',
      description: 'Test execution has been cancelled',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'skipped': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'unit': return 'bg-blue-100 text-blue-800';
      case 'integration': return 'bg-green-100 text-green-800';
      case 'e2e': return 'bg-purple-100 text-purple-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      case 'accessibility': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTests = testSuites
    .flatMap(suite => suite.tests)
    .filter(test => {
      const matchesType = filterType === 'all' || test.type === filterType;
      const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           test.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Testing Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <TestTube className="w-5 h-5 mr-2" />
              Testing Suite
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => handleRunTests()}
                disabled={isRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-1" />
                )}
                Run All
              </Button>
              {isRunning && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStopTests}
                >
                  <Square className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">185</div>
              <div className="text-xs text-gray-600">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">4</div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-xs text-gray-600">Skipped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">85.2%</div>
              <div className="text-xs text-gray-600">Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full bg-gray-100 rounded-md p-1">
          <TabsTrigger value="suites" className="flex-1 text-xs">Test Suites</TabsTrigger>
          <TabsTrigger value="cases" className="flex-1 text-xs">Test Cases</TabsTrigger>
          <TabsTrigger value="quality" className="flex-1 text-xs">Quality Metrics</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 text-xs">Reports</TabsTrigger>
        </TabsList>

        {/* Test Suites Tab */}
        <TabsContent value="suites" className="flex-1 mt-4">
          <div className="space-y-3">
            {testSuites.map((suite) => (
              <Card key={suite.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {suite.status === 'running' ? (
                          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="font-medium">{suite.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {suite.tests.length} tests
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRunTests(suite.id)}
                      disabled={isRunning}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run Suite
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{suite.passed} passed</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <XCircle className="w-3 h-3 text-red-500" />
                      <span>{suite.failed} failed</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      <span>{suite.skipped} skipped</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-blue-500" />
                      <span>{suite.coverage}% coverage</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Coverage</span>
                      <span>{suite.coverage}%</span>
                    </div>
                    <Progress value={suite.coverage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Test Cases Tab */}
        <TabsContent value="cases" className="flex-1 mt-4">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <Input
                  placeholder="Search tests..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="border rounded px-3 py-2 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="unit">Unit Tests</option>
                <option value="integration">Integration Tests</option>
                <option value="e2e">E2E Tests</option>
                <option value="performance">Performance Tests</option>
                <option value="accessibility">Accessibility Tests</option>
              </select>
            </div>

            {/* Test Cases List */}
            <div className="space-y-2">
              {filteredTests.map((test) => (
                <Card key={test.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedTests.includes(test.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTests([...selectedTests, test.id]);
                            } else {
                              setSelectedTests(selectedTests.filter(id => id !== test.id));
                            }
                          }}
                          className="rounded"
                        />
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{test.name}</span>
                            <Badge className={`text-xs ${getTypeColor(test.type)}`}>
                              {test.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{test.description}</div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{test.file}</span>
                            <span>{test.duration}s</span>
                            {test.coverage && <span>{test.coverage}% coverage</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onConfigureTest(test.id)}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                    {test.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        {test.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality" className="flex-1 mt-4">
          <div className="space-y-4">
            {qualityMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{metric.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          metric.status === 'good' ? 'bg-green-100 text-green-800' :
                          metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{metric.score}{metric.id === 'code-coverage' ? '%' : ''}</div>
                      <div className="text-xs text-gray-600">Target: {metric.target}{metric.id === 'code-coverage' ? '%' : ''}</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <Progress 
                      value={(metric.score / metric.target) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">{metric.description}</div>
                  
                  {metric.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-700">Suggestions:</div>
                      {metric.suggestions.map((suggestion, index) => (
                        <div key={index} className="text-xs text-gray-600 pl-2">
                          • {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="flex-1 mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onGenerateReport('html')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    <span className="text-sm">HTML Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onGenerateReport('json')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Code className="w-6 h-6 mb-2" />
                    <span className="text-sm">JSON Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onGenerateReport('junit')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span className="text-sm">JUnit XML</span>
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Recent Reports</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Test Report - {new Date().toLocaleDateString()}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="w-3 h-3" />
                      </Button>
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