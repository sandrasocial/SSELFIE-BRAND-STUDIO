import * as React from 'react';
import { useAuth } from '../hooks/use-auth.js';

// Simple diagnostic component for Maya page
export function MayaDiagnostic() {
  const { user, isLoading, isAuthenticated, error } = useAuth();
  
  console.log('🔍 Maya Diagnostic:', {
    user: user ? { id: user.id, email: user.email } : null,
    isLoading,
    isAuthenticated,
    error
  });
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid red',
      padding: '20px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: 'red' }}>Maya Diagnostic</h3>
      <div><strong>Auth Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
      <div><strong>Loading:</strong> {isLoading ? '⏳ Loading...' : '✅ Loaded'}</div>
      <div><strong>User:</strong> {user ? `${user.email} (${user.id})` : 'None'}</div>
      <div><strong>Error:</strong> {error || 'None'}</div>
      <div><strong>URL:</strong> {window.location.pathname}</div>
      <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
    </div>
  );
}