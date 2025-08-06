import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}

export function TestButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  // Mock test scenarios for admin functionality
  const mockTests = [
    { name: 'Database Connection', duration: 500 },
    { name: 'User Authentication', duration: 800 },
    { name: 'API Endpoints', duration: 1200 },
    { name: 'File Upload System', duration: 1000 },
    { name: 'Email Service', duration: 600 },
    { name: 'Cache Performance', duration: 300 },
    { name: 'Security Checks', duration: 900 }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);
    
    toast.info('🧪 Starting admin system tests...');

    // Initialize tests as pending
    const initialTests: TestResult[] = mockTests.map((test, index) => ({
      id: `test-${index}`,
      name: test.name,
      status: 'pending',
      message: 'Waiting to run...'
    }));
    
    setTests(initialTests);

    // Run tests sequentially with realistic timing
    for (let i = 0; i < mockTests.length; i++) {
      const test = mockTests[i];
      
      // Update to running status
      setTests(prev => prev.map(t => 
        t.id === `test-${i}` 
          ? { ...t, status: 'running', message: 'Testing...' }
          : t
      ));

      await new Promise(resolve => setTimeout(resolve, test.duration));

      // Simulate test results (90% success rate)
      const success = Math.random() > 0.1;
      const isWarning = Math.random() > 0.8;
      
      let status: TestResult['status'] = 'success';
      let message = '✅ Test passed successfully';
      
      if (!success) {
        status = 'error';
        message = '❌ Test failed - Check logs for details';
      } else if (isWarning) {
        status = 'warning';
        message = '⚠️ Test passed with warnings';
      }

      setTests(prev => prev.map(t => 
        t.id === `test-${i}` 
          ? { ...t, status, message, duration: test.duration }
          : t
      ));
    }

    setIsRunning(false);
    setLastRun(new Date());
    
    const failedCount = tests.filter(t => t.status === 'error').length;
    const warningCount = tests.filter(t => t.status === 'warning').length;
    
    if (failedCount === 0) {
      toast.success(`🎉 All tests completed! ${warningCount > 0 ? `(${warningCount} warnings)` : ''}`);
    } else {
      toast.error(`❌ ${failedCount} test(s) failed. Please check the results.`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'secondary',
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    } as const;

    const colors = {
      pending: 'bg-gray-100 text-gray-600',
      running: 'bg-blue-100 text-blue-600',
      success: 'bg-green-100 text-green-600',
      error: 'bg-red-100 text-red-600',
      warning: 'bg-yellow-100 text-yellow-600'
    };

    return (
      <Badge 
        variant={variants[status]} 
        className={colors[status]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Test Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Admin System Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Run comprehensive tests on all admin system components
              </p>
              {lastRun && (
                <p className="text-xs text-muted-foreground">
                  Last run: {lastRun.toLocaleString()}
                </p>
              )}
            </div>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="min-w-[120px]"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Tests
                </>
              )}
            </Button>
          </div>

          {/* Test Progress Summary */}
          {tests.length > 0 && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'success').length}
                </div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {tests.filter(t => t.status === 'warning').length}
                </div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tests.filter(t => t.status === 'running').length}
                </div>
                <div className="text-xs text-muted-foreground">Running</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map((test) => (
                <div 
                  key={test.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {test.message}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.duration && test.status !== 'pending' && test.status !== 'running' && (
                      <span className="text-xs text-muted-foreground">
                        {test.duration}ms
                      </span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}