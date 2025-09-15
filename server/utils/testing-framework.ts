/**
 * Comprehensive Testing Framework
 * Provides utilities for testing API endpoints, services, and components
 */

import { Logger } from './logger';
import { Request, Response, NextFunction } from 'express';
import { performanceMonitor } from './performance-monitor';
import { errorTracker } from './error-tracker';

export interface TestCase {
  name: string;
  description: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  test: () => Promise<void>;
  expectedResult: 'pass' | 'fail';
  timeout?: number;
  retries?: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TestSuite {
  name: string;
  description: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  tests: TestCase[];
  timeout?: number;
  parallel: boolean;
}

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'timeout';
  duration: number;
  error?: string;
  stack?: string;
  retries: number;
  timestamp: string;
}

export interface TestReport {
  suite: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  timedOut: number;
  duration: number;
  results: TestResult[];
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  timestamp: string;
}

export class TestingFramework {
  private logger: Logger;
  private testSuites: Map<string, TestSuite>;
  private isEnabled: boolean;
  private currentTest: string | null;

  constructor() {
    this.logger = new Logger('TestingFramework');
    this.testSuites = new Map();
    this.isEnabled = true;
    this.currentTest = null;
  }

  /**
   * Register a test suite
   */
  public registerTestSuite(suite: TestSuite): void {
    if (!this.isEnabled) {
      return;
    }

    this.testSuites.set(suite.name, suite);
    this.logger.debug('Test suite registered', { name: suite.name, testCount: suite.tests.length });
  }

  /**
   * Register a test case
   */
  public registerTestCase(suiteName: string, testCase: TestCase): void {
    if (!this.isEnabled) {
      return;
    }

    const suite = this.testSuites.get(suiteName);
    if (!suite) {
      this.logger.error('Test suite not found', { suiteName });
      return;
    }

    suite.tests.push(testCase);
    this.logger.debug('Test case registered', { suiteName, testName: testCase.name });
  }

  /**
   * Run a specific test suite
   */
  public async runTestSuite(suiteName: string): Promise<TestReport> {
    const suite = this.testSuites.get(suiteName);
    if (!suite) {
      throw new Error(`Test suite '${suiteName}' not found`);
    }

    this.logger.info('Running test suite', { name: suiteName });
    const startTime = Date.now();

    // Run suite setup
    if (suite.setup) {
      await suite.setup();
    }

    const results: TestResult[] = [];
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let timedOut = 0;

    // Run tests
    if (suite.parallel) {
      const testPromises = suite.tests.map(test => this.runTestCase(test));
      const testResults = await Promise.allSettled(testPromises);
      
      for (const result of testResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.status === 'pass') passed++;
          else if (result.value.status === 'fail') failed++;
          else if (result.value.status === 'skip') skipped++;
          else if (result.value.status === 'timeout') timedOut++;
        } else {
          // Handle rejected promises
          const errorResult: TestResult = {
            name: 'Unknown Test',
            status: 'fail',
            duration: 0,
            error: result.reason?.message || 'Unknown error',
            retries: 0,
            timestamp: new Date().toISOString(),
          };
          results.push(errorResult);
          failed++;
        }
      }
    } else {
      for (const test of suite.tests) {
        const result = await this.runTestCase(test);
        results.push(result);
        
        if (result.status === 'pass') passed++;
        else if (result.status === 'fail') failed++;
        else if (result.status === 'skip') skipped++;
        else if (result.status === 'timeout') timedOut++;
      }
    }

    // Run suite teardown
    if (suite.teardown) {
      await suite.teardown();
    }

    const duration = Date.now() - startTime;
    const report: TestReport = {
      suite: suiteName,
      total: suite.tests.length,
      passed,
      failed,
      skipped,
      timedOut,
      duration,
      results,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Test suite completed', {
      name: suiteName,
      total: report.total,
      passed: report.passed,
      failed: report.failed,
      duration: report.duration,
    });

    return report;
  }

  /**
   * Run all test suites
   */
  public async runAllTestSuites(): Promise<TestReport[]> {
    const reports: TestReport[] = [];
    
    for (const suiteName of this.testSuites.keys()) {
      try {
        const report = await this.runTestSuite(suiteName);
        reports.push(report);
      } catch (error) {
        this.logger.error('Test suite failed', { suiteName, error });
        
        // Create a failed report
        const failedReport: TestReport = {
          suite: suiteName,
          total: 0,
          passed: 0,
          failed: 1,
          skipped: 0,
          timedOut: 0,
          duration: 0,
          results: [{
            name: 'Suite Setup',
            status: 'fail',
            duration: 0,
            error: error.message,
            retries: 0,
            timestamp: new Date().toISOString(),
          }],
          timestamp: new Date().toISOString(),
        };
        reports.push(failedReport);
      }
    }

    return reports;
  }

  /**
   * Run a specific test case
   */
  public async runTestCase(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    this.currentTest = testCase.name;

    try {
      // Run test setup
      if (testCase.setup) {
        await testCase.setup();
      }

      // Run the test with timeout
      const timeout = testCase.timeout || 30000; // Default 30 seconds
      const testPromise = testCase.test();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout')), timeout);
      });

      await Promise.race([testPromise, timeoutPromise]);

      // Run test teardown
      if (testCase.teardown) {
        await testCase.teardown();
      }

      const duration = Date.now() - startTime;
      const result: TestResult = {
        name: testCase.name,
        status: 'pass',
        duration,
        retries: 0,
        timestamp: new Date().toISOString(),
      };

      this.logger.debug('Test case passed', { name: testCase.name, duration });
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        name: testCase.name,
        status: error.message === 'Test timeout' ? 'timeout' : 'fail',
        duration,
        error: error.message,
        stack: error.stack,
        retries: 0,
        timestamp: new Date().toISOString(),
      };

      this.logger.warn('Test case failed', { name: testCase.name, error: error.message });
      return result;
    } finally {
      this.currentTest = null;
    }
  }

  /**
   * Create a test case for API endpoint
   */
  public createAPITestCase(
    name: string,
    description: string,
    endpoint: string,
    method: string,
    options: {
      headers?: Record<string, string>;
      body?: any;
      query?: Record<string, string>;
      expectedStatus?: number;
      expectedResponse?: any;
      timeout?: number;
      retries?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): TestCase {
    return {
      name,
      description,
      test: async () => {
        const response = await this.makeAPICall(endpoint, method, options);
        
        if (options.expectedStatus && response.status !== options.expectedStatus) {
          throw new Error(`Expected status ${options.expectedStatus}, got ${response.status}`);
        }
        
        if (options.expectedResponse) {
          const responseData = await response.json();
          if (!this.deepEqual(responseData, options.expectedResponse)) {
            throw new Error('Response does not match expected response');
          }
        }
      },
      expectedResult: 'pass',
      timeout: options.timeout,
      retries: options.retries,
      tags: options.tags || ['api'],
      priority: options.priority || 'medium',
    };
  }

  /**
   * Create a test case for service method
   */
  public createServiceTestCase(
    name: string,
    description: string,
    service: any,
    method: string,
    args: any[],
    options: {
      expectedResult?: any;
      expectedError?: string;
      timeout?: number;
      retries?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): TestCase {
    return {
      name,
      description,
      test: async () => {
        try {
          const result = await service[method](...args);
          
          if (options.expectedResult && !this.deepEqual(result, options.expectedResult)) {
            throw new Error('Result does not match expected result');
          }
        } catch (error) {
          if (options.expectedError && error.message !== options.expectedError) {
            throw new Error(`Expected error '${options.expectedError}', got '${error.message}'`);
          }
          if (!options.expectedError) {
            throw error;
          }
        }
      },
      expectedResult: 'pass',
      timeout: options.timeout,
      retries: options.retries,
      tags: options.tags || ['service'],
      priority: options.priority || 'medium',
    };
  }

  /**
   * Create a test case for performance
   */
  public createPerformanceTestCase(
    name: string,
    description: string,
    test: () => Promise<void>,
    options: {
      maxDuration?: number;
      maxMemoryUsage?: number;
      timeout?: number;
      retries?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): TestCase {
    return {
      name,
      description,
      test: async () => {
        const startTime = Date.now();
        const startMemory = process.memoryUsage();
        
        await test();
        
        const duration = Date.now() - startTime;
        const memoryUsage = process.memoryUsage().heapUsed - startMemory.heapUsed;
        
        if (options.maxDuration && duration > options.maxDuration) {
          throw new Error(`Test took ${duration}ms, expected max ${options.maxDuration}ms`);
        }
        
        if (options.maxMemoryUsage && memoryUsage > options.maxMemoryUsage) {
          throw new Error(`Test used ${memoryUsage} bytes, expected max ${options.maxMemoryUsage} bytes`);
        }
      },
      expectedResult: 'pass',
      timeout: options.timeout,
      retries: options.retries,
      tags: options.tags || ['performance'],
      priority: options.priority || 'medium',
    };
  }

  /**
   * Make an API call
   */
  private async makeAPICall(
    endpoint: string,
    method: string,
    options: {
      headers?: Record<string, string>;
      body?: any;
      query?: Record<string, string>;
    } = {}
  ): Promise<Response> {
    const url = new URL(endpoint, process.env.API_BASE_URL || 'http://localhost:5000');
    
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    return fetch(url.toString(), fetchOptions);
  }

  /**
   * Deep equal comparison
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!this.deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  /**
   * Generate test report HTML
   */
  public generateTestReportHTML(reports: TestReport[]): string {
    const totalTests = reports.reduce((sum, report) => sum + report.total, 0);
    const totalPassed = reports.reduce((sum, report) => sum + report.passed, 0);
    const totalFailed = reports.reduce((sum, report) => sum + report.failed, 0);
    const totalSkipped = reports.reduce((sum, report) => sum + report.skipped, 0);
    const totalTimedOut = reports.reduce((sum, report) => sum + report.timedOut, 0);
    const totalDuration = reports.reduce((sum, report) => sum + report.duration, 0);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .summary-item { text-align: center; padding: 20px; border-radius: 8px; }
        .summary-item.total { background: #e9ecef; }
        .summary-item.passed { background: #d4edda; color: #155724; }
        .summary-item.failed { background: #f8d7da; color: #721c24; }
        .summary-item.skipped { background: #fff3cd; color: #856404; }
        .summary-item.timed-out { background: #f5c6cb; color: #721c24; }
        .summary-item h3 { margin: 0 0 10px 0; font-size: 2em; }
        .summary-item p { margin: 0; font-size: 1.1em; }
        .suite { margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
        .suite-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .suite-name { font-size: 1.5em; font-weight: bold; }
        .suite-stats { color: #666; }
        .test { margin: 10px 0; padding: 15px; border-radius: 6px; }
        .test.passed { background: #d4edda; border-left: 4px solid #28a745; }
        .test.failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .test.skipped { background: #fff3cd; border-left: 4px solid #ffc107; }
        .test.timed-out { background: #f5c6cb; border-left: 4px solid #dc3545; }
        .test-name { font-weight: bold; margin-bottom: 5px; }
        .test-details { color: #666; font-size: 0.9em; }
        .test-error { color: #721c24; font-family: monospace; font-size: 0.8em; margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        <div class="summary">
            <div class="summary-item total">
                <h3>${totalTests}</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-item passed">
                <h3>${totalPassed}</h3>
                <p>Passed</p>
            </div>
            <div class="summary-item failed">
                <h3>${totalFailed}</h3>
                <p>Failed</p>
            </div>
            <div class="summary-item skipped">
                <h3>${totalSkipped}</h3>
                <p>Skipped</p>
            </div>
            <div class="summary-item timed-out">
                <h3>${totalTimedOut}</h3>
                <p>Timed Out</p>
            </div>
        </div>
        <div style="padding: 0 30px 30px 30px;">
            <h2>Test Suites</h2>
            ${reports.map(report => `
                <div class="suite">
                    <div class="suite-header">
                        <div class="suite-name">${report.suite}</div>
                        <div class="suite-stats">
                            ${report.passed}/${report.total} passed • ${report.duration}ms
                        </div>
                    </div>
                    ${report.results.map(result => `
                        <div class="test ${result.status}">
                            <div class="test-name">${result.name}</div>
                            <div class="test-details">
                                Status: ${result.status.toUpperCase()} • Duration: ${result.duration}ms • ${result.timestamp}
                            </div>
                            ${result.error ? `<div class="test-error">${result.error}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Get test suite names
   */
  public getTestSuiteNames(): string[] {
    return Array.from(this.testSuites.keys());
  }

  /**
   * Get test suite
   */
  public getTestSuite(name: string): TestSuite | null {
    return this.testSuites.get(name) || null;
  }

  /**
   * Clear all test suites
   */
  public clearTestSuites(): void {
    this.testSuites.clear();
    this.logger.info('All test suites cleared');
  }

  /**
   * Enable/disable testing framework
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.logger.info(`Testing framework ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if testing framework is enabled
   */
  public isEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const testingFramework = new TestingFramework();
