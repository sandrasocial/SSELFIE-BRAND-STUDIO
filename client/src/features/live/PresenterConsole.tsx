/**
 * PresenterConsole Component
 * Advanced presenter interface for Stage Mode with fullscreen deck display
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'wouter';
import { useAuth } from '../../hooks/use-auth';
import InteractivePresentation from './InteractivePresentation';
import StageControls from './components/StageControls';
import CanvaEmbed from '../../components/CanvaEmbed';
import MentimeterEmbed from '../../components/MentimeterEmbed';
import { useSocket } from './hooks/useSocket';
import { useAnalytics } from './hooks/useAnalytics';

interface SessionParams {
  sessionId: string;
}

export default function PresenterConsole() {
  const { sessionId } = useParams<SessionParams>();
  const { user } = useAuth();
  
  // State management
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPoll, setShowPoll] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  
  // Refs for fullscreen management
  const presentationRef = useRef<HTMLDivElement>(null);

  // Fullscreen functionality
  const handleFullscreen = useCallback(async () => {
    if (!presentationRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await presentationRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
    }
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keys if not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'f':
          event.preventDefault();
          handleFullscreen();
          break;
        case 'escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
        case 'q':
          event.preventDefault();
          setShowQR(prev => !prev);
          break;
        default:
          break;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleFullscreen, isFullscreen]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Session</h1>
          <p className="text-gray-600">No session ID provided.</p>
        </div>
      </div>
    );
  }

  return (
    <InteractivePresentation sessionId={sessionId} enablePolling>
      {(session) => {
        // Initialize real-time socket connection (presenter role)
        const { 
          isConnected, 
          isConnecting, 
          error: socketError, 
          sessionState: remoteState,
          reactionCounts,
          emitStateUpdate 
        } = useSocket({ 
          sessionId, 
          role: 'presenter', 
          enabled: true 
        });

        // Initialize analytics tracking
        const { trackEvent } = useAnalytics({
          sessionId,
          enableAutoTracking: true,
        });

        // Sync local state with remote state and emit updates
        const syncStateUpdate = useCallback((updates: any) => {
          // Update local state first for immediate UI response
          if (updates.showPoll !== undefined) setShowPoll(updates.showPoll);
          if (updates.showQR !== undefined) setShowQR(updates.showQR);
          if (updates.showCTA !== undefined) setShowCTA(updates.showCTA);

          // Emit to other clients
          emitStateUpdate(updates);

          // Track state changes
          trackEvent('state_change', updates);
        }, [emitStateUpdate, trackEvent]);

        // Update StageControls callbacks to use real-time sync
        const handleTogglePoll = useCallback((show: boolean) => {
          syncStateUpdate({ showPoll: show });
        }, [syncStateUpdate]);

        const handleToggleQR = useCallback((show: boolean) => {
          syncStateUpdate({ showQR: show });
        }, [syncStateUpdate]);

        const handleToggleCTA = useCallback((show: boolean) => {
          syncStateUpdate({ showCTA: show });
        }, [syncStateUpdate]);

        return (
        <div className={`min-h-screen bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          {/* Header */}
          <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{session.title}</h1>
                <div className="flex items-center space-x-3">
                  <p className="text-gray-400 text-sm">
                    Host: {user?.displayName || user?.email || 'You'}
                  </p>
                  
                  {/* Real-time Status Indicator */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-xs text-gray-400">
                      {isConnected ? 'Live' : isConnecting ? 'Connecting...' : 'Offline'}
                    </span>
                  </div>

                  {/* Reaction Counter */}
                  {Object.keys(reactionCounts).length > 0 && (
                    <div className="flex items-center space-x-2 bg-gray-700 rounded-full px-3 py-1">
                      <span className="text-xs text-gray-300">Reactions:</span>
                      {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <span key={emoji} className="text-xs text-white">
                          {emoji} {count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  Session: {sessionId.slice(0, 8)}...
                </div>
                <button
                  onClick={handleFullscreen}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="flex h-[calc(100vh-80px)]">
            {/* Presentation Area */}
            <div 
              ref={presentationRef}
              className="flex-1 bg-black flex items-center justify-center relative"
            >
              {session.deckUrl ? (
                <div className="w-full h-full">
                  <CanvaEmbed
                    designId={extractCanvaDesignId(session.deckUrl) || undefined}
                    height="100%"
                    className="w-full h-full"
                    title={`${session.title} - Presentation Deck`}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-300 mb-2">No Presentation Loaded</h2>
                  <p className="text-gray-500">Configure a deck URL to display your presentation here</p>
                  <p className="text-gray-600 text-sm mt-2">Press F for fullscreen mode</p>
                </div>
              )}

              {/* Fullscreen Notice */}
              {isFullscreen && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 px-4 py-2 rounded-lg z-10">
                  <p className="text-sm text-gray-300">Press ESC to exit fullscreen</p>
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              {/* Poll Section */}
              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold mb-4">Interactive Poll</h3>
                {session.mentiUrl && showPoll ? (
                  <div className="bg-gray-900 rounded-lg h-64">
                    <MentimeterEmbed
                      presentationId={extractMentimeterPresentationId(session.mentiUrl) || undefined}
                      height="256px"
                      className="w-full h-full"
                      title={`${session.title} - Interactive Poll`}
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
                      <p className="text-gray-500 text-sm">
                        {session.mentiUrl ? 'Poll hidden' : 'No poll configured'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stage Controls */}
              <StageControls
                showPoll={showPoll}
                showQR={showQR}
                showCTA={showCTA}
                onTogglePoll={handleTogglePoll}
                onToggleQR={handleToggleQR}
                onToggleCTA={handleToggleCTA}
                onFullscreen={handleFullscreen}
                isFullscreen={isFullscreen}
                ctaUrl={session.ctaUrl}
                sessionId={sessionId}
              />
              
              {/* Socket Error Display */}
              {socketError && (
                <div className="bg-red-900 border border-red-600 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-red-200 font-medium">Real-time Connection Issue</p>
                      <p className="text-xs text-red-300">{socketError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        ); // End of main return statement
      }} 
    </InteractivePresentation>
  );
}

// Helper functions to extract IDs from URLs
function extractCanvaDesignId(url: string): string | null {
  try {
    const match = url.match(/\/design\/([^\/\?]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function extractMentimeterPresentationId(url: string): string | null {
  try {
    const match = url.match(/presentation\/([^\/\?]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}