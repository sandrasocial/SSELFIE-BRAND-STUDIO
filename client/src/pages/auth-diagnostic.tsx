import * as React from 'react';
import { useUser } from '@stackframe/react';
import { useAuth } from '../hooks/use-auth.js';
import { useQuery } from '@tanstack/react-query';

/**
 * Auth Diagnostic Page - Debug authentication state
 */
export default function AuthDiagnostic() {
  const stackUser = useUser();
  const { user, isAuthenticated, isLoading, error } = useAuth();
  
  const { data: meData, error: meError } = useQuery({
    queryKey: ['/api/me'],
    enabled: !!stackUser?.id,
    retry: false
  });

  const { data: modelData, error: modelError } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: !!stackUser?.id,
    retry: false
  });

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Auth Diagnostic</h1>
        
        {/* Stack Auth State */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Stack Auth State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><strong>stackUser:</strong> {stackUser ? 'Present' : 'null'}</div>
            <div><strong>stackUser.id:</strong> {stackUser?.id || 'N/A'}</div>
            <div><strong>stackUser.primaryEmail:</strong> {stackUser?.primaryEmail || 'N/A'}</div>
            <div><strong>stackUser.displayName:</strong> {stackUser?.displayName || 'N/A'}</div>
          </div>
        </div>

        {/* useAuth Hook State */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">useAuth() State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><strong>isAuthenticated:</strong> {String(isAuthenticated)}</div>
            <div><strong>isLoading:</strong> {String(isLoading)}</div>
            <div><strong>user:</strong> {user ? 'Present' : 'null'}</div>
            <div><strong>user.id:</strong> {user?.id || 'N/A'}</div>
            <div><strong>user.email:</strong> {user?.email || 'N/A'}</div>
            <div><strong>error:</strong> {error || 'None'}</div>
          </div>
        </div>

        {/* API /me Response */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">/api/me Response</h2>
          {meError ? (
            <div className="text-red-600">Error: {String(meError)}</div>
          ) : (
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
              {JSON.stringify(meData, null, 2)}
            </pre>
          )}
        </div>

        {/* API /user-model Response */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">/api/user-model Response</h2>
          {modelError ? (
            <div className="text-red-600">Error: {String(modelError)}</div>
          ) : (
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
              {JSON.stringify(modelData, null, 2)}
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/api/logout'}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
