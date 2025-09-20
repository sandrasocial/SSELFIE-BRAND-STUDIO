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
import TabbedPresenterInterface from './components/TabbedPresenterInterface';

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

          {/* Main Layout with Tabbed Interface */}
          <div className="flex h-[calc(100vh-80px)]">
            {/* Main Tabbed Content Area */}
            <div className="flex-1">
              <TabbedPresenterInterface
                session={session}
                sessionId={sessionId}
                showPoll={showPoll}
                showQR={showQR}
                showCTA={showCTA}
                isFullscreen={isFullscreen}
                presentationRef={presentationRef}
                onFullscreen={handleFullscreen}
                socketError={socketError}
              />
            </div>

            {/* Stage Controls Sidebar */}
            <div className="w-80 bg-gray-800 border-l border-gray-700">
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