/**
 * TabbedPresenterInterface Component
 * Enhanced presenter interface with tabbed layout for Deck, Poll, Workshop, and Stats
 */

import React, { useState } from 'react';
import CanvaEmbed from '../../../components/CanvaEmbed';
import MentimeterEmbed from '../../../components/MentimeterEmbed';
import WorkshopPane from '../WorkshopPane';
import SessionStats from '../SessionStats';
import { LiveSession } from '../hooks/useLiveSession';

interface TabbedPresenterInterfaceProps {
  session: LiveSession;
  sessionId: string;
  showPoll: boolean;
  showQR: boolean;
  showCTA: boolean;
  isFullscreen: boolean;
  presentationRef: React.RefObject<HTMLDivElement>;
  onFullscreen: () => void;
  socketError: string | null;
}

type TabKey = 'deck' | 'poll' | 'workshop' | 'stats';

export default function TabbedPresenterInterface({
  session,
  sessionId,
  showPoll,
  showQR,
  showCTA,
  isFullscreen,
  presentationRef,
  onFullscreen,
  socketError,
}: TabbedPresenterInterfaceProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('deck');

  const tabs = [
    { key: 'deck' as TabKey, label: 'Deck', icon: '🎯' },
    { key: 'poll' as TabKey, label: 'Poll', icon: '📊' },
    { key: 'workshop' as TabKey, label: 'Workshop', icon: '🔧' },
    { key: 'stats' as TabKey, label: 'Stats', icon: '📈' },
  ];

  // Helper functions to extract IDs from URLs
  const extractCanvaDesignId = (url: string): string | null => {
    try {
      const match = url.match(/\/design\/([^\/\?]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const extractMentimeterPresentationId = (url: string): string | null => {
    try {
      const match = url.match(/presentation\/([^\/\?]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'deck':
        return (
          <div 
            ref={presentationRef}
            className="h-full bg-black flex items-center justify-center relative"
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
                <div className="mt-4 space-y-2">
                  <button
                    onClick={onFullscreen}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  </button>
                  <p className="text-gray-600 text-sm">Press F for fullscreen mode</p>
                </div>
              </div>
            )}

            {/* Fullscreen Notice */}
            {isFullscreen && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 px-4 py-2 rounded-lg z-10">
                <p className="text-sm text-gray-300">Press ESC to exit fullscreen</p>
              </div>
            )}
          </div>
        );

      case 'poll':
        return (
          <div className="h-full p-6 bg-gray-900">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Interactive Poll Control</h3>
              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={showPoll} 
                    className="mr-2" 
                    readOnly 
                  />
                  <span className="text-gray-300 text-sm">Poll Visible to Audience</span>
                </label>
              </div>
            </div>

            {session.mentiUrl && showPoll ? (
              <div className="bg-gray-800 rounded-lg h-96">
                <MentimeterEmbed
                  presentationId={extractMentimeterPresentationId(session.mentiUrl) || undefined}
                  height="384px"
                  className="w-full h-full"
                  title={`${session.title} - Interactive Poll`}
                />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {session.mentiUrl ? 'Poll hidden from audience' : 'No poll configured'}
                  </p>
                </div>
              </div>
            )}

            {/* Poll Instructions */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Poll Control Tips</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Toggle poll visibility using stage controls</li>
                <li>• Monitor audience responses in real-time</li>
                <li>• Use polls to increase engagement and collect feedback</li>
                <li>• Results are automatically saved to session analytics</li>
              </ul>
            </div>
          </div>
        );

      case 'workshop':
        return <WorkshopPane sessionId={sessionId} />;

      case 'stats':
        return <SessionStats />;

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="flex space-x-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>

      {/* Socket Error Display */}
      {socketError && (
        <div className="bg-red-900 border-t border-red-600 p-3">
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
  );
}