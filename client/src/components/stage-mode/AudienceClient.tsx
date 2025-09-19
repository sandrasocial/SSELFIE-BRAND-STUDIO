/**
 * Audience Client Component
 * For Stage Mode interactive presentations - audience/participant view
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PageLoader } from '../PageLoader';

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

export default function AudienceClient() {
  const { sessionId } = useParams<SessionParams>();
  const [qrCodeVisible, setQrCodeVisible] = useState(false);

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

  // Generate QR code URL for sharing
  const currentUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Session Not Found</h1>
          <p className="text-gray-600">The requested session could not be loaded.</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Session</h1>
          <p className="text-gray-600">Session data is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{sessionData.title}</h1>
              <p className="text-gray-600 text-sm">Interactive Session • Join the conversation</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQrCodeVisible(!qrCodeVisible)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Share
              </button>
              <div className="text-sm text-gray-500">
                Session: {sessionId?.slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrCodeVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Share This Session</h3>
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">Scan QR code or share the link</p>
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <p className="text-xs font-mono text-gray-800 break-all">{currentUrl}</p>
              </div>
              <button
                onClick={() => setQrCodeVisible(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Poll/Interaction Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Interactive Poll</h2>
            {sessionData.mentiUrl ? (
              <div className="bg-gray-50 rounded-lg h-96">
                <iframe
                  src={sessionData.mentiUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title="Mentimeter Poll"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Participate</h3>
                  <p className="text-gray-600">The host will launch interactive elements during the presentation</p>
                </div>
              </div>
            )}
          </div>

          {/* Info & Actions */}
          <div className="space-y-6">
            {/* Session Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Session Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Title</p>
                  <p className="text-gray-900">{sessionData.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Session ID</p>
                  <p className="text-gray-900 font-mono text-sm">{sessionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Started</p>
                  <p className="text-gray-900">{new Date(sessionData.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            {sessionData.ctaUrl && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h2 className="text-lg font-semibold mb-2 text-blue-900">Take Action</h2>
                <p className="text-blue-700 mb-4">Ready to learn more? Click the button below:</p>
                <a
                  href={sessionData.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  Get Started
                </a>
              </div>
            )}

            {/* Placeholder for future features */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Coming Soon</h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time Q&A</li>
                <li>• Live reactions</li>
                <li>• Resource downloads</li>
                <li>• Session recordings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}