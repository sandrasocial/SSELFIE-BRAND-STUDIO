import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

const AuthenticationSystemTest: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});

  const runAuthTests = async () => {
    const results: {[key: string]: string} = {};
    
    // Test 1: Check authentication status
    results.authStatus = isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated";
    
    // Test 2: Check user data
    results.userData = user ? `✅ User: ${user.email || 'No email'}` : "❌ No user data";
    
    // Test 3: Test API call with authentication
    try {
      const response = await fetch('/api/auth/user');
      const userData = await response.json();
      results.apiAuth = response.ok ? "✅ API Auth Working" : `❌ API Auth Failed: ${response.status}`;
    } catch (error) {
      results.apiAuth = `❌ API Auth Error: ${error}`;
    }
    
    // Test 4: Test admin endpoints
    try {
      const adminResponse = await fetch('/api/claude/conversations/list');
      results.adminAccess = adminResponse.ok ? "✅ Admin Access Working" : `❌ Admin Access Failed: ${adminResponse.status}`;
    } catch (error) {
      results.adminAccess = `❌ Admin Access Error: ${error}`;
    }
    
    setTestResults(results);
  };

  return (
    <div className="auth-system-test p-6 bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-700 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Authentication System Test</h2>
      
      <div className="test-status mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Status:</h3>
        <p>Loading: {isLoading ? "Yes" : "No"}</p>
        <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
        <p>User Email: {user?.email || "None"}</p>
      </div>

      <button 
        onClick={runAuthTests}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Run Authentication Tests
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="test-results">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className="mb-2">
              <strong>{test}:</strong> <span className={result.includes('✅') ? 'text-green-600' : 'text-red-600'}>{result}</span>
            </div>
          ))}
        </div>
      )}

      <div className="auth-actions mt-6">
        <h3 className="text-lg font-semibold mb-2">Quick Actions:</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Login
          </button>
          <button 
            onClick={() => window.location.href = '/api/logout'}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationSystemTest;