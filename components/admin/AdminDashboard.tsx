import React, { useState } from 'react';
import AdminTestButton from './AdminTestButton';

const AdminDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTestClick = async (testType: string) => {
    setLoading(true);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const timestamp = new Date().toLocaleTimeString();
    const result = `${testType} test executed successfully at ${timestamp}`;
    
    setTestResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SSELFIE Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Luxury platform management & testing suite
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-green-500 font-semibold text-xl">● Online</div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              System Test Controls
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col space-y-3">
                <AdminTestButton
                  variant="primary"
                  size="lg"
                  onClick={() => handleTestClick('Database Connection')}
                  loading={loading}
                />
                
                <AdminTestButton
                  variant="secondary"
                  size="md"
                  onClick={() => handleTestClick('API Endpoints')}
                  loading={loading}
                />
                
                <AdminTestButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleTestClick('Security Scan')}
                  loading={loading}
                />
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={clearResults}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={testResults.length === 0}
                >
                  Clear Test Results
                </button>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Test Results
            </h2>
            
            <div className="space-y-3">
              {testResults.length > 0 ? (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in"
                  >
                    <div className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-green-800 text-sm">{result}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">No tests run yet</div>
                  <div className="text-gray-500 text-sm mt-2">
                    Click a test button to get started
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">99.9%</div>
            <div className="text-gray-600 mt-1">Uptime</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-3xl font-bold text-pink-600">{testResults.length}</div>
            <div className="text-gray-600 mt-1">Tests Run</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="text-gray-600 mt-1">Errors</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;