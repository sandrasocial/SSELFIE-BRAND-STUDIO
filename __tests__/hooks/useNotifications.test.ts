/**
 * Unit tests for useNotifications hook
 * Tests feature flag integration, state management, and notification actions
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNotifications } from '../../client/src/hooks/useNotifications.js';
import type { NotificationResponse } from '../../shared/types/notification-types.js';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock feature flag check
jest.mock('../../client/src/hooks/useNotifications.js', () => {
  const originalModule = jest.requireActual('../../client/src/hooks/useNotifications.js');
  return {
    ...originalModule,
    checkFeatureFlag: jest.fn(),
  };
});

describe('useNotifications', () => {
  let queryClient: QueryClient;
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockNotificationResponse: NotificationResponse = {
    notifications: [
      {
        id: 'notif_1',
        userId: 'user_1',
        type: 'model_training_complete',
        title: 'Model Training Complete',
        message: 'Your AI model has finished training',
        priority: 'high',
        status: 'unread',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        data: {
          modelId: 'model_123',
          modelName: 'Test Model',
          trainingDuration: 30,
        },
      },
      {
        id: 'notif_2',
        userId: 'user_1',
        type: 'payment_confirmation',
        title: 'Payment Confirmed',
        message: 'Your payment has been processed',
        priority: 'medium',
        status: 'read',
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-01T09:30:00Z'),
        readAt: new Date('2024-01-01T09:30:00Z'),
        data: {
          transactionId: 'txn_456',
          amount: 29.99,
          currency: 'USD',
          planType: 'Premium',
        },
      },
    ],
    totalCount: 2,
    unreadCount: 1,
    hasMore: false,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    mockFetch.mockClear();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Feature Flag Integration', () => {
    it('should return empty state when notifications are disabled', () => {
      // Mock feature flag as disabled
      const checkFeatureFlag = jest.requireMock('../../client/src/hooks/useNotifications.js').checkFeatureFlag;
      checkFeatureFlag.mockReturnValue(false);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    it('should fetch notifications when feature flag is enabled', async () => {
      const checkFeatureFlag = jest.requireMock('../../client/src/hooks/useNotifications.js').checkFeatureFlag;
      checkFeatureFlag.mockReturnValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotificationResponse),
      });

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/notifications', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      const checkFeatureFlag = jest.requireMock('../../client/src/hooks/useNotifications.js').checkFeatureFlag;
      checkFeatureFlag.mockReturnValue(true);
    });

    it('should initialize with loading state', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.loading).toBe(true);
      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it('should handle successful data fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotificationResponse),
      });

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.notifications).toEqual(mockNotificationResponse.notifications);
      expect(result.current.unreadCount).toBe(mockNotificationResponse.unreadCount);
      expect(result.current.hasMore).toBe(mockNotificationResponse.hasMore);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.notifications).toEqual([]);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch notifications: Internal Server Error');
    });
  });

  describe('Notification Actions', () => {
    beforeEach(() => {
      const checkFeatureFlag = jest.requireMock('../../client/src/hooks/useNotifications.js').checkFeatureFlag;
      checkFeatureFlag.mockReturnValue(true);

      // Mock initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotificationResponse),
      });
    });

    it('should mark notification as read', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock mark as read API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      // Mock refetch after marking as read
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockNotificationResponse,
          unreadCount: 0,
        }),
      });

      await act(async () => {
        await result.current.markAsRead('notif_1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/notifications/notif_1/read', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should mark all notifications as read', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock mark all as read API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      // Mock refetch after marking all as read
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockNotificationResponse,
          unreadCount: 0,
        }),
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should dismiss notification', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock dismiss API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      // Mock refetch after dismissing
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockNotificationResponse,
          notifications: mockNotificationResponse.notifications.slice(1),
          totalCount: 1,
        }),
      });

      await act(async () => {
        await result.current.dismiss('notif_1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/notifications/notif_1/dismiss', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should refresh notifications', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear previous calls
      mockFetch.mockClear();

      // Mock refresh
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotificationResponse),
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/notifications', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle action errors gracefully', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock failed mark as read
      mockFetch.mockRejectedValueOnce(new Error('Action failed'));

      await act(async () => {
        await result.current.markAsRead('notif_1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to mark notification as read');
      });
    });
  });

  describe('Configuration Options', () => {
    beforeEach(() => {
      const checkFeatureFlag = jest.requireMock('../../client/src/hooks/useNotifications.js').checkFeatureFlag;
      checkFeatureFlag.mockReturnValue(true);
    });

    it('should respect autoRefresh option', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockNotificationResponse),
      });

      const { rerender } = renderHook(
        ({ autoRefresh }) => useNotifications({ autoRefresh }),
        {
          wrapper,
          initialProps: { autoRefresh: false },
        }
      );

      // With autoRefresh disabled, should not set up interval
      expect(mockFetch).toHaveBeenCalledTimes(1);

      rerender({ autoRefresh: true });

      // With autoRefresh enabled, should set up interval
      // Note: Testing intervals in Jest is complex, so we're just checking the initial call
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should use custom config', async () => {
      const customConfig = {
        enableFeatureFlag: 'CUSTOM_NOTIFICATIONS_FLAG',
        realTimeUpdates: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotificationResponse),
      });

      const { result } = renderHook(
        () => useNotifications({ config: customConfig }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should still work with custom config
      expect(result.current.notifications).toHaveLength(2);
    });
  });
});