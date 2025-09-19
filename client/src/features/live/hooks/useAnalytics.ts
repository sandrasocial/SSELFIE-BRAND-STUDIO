/**
 * useAnalytics Hook
 * Handles Stage Mode event tracking and analytics
 */

import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface AnalyticsEvent {
  sessionId: string;
  type: 'qr_view' | 'cta_click' | 'signup_success' | 'reaction' | 'state_change' | 'session_join' | 'session_leave';
  meta?: Record<string, any>;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface SessionAnalytics {
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

interface UseAnalyticsOptions {
  sessionId: string;
  enableAutoTracking?: boolean;
  utmParams?: {
    utm_source?: string;
    utm_campaign?: string;
    utm_medium?: string;
    utm_content?: string;
    utm_term?: string;
  };
}

interface UseAnalyticsReturn {
  trackEvent: (type: AnalyticsEvent['type'], meta?: Record<string, any>) => Promise<void>;
  analytics: SessionAnalytics | undefined;
  isLoading: boolean;
  error: Error | null;
  refetchAnalytics: () => void;
}

export function useAnalytics({
  sessionId,
  enableAutoTracking = true,
  utmParams = {},
}: UseAnalyticsOptions): UseAnalyticsReturn {

  // Fetch session analytics
  const { 
    data: analytics, 
    isLoading, 
    error, 
    refetch: refetchAnalytics 
  } = useQuery({
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
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  // Track analytics event
  const trackEvent = useCallback(async (
    type: AnalyticsEvent['type'], 
    meta: Record<string, any> = {}
  ) => {
    try {
      const eventData: AnalyticsEvent = {
        sessionId,
        type,
        meta,
        ...utmParams,
      };

      const response = await fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to track event');
      }

      const result = await response.json();
      console.log('📊 Event tracked:', { type, eventId: result.data.eventId });

      // Optionally refetch analytics to get updated data
      // Note: We don't always want to refetch immediately to avoid too many requests
      if (type === 'cta_click' || type === 'signup_success') {
        setTimeout(() => refetchAnalytics(), 2000); // Delayed refetch for important events
      }

    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Don't throw error - analytics should not break user experience
    }
  }, [sessionId, utmParams, refetchAnalytics]);

  // Auto-track session join on mount (if enabled)
  useEffect(() => {
    if (enableAutoTracking && sessionId) {
      trackEvent('session_join');
    }

    // Auto-track session leave on unmount
    return () => {
      if (enableAutoTracking && sessionId) {
        // Use navigator.sendBeacon for reliable tracking on page unload
        const eventData: AnalyticsEvent = {
          sessionId,
          type: 'session_leave',
          ...utmParams,
        };

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/event', JSON.stringify(eventData));
        } else {
          // Fallback for browsers that don't support sendBeacon
          trackEvent('session_leave');
        }
      }
    };
  }, [sessionId, enableAutoTracking, utmParams, trackEvent]);

  return {
    trackEvent,
    analytics,
    isLoading,
    error,
    refetchAnalytics,
  };
}

// Helper hook for extracting UTM parameters from URL
export function useUTMParams(): Record<string, string> {
  const searchParams = new URLSearchParams(window.location.search);
  
  const utmParams: Record<string, string> = {};
  const utmKeys = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term'];
  
  utmKeys.forEach(key => {
    const value = searchParams.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });
  
  return utmParams;
}