/**
 * SessionStats Component
 * Admin page for viewing Stage Mode session analytics
 */

import React from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PageLoader } from '../../components/PageLoader';

interface SessionParams {
  sessionId: string;
}

interface SessionAnalytics {
  totalEvents: number;
  eventBreakdown: Record<string, number>;
  utmBreakdown: Record<string, number>;
  recentEvents: Array<{
    id: string;
    eventType: string;
    meta: any;
    utmSource?: string;
    createdAt: string;
  }>;
  session: {
    id: string;
    title: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function SessionStats() {
  const { sessionId } = useParams<SessionParams>();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/session', sessionId],
    queryFn: async (): Promise<SessionAnalytics> => {
      const response = await fetch(`/api/analytics/session/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!sessionId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Analytics Unavailable</h1>
          <p className="text-gray-600">Failed to load session analytics.</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h1>
          <p className="text-gray-600">No analytics data found for this session.</p>
        </div>
      </div>
    );
  }

  const { session, totalEvents, eventBreakdown, utmBreakdown, recentEvents } = analytics;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
              <p className="text-gray-600">Session Analytics Dashboard</p>
            </div>
            <div className="text-sm text-gray-500">
              Session ID: {sessionId?.slice(0, 8)}...
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">QR Views</p>
                <p className="text-2xl font-bold text-gray-900">{eventBreakdown.qr_view || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CTA Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{eventBreakdown.cta_click || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a.5.5 0 01.5.5v1a1.5 1.5 0 003 0v-1a.5.5 0 01.5-.5H15m-6 0V9a6 6 0 1112 0v1m-6 0a6 6 0 01-12 0v1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reactions</p>
                <p className="text-2xl font-bold text-gray-900">{eventBreakdown.reaction || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Event Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(eventBreakdown).map(([eventType, count]) => (
                <div key={eventType} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {eventType.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* UTM Source Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Traffic Sources</h2>
            {Object.keys(utmBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(utmBreakdown).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      <span className="text-sm font-medium text-gray-700">{source}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500 text-sm">No UTM tracking data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h2>
          {recentEvents.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {event.eventType.replace('_', ' ')}
                      </p>
                      {event.utmSource && (
                        <p className="text-xs text-gray-500">Source: {event.utmSource}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">No events recorded yet</p>
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Session Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p className="text-sm text-gray-900">{new Date(session.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm text-gray-900">{new Date(session.updatedAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Creator ID</p>
              <p className="text-sm text-gray-900 font-mono">{session.createdBy}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Session ID</p>
              <p className="text-sm text-gray-900 font-mono">{session.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}