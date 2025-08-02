import React, { useState, useEffect } from 'react';

interface TestResult {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

interface TestAgentFixProps {
  className?: string;
  onTestComplete?: (results: TestResult[]) => void;
}

const TestAgentFix: React.FC<TestAgentFixProps> = ({ 
  className = '', 
  onTestComplete 
}) => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const testSuites: Omit<TestResult, 'status' | 'timestamp'>[] = [
    {
      id: 'typescript-check',
      title: 'TypeScript Compilation',
      message: 'Validating type safety and compilation'
    },
    {
      id: 'component-render',
      title: 'Component Rendering',
      message: 'Testing React component lifecycle'
    },
    {
      id: 'luxury-styling',
      title: 'Luxury Design System',
      message: 'Verifying editorial design standards'
    },
    {
      id: 'accessibility',
      title: 'Accessibility Standards',
      message: 'Ensuring WCAG compliance'
    }
  ];

  const runTests = async (): Promise<void> => {
    setIsRunning(true);
    setTests([]);

    for (const testSuite of testSuites) {
      setCurrentTest(testSuite.title);
      
      // Add test with pending status
      const pendingTest: TestResult = {
        ...testSuite,
        status: 'pending',
        timestamp: new Date()
      };
      
      setTests(prev => [...prev, pendingTest]);

      // Simulate running test
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setTests(prev => prev.map(test => 
        test.id === testSuite.id 
          ? { ...test, status: 'running' }
          : test
      ));

      await new Promise(resolve => setTimeout(resolve, 1200));

      // Simulate test completion (90% success rate)
      const success = Math.random() > 0.1;
      
      setTests(prev => prev.map(test => 
        test.id === testSuite.id 
          ? { 
              ...test, 
              status: success ? 'success' : 'error',
              message: success 
                ? `${testSuite.message} - Passed`
                : `${testSuite.message} - Failed: Minor issues detected`
            }
          : test
      ));
    }

    setIsRunning(false);
    setCurrentTest('');
    
    if (onTestComplete) {
      onTestComplete(tests);
    }
  };

  const getStatusIcon = (status: TestResult['status']): string => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'running': return '●';
      case 'pending': return '○';
      default: return '○';
    }
  };

  const getStatusColor = (status: TestResult['status']): string => {
    switch (status) {
      case 'success': return '#0a0a0a';
      case 'error': return '#dc2626';
      case 'running': return '#6b7280';
      case 'pending': return '#d1d5db';
      default: return '#d1d5db';
    }
  };

  return (
    <div className={`luxury-test-agent ${className}`}>
      <style jsx>{`
        .luxury-test-agent {
          background: #ffffff;
          border: 1px solid #f5f5f5;
          padding: 3rem 2rem;
          margin: 2rem 0;
          font-family: 'Times New Roman', serif;
        }

        .test-header {
          margin-bottom: 3rem;
          text-align: center;
          border-bottom: 1px solid #f5f5f5;
          padding-bottom: 2rem;
        }

        .test-title {
          font-family: 'Times New Roman', serif;
          font-size: 2.5rem;
          font-weight: normal;
          color: #0a0a0a;
          margin: 0 0 1rem 0;
          letter-spacing: -0.02em;
        }

        .test-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          font-weight: 300;
          margin: 0;
        }

        .test-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .test-button {
          background: #0a0a0a;
          color: #ffffff;
          border: none;
          padding: 1rem 2.5rem;
          font-family: 'Times New Roman', serif;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.02em;
        }

        .test-button:hover:not(:disabled) {
          background: #1f2937;
        }

        .test-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .current-test {
          font-size: 1rem;
          color: #6b7280;
          font-style: italic;
          min-height: 1.5rem;
        }

        .test-results {
          display: grid;
          gap: 1.5rem;
        }

        .test-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          border: 1px solid #f5f5f5;
          background: #ffffff;
          transition: all 0.3s ease;
        }

        .test-item:hover {
          border-color: #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .test-status {
          font-size: 1.5rem;
          font-weight: bold;
          width: 2rem;
          text-align: center;
        }

        .test-info {
          display: grid;
          gap: 0.5rem;
        }

        .test-name {
          font-family: 'Times New Roman', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #0a0a0a;
          margin: 0;
        }

        .test-message {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .test-timestamp {
          font-size: 0.75rem;
          color: #9ca3af;
          text-align: right;
          font-family: monospace;
        }

        .test-summary {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #f5f5f5;
          text-align: center;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-family: 'Times New Roman', serif;
          font-size: 2rem;
          font-weight: bold;
          color: #0a0a0a;
          display: block;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .luxury-test-agent {
            padding: 2rem 1rem;
          }
          
          .test-title {
            font-size: 2rem;
          }
          
          .test-controls {
            flex-direction: column;
            gap: 1rem;
          }
          
          .test-item {
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
            gap: 1rem;
          }
          
          .test-timestamp {
            grid-column: 1 / -1;
            text-align: left;
          }
        }
      `}</style>

      <div className="test-header">
        <h1 className="test-title">Agent Quality Assurance</h1>
        <p className="test-subtitle">Editorial luxury meets technical excellence</p>
      </div>

      <div className="test-controls">
        <button 
          className="test-button"
          onClick={runTests}
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Execute Test Suite'}
        </button>
        
        {isRunning && (
          <div className="current-test">
            Currently testing: {currentTest}
          </div>
        )}
      </div>

      {tests.length > 0 && (
        <>
          <div className="test-results">
            {tests.map((test) => (
              <div key={test.id} className="test-item">
                <span 
                  className="test-status"
                  style={{ color: getStatusColor(test.status) }}
                >
                  {getStatusIcon(test.status)}
                </span>
                
                <div className="test-info">
                  <h3 className="test-name">{test.title}</h3>
                  <p className="test-message">{test.message}</p>
                </div>
                
                <div className="test-timestamp">
                  {test.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <div className="test-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">
                  {tests.filter(t => t.status === 'success').length}
                </span>
                <span className="stat-label">Passed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {tests.filter(t => t.status === 'error').length}
                </span>
                <span className="stat-label">Failed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{tests.length}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TestAgentFix;