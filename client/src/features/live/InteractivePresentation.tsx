/**
 * InteractivePresentation Wrapper
 * Common wrapper for Stage Mode components with shared session management
 */

import React from 'react';
import { useLiveSession, LiveSession } from './hooks/useLiveSession';
import { PageLoader } from '../../components/PageLoader';

interface InteractivePresentationProps {
  sessionId: string;
  children: (session: LiveSession) => React.ReactNode;
  fallback?: React.ReactNode;
  enablePolling?: boolean;
}

export default function InteractivePresentation({
  sessionId,
  children,
  fallback,
  enablePolling = false,
}: InteractivePresentationProps) {
  const { data: session, isLoading, error } = useLiveSession(sessionId, {
    refetchInterval: enablePolling ? 30000 : undefined,
  });

  if (isLoading) {
    return fallback || <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Unavailable</h1>
          
          <p className="text-gray-600 mb-6">
            {error instanceof Error && error.message === 'Session not found' 
              ? 'This session does not exist or has been removed.'
              : 'Unable to load the session. Please check your connection and try again.'
            }
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
            
            <a
              href="/hair"
              className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              Back to Hair Experience
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return fallback || <PageLoader />;
  }

  return <>{children(session)}</>;
}
