/**
 * AudienceClient Component
 * Clean audience interface for Stage Mode with focus on participation
 */

import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import InteractivePresentation from './InteractivePresentation';
import MentimeterEmbed from '../../components/MentimeterEmbed';

interface SessionParams {
  sessionId: string;
}

interface UTMParams {
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
}

export default function AudienceClient() {
  const { sessionId } = useParams<SessionParams>();
  const [, setLocation] = useLocation();
  const [showQR, setShowQR] = useState(false);
  const [utmParams, setUtmParams] = useState<UTMParams>({});

  // Extract UTM parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params: UTMParams = {};
    
    const utmKeys = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term'] as const;
    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        params[key] = value;
      }
    });

    setUtmParams(params);

    // Check for QR display parameter
    setShowQR(urlParams.get('qr') === '1');
  }, []);

  // Helper function to add UTM parameters to URLs
  const addUtmToUrl = (baseUrl: string): string => {
    try {
      const url = new URL(baseUrl);
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value);
        }
      });
      return url.toString();
    } catch {
      return baseUrl; // Return original URL if parsing fails
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Session</h1>
          <p className="text-gray-600">No session ID provided.</p>
        </div>
      </div>
    );
  }

  return (
    <InteractivePresentation sessionId={sessionId} enablePolling>
      {(session) => (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm px-6 py-4 border-b sticky top-0 z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{session.title}</h1>
                  <p className="text-gray-600 text-sm">Interactive Session • Join the conversation</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {utmParams.utm_source === 'stage' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Live Session
                    </span>
                  )}
                  <div className="text-sm text-gray-500">
                    {sessionId.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Interactive Poll - Primary Focus */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                    <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Interactive Poll
                  </h2>
                  
                  {session.mentiUrl ? (
                    <div className="bg-gray-50 rounded-lg min-h-[400px] lg:min-h-[500px]">
                      <MentimeterEmbed
                        presentationId={extractMentimeterPresentationId(session.mentiUrl) || undefined}
                        height="500px"
                        className="w-full"
                        title={`${session.title} - Interactive Poll`}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg min-h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Get Ready to Participate</h3>
                        <p className="text-gray-600 max-w-sm">
                          The host will launch interactive elements during the presentation. Stay tuned!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Call to Action */}
                {session.ctaUrl && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
                    <h3 className="text-lg font-semibold mb-2 text-blue-900 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Take Action
                    </h3>
                    <p className="text-blue-700 mb-4">Ready to learn more? Join the experience:</p>
                    <a
                      href={addUtmToUrl(session.ctaUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-sm"
                    >
                      Get Started Now
                    </a>
                  </div>
                )}

                {/* Session Info */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Session Info</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Title</p>
                      <p className="text-gray-900">{session.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Session ID</p>
                      <p className="text-gray-900 font-mono text-sm">{sessionId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Started</p>
                      <p className="text-gray-900">{new Date(session.createdAt).toLocaleString()}</p>
                    </div>
                    {Object.keys(utmParams).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Source</p>
                        <p className="text-gray-900 capitalize">
                          {utmParams.utm_source || 'Direct'} • {utmParams.utm_campaign || 'General'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Code Display (for screens behind audience) */}
                {showQR && (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 text-center">Join This Session</h3>
                    <div className="text-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                        alt="Join Session QR Code" 
                        className="mx-auto mb-3 rounded"
                      />
                      <p className="text-xs text-gray-500 break-all">
                        Scan to join this session
                      </p>
                    </div>
                  </div>
                )}

                {/* Coming Soon Features */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Coming Soon</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Real-time Q&A
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Live reactions & feedback
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Resource downloads
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Session recordings
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </InteractivePresentation>
  );
}

// Helper function to extract Mentimeter presentation ID from URL
function extractMentimeterPresentationId(url: string): string | null {
  try {
    const match = url.match(/presentation\/([^\/\?]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}