/**
 * Presenter Console Component
 * For Stage Mode interactive presentations - presenter/host view
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PageLoader } from '../PageLoader';
import { useAuth } from '../../hooks/use-auth';

interface SessionParams {
  sessionId: string;
}

interface LiveSession {
  id: string;
  title: string;
  deckUrl?: string;
  mentiUrl?: string;
  ctaUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function PresenterConsole() {
  const { sessionId } = useParams<SessionParams>();
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch session data
  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ['/api/live/session', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/live/session/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to load session');
      }
      const data = await response.json();
      return data.data.session as LiveSession;
    },
    enabled: !!sessionId,
  });

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Handle ESC key for fullscreen exit
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Session Not Found</h1>
          <p className="text-gray-600">The requested session could not be loaded.</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Session</h1>
          <p className="text-gray-600">Session data is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{sessionData.title}</h1>
            <p className="text-gray-400 text-sm">Presenter Console • Session: {sessionId?.slice(0, 8)}...</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </button>
            <div className="text-sm text-gray-400">
              Host: {user?.displayName || 'You'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Presentation Area */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {sessionData.deckUrl ? (
            <iframe
              src={sessionData.deckUrl}
              className="w-full h-full border-0"
              allow="fullscreen"
              title="Presentation Deck"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-300 mb-2">No Presentation Loaded</h2>
              <p className="text-gray-500">Add a deck URL to display your presentation here</p>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Poll/Interaction Section */}
          <div className="flex-1 p-4">
            <h3 className="text-lg font-semibold mb-4">Interactive Poll</h3>
            {sessionData.mentiUrl ? (
              <div className="bg-gray-900 rounded-lg h-64">
                <iframe
                  src={sessionData.mentiUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title="Mentimeter Poll"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No poll configured</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {sessionData.ctaUrl && (
                <a
                  href={sessionData.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  Call to Action
                </a>
              )}
              <button className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Share QR Code
              </button>
              <button className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Notice */}
      {isFullscreen && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 px-4 py-2 rounded-lg">
          <p className="text-sm text-gray-300">Press ESC to exit fullscreen</p>
        </div>
      )}
    </div>
  );
}