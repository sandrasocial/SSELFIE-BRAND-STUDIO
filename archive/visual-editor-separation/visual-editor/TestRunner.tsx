import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube,
  Play,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Settings,
  Download,
  Upload,
  FileText,
  Zap,
  Target,
  BarChart3,
  TrendingUp,
  Eye,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestCase {
  id: string;
  name: string;
  description: string;
  suite: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  coverage?: number;
  lastRun?: Date;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCount: number;
  passedCount: number;
  failedCount: number;
  coverage: number;
  duration: number;
  lastRun: Date;
}

interface TestRun {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
  duration: number;
}

const SAMPLE_TEST_SUITES: TestSuite[] = [
  {
    id: 'visual-editor',
    name: 'Visual Editor',
    description: 'Tests for OptimizedVisualEditor and related components',
    testCount: 24,
    passedCount: 22,
    failedCount: 2,
    coverage: 87,
    duration: 2340,
    lastRun: new Date()
  },
  {
    id: 'agent-system',
    name: 'Agent System',
    description: 'Tests for AI agent communication and workflows',
    testCount: 18,
    passedCount: 16,
    failedCount: 1,
    coverage: 92,
    duration: 1850,
    lastRun: new Date(Date.now() - 300000)
  },
  {
    id: 'category-features',
    name: 'Category Features',
    description: 'Tests for Categories 1-5 Replit parity features',
    testCount: 31,
    passedCount: 28,
    failedCount: 3,
    coverage: 81,
    duration: 3200,
    lastRun: new Date(Date.now() - 600000)
  }
];

const SAMPLE_TEST_CASES: TestCase[] = [
  {
    id: 'test-1',
    name: 'File Management - File Selection',
    description: 'Should select files and trigger onFileSelect callback',
    suite: 'visual-editor',
    status: 'passed',
    duration: 120,
    coverage: 95,
    lastRun: new Date()
  },
  {
    id: 'test-2',
    name: 'Code Intelligence - Auto Completion',
    description: 'Should provide intelligent code suggestions',
    suite: 'category-features',
    status: 'passed',
    duration: 240,
    coverage: 88,
    lastRun: new Date()
  },
  {
    id: 'test-3',
    name: 'Workspace Intelligence - Metrics Display',
    description: 'Should display correct performance metrics',
    suite: 'category-features',
    status: 'failed',
    duration: 180,
    error: 'Expected metrics.projectHealth to be 87, but got 85',
    coverage: 72,
    lastRun: new Date()
  },
  {
    id: 'test-4',
    name: 'Elena Workflow Coordination',
    description: 'Should create and execute multi-agent workflows',
    suite: 'agent-system',
    status: 'running',
    coverage: 90,
    lastRun: new Date()
  },
  {
    id: 'test-5',
    name: 'Debug Console - Log Filtering',
    description: 'Should filter logs by level and search query',
    suite: 'category-features',
    status: 'pending',
    coverage: 0
  }
];

interface TestRunnerProps {
  onRunTest?: (testId: string) => void;
  onRunSuite?: (suiteId: string) => void;
  onRunAll?: () => void;
}

export function TestRunner({
  onRunTest,
  onRunSuite,
  onRunAll
}: TestRunnerProps) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>(SAMPLE_TEST_SUITES);
  const [testCases, setTestCases] = useState<TestCase[]>(SAMPLE_TEST_CASES);
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
  const [selectedSuite, setSelectedSuite] = useState<string>('all');
  const { toast } = useToast();

  // Filter test cases
  const filteredTests = testCases.filter(test => {
    if (searchQuery && !test.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && test.status !== statusFilter) return false;
    if (selectedSuite !== 'all' && test.suite !== selectedSuite) return false;
    return true;
  });

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'skipped': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate overall stats
  const totalTests = testCases.length;
  const passedTests = testCases.filter(t => t.status === 'passed').length;
  const failedTests = testCases.filter(t => t.status === 'failed').length;
  const runningTests = testCases.filter(t => t.status === 'running').length;
  const overallCoverage = Math.round(testCases.reduce((sum, t) => sum + (t.coverage || 0), 0) / totalTests);

  // Run all tests
  const runAllTests = () => {
    const run: TestRun = {
      id: Date.now().toString(),
      startTime: new Date(),
      status: 'running',
      totalTests,
      passedTests: 0,
      failedTests: 0,
      coverage: 0,
      duration: 0
    };

    setCurrentRun(run);
    onRunAll?.();

    // Simulate test execution
    setTimeout(() => {
      setCurrentRun(prev => prev ? {
        ...prev,
        endTime: new Date(),
        status: 'completed',
        passedTests,
        failedTests,
        coverage: overallCoverage,
        duration: 5500
      } : null);

      toast({
        title: 'Test Run Complete',
        description: `${passedTests}/${totalTests} tests passed`,
      });
    }, 3000);
  };

  // Run single test
  const runTest = (testId: string) => {
    setTestCases(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running' }
        : test
    ));

    onRunTest?.(testId);

    // Simulate test execution
    setTimeout(() => {
      setTestCases(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: Math.random() > 0.8 ? 'failed' : 'passed',
              duration: Math.floor(Math.random() * 300) + 50,
              lastRun: new Date()
            }
          : test
      ));
    }, 1000 + Math.random() * 2000);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <TestTube className="w-5 h-5 mr-2" />
              Test Runner
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-black text-white">
              Category 5
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-xs text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{runningTests}</div>
              <div className="text-xs text-gray-600">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{overallCoverage}%</div>
              <div className="text-xs text-gray-600">Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-sm border rounded px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={selectedSuite}
                onChange={(e) => setSelectedSuite(e.target.value)}
                className="text-sm border rounded px-3 py-2"
              >
                <option value="all">All Suites</option>
                {testSuites.map(suite => (
                  <option key={suite.id} value={suite.id}>{suite.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Config
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Report
              </Button>
              <Button onClick={runAllTests} disabled={currentRun?.status === 'running'}>
                <Play className="w-4 h-4 mr-1" />
                Run All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Test Suites */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Test Suites
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {testSuites.map((suite) => (
              <div
                key={suite.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedSuite(suite.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{suite.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {suite.testCount} tests
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  {suite.description}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex space-x-2">
                    <span className="text-green-600">{suite.passedCount} passed</span>
                    <span className="text-red-600">{suite.failedCount} failed</span>
                  </div>
                  <span className="text-gray-500">{suite.coverage}% coverage</span>
                </div>

                <Progress value={(suite.passedCount / suite.testCount) * 100} className="h-1 mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Test Cases */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Code className="w-4 h-4 mr-2" />
              Test Cases ({filteredTests.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(test.status)}
                      <span className="font-medium text-sm">{test.name}</span>
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(test.status)}`}>
                        {test.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      {test.description}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      {test.duration && <span>{test.duration}ms</span>}
                      {test.coverage && <span>{test.coverage}% coverage</span>}
                      {test.lastRun && <span>Last run: {test.lastRun.toLocaleTimeString()}</span>}
                    </div>

                    {test.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        {test.error}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runTest(test.id)}
                      disabled={test.status === 'running'}
                      className="text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Current Run Status */}
      {currentRun && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {currentRun.status === 'running' ? (
                    <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  <span className="font-medium">
                    {currentRun.status === 'running' ? 'Running tests...' : 'Test run complete'}
                  </span>
                </div>
                <Badge variant="secondary">
                  {currentRun.passedTests}/{currentRun.totalTests} passed
                </Badge>
              </div>

              <div className="text-sm text-gray-600">
                {currentRun.endTime ? `${currentRun.duration}ms` : 'In progress...'}
              </div>
            </div>

            {currentRun.status === 'running' && (
              <Progress 
                value={(currentRun.passedTests / currentRun.totalTests) * 100} 
                className="mt-2"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}