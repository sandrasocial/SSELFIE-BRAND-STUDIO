/**
 * useNotifications Hook
 * Manages notification state and provides actions for notification management
 * Integrates with feature flags for gradual rollout
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Notification,
  NotificationId,
  UseNotificationsReturn,
  UseNotificationsState,
  NotificationResponse,
  NotificationServiceConfig
} from '@shared/types/notification-types.js';

// Feature flag check (client-side equivalent)
const checkFeatureFlag = (flag: string): boolean => {
  // In a real implementation, this would call your feature flag service
  // For now, we'll check environment variables or use defaults
  const flags: Record<string, boolean> = {
    'NOTIFICATIONS_ENABLED': true,
    'REAL_TIME_NOTIFICATIONS': true,
    'NOTIFICATION_PERSISTENCE': true,
  };
  return flags[flag] ?? false;
};

interface UseNotificationsOptions {
  config?: NotificationServiceConfig;
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const DEFAULT_CONFIG: NotificationServiceConfig = {
  enableFeatureFlag: 'NOTIFICATIONS_ENABLED',
  emailService: true,
  realTimeUpdates: true,
  persistToDatabase: true,
};

/**
 * Custom hook for managing user notifications
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    config = DEFAULT_CONFIG,
    userId,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const queryClient = useQueryClient();

  // Check if notifications are enabled via feature flag
  const isEnabled = useMemo(() => {
    if (config.enableFeatureFlag) {
      return checkFeatureFlag(config.enableFeatureFlag);
    }
    return true;
  }, [config.enableFeatureFlag]);

  // Local state for immediate UI updates
  const [localState, setLocalState] = useState<Pick<UseNotificationsState, 'error'>>({
    error: null,
  });

  // Query for fetching notifications
  const {
    data: notificationData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async (): Promise<NotificationResponse> => {
      if (!isEnabled) {
        return {
          notifications: [],
          totalCount: 0,
          unreadCount: 0,
          hasMore: false,
        };
      }

      const response = await fetch('/api/notifications', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: isEnabled,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000, // 10 seconds
  });

  // Extract data from query response
  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;
  const hasMore = notificationData?.hasMore || false;

  // Mutation for marking notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: NotificationId) => {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      setLocalState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
      }));
    },
  });

  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      setLocalState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
      }));
    },
  });

  // Mutation for dismissing notification
  const dismissMutation = useMutation({
    mutationFn: async (id: NotificationId) => {
      const response = await fetch(`/api/notifications/${id}/dismiss`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to dismiss notification: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      setLocalState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to dismiss notification',
      }));
    },
  });

  // Actions
  const markAsRead = useCallback(async (id: NotificationId) => {
    if (!isEnabled) return;
    
    // Clear any previous errors
    setLocalState(prev => ({ ...prev, error: null }));
    
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      // Error is handled in mutation onError
      console.error('Failed to mark notification as read:', error);
    }
  }, [isEnabled, markAsReadMutation]);

  const markAllAsRead = useCallback(async () => {
    if (!isEnabled) return;
    
    setLocalState(prev => ({ ...prev, error: null }));
    
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [isEnabled, markAllAsReadMutation]);

  const dismiss = useCallback(async (id: NotificationId) => {
    if (!isEnabled) return;
    
    setLocalState(prev => ({ ...prev, error: null }));
    
    try {
      await dismissMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  }, [isEnabled, dismissMutation]);

  const refresh = useCallback(async () => {
    if (!isEnabled) return;
    
    setLocalState(prev => ({ ...prev, error: null }));
    
    try {
      await refetch();
    } catch (error) {
      setLocalState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh notifications',
      }));
    }
  }, [isEnabled, refetch]);

  const loadMore = useCallback(async () => {
    // TODO: Implement pagination for loading more notifications
    console.log('loadMore not yet implemented');
  }, []);

  // Real-time updates via WebSocket (if enabled)
  useEffect(() => {
    if (!isEnabled || !config.realTimeUpdates) return;

    // TODO: Implement WebSocket connection for real-time updates
    // This would listen for new notifications and update the cache
    
    return () => {
      // Cleanup WebSocket connection
    };
  }, [isEnabled, config.realTimeUpdates]);

  // Combined error state
  const error = localState.error || (queryError instanceof Error ? queryError.message : null);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    
    // Actions
    markAsRead,
    markAllAsRead,
    dismiss,
    refresh,
    loadMore,
  };
}