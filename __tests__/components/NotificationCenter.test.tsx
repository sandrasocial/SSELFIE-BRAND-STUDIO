/**
 * Unit tests for NotificationCenter component
 * Tests rendering states, interactions, and accessibility requirements
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationCenter } from '../../client/src/components/NotificationCenter.js';
import type { Notification } from '../../shared/types/notification-types.js';

// Mock the useNotifications hook
const mockUseNotifications = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: false,
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  dismiss: jest.fn(),
  refresh: jest.fn(),
  loadMore: jest.fn(),
};

jest.mock('../../client/src/hooks/useNotifications.js', () => ({
  useNotifications: () => mockUseNotifications,
}));

describe('NotificationCenter', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockNotifications: Notification[] = [
    {
      id: 'notif_1',
      userId: 'user_1',
      type: 'model_training_complete',
      title: 'Model Training Complete',
      message: 'Your AI model "Brand Voice" has finished training successfully',
      priority: 'high',
      status: 'unread',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      data: {
        modelId: 'model_123',
        modelName: 'Brand Voice',
        trainingDuration: 30,
      },
    },
    {
      id: 'notif_2',
      userId: 'user_1',
      type: 'payment_confirmation',
      title: 'Payment Confirmed',
      message: 'Your payment has been processed successfully',
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
    {
      id: 'notif_3',
      userId: 'user_1',
      type: 'error_alert',
      title: 'System Error',
      message: 'There was an issue processing your request',
      priority: 'high',
      status: 'unread',
      createdAt: new Date('2024-01-01T08:00:00Z'),
      updatedAt: new Date('2024-01-01T08:00:00Z'),
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    user = userEvent.setup();
    
    // Reset mock functions
    Object.values(mockUseNotifications).forEach(fn => {
      if (jest.isMockFunction(fn)) {
        fn.mockClear();
      }
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Rendering States', () => {
    it('should render notification bell button', () => {
      render(<NotificationCenter />, { wrapper });
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toBeInTheDocument();
      expect(bellButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should show unread count badge when there are unread notifications', () => {
      Object.assign(mockUseNotifications, {
        unreadCount: 3,
      });

      render(<NotificationCenter />, { wrapper });
      
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-500');
    });

    it('should show 99+ for counts over 99', () => {
      Object.assign(mockUseNotifications, {
        unreadCount: 150,
      });

      render(<NotificationCenter />, { wrapper });
      
      const badge = screen.getByText('99+');
      expect(badge).toBeInTheDocument();
    });

    it('should not show badge when showBadge is false', () => {
      Object.assign(mockUseNotifications, {
        unreadCount: 3,
      });

      render(<NotificationCenter showBadge={false} />, { wrapper });
      
      expect(screen.queryByText('3')).not.toBeInTheDocument();
    });

    it('should render empty state when no notifications', async () => {
      Object.assign(mockUseNotifications, {
        notifications: [],
        unreadCount: 0,
      });

      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      expect(screen.getByText('No notifications')).toBeInTheDocument();
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    });

    it('should render loading state', async () => {
      Object.assign(mockUseNotifications, {
        loading: true,
        notifications: [],
      });

      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // spinner
    });

    it('should render error state', async () => {
      Object.assign(mockUseNotifications, {
        error: 'Failed to load notifications',
        notifications: [],
      });

      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should render notifications list', async () => {
      Object.assign(mockUseNotifications, {
        notifications: mockNotifications,
        unreadCount: 2,
      });

      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      // Check notifications are rendered
      expect(screen.getByText('Model Training Complete')).toBeInTheDocument();
      expect(screen.getByText('Payment Confirmed')).toBeInTheDocument();
      expect(screen.getByText('System Error')).toBeInTheDocument();
      
      // Check unread count in header
      expect(screen.getByText('(2 unread)')).toBeInTheDocument();
    });
  });

  describe('Notification Interactions', () => {
    beforeEach(() => {
      Object.assign(mockUseNotifications, {
        notifications: mockNotifications,
        unreadCount: 2,
      });
    });

    it('should open and close dropdown on button click', async () => {
      render(<NotificationCenter />, { wrapper });
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });
      
      // Initially closed
      expect(bellButton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      // Open dropdown
      await user.click(bellButton);
      expect(bellButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
      
      // Close dropdown
      await user.click(bellButton);
      expect(bellButton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <NotificationCenter />
          <button>Outside button</button>
        </div>, 
        { wrapper }
      );
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Click outside
      await user.click(screen.getByRole('button', { name: 'Outside button' }));
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown on escape key', async () => {
      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Press escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should mark notification as read when clicked', async () => {
      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      // Click on unread notification
      const unreadNotification = screen.getByText('Model Training Complete').closest('[role="listitem"]');
      expect(unreadNotification).toBeInTheDocument();
      
      await user.click(unreadNotification!);
      
      expect(mockUseNotifications.markAsRead).toHaveBeenCalledWith('notif_1');
    });

    it('should dismiss notification when dismiss button clicked', async () => {
      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      // Find and click dismiss button for first notification
      const firstNotification = screen.getByText('Model Training Complete').closest('[role="listitem"]');
      const dismissButton = within(firstNotification!).getByRole('button', { name: /dismiss notification/i });
      
      await user.click(dismissButton);
      
      expect(mockUseNotifications.dismiss).toHaveBeenCalledWith('notif_1');
    });

    it('should mark all notifications as read', async () => {
      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      // Click "Mark All Read" button
      const markAllReadButton = screen.getByRole('button', { name: /mark all notifications as read/i });
      await user.click(markAllReadButton);
      
      expect(mockUseNotifications.markAllAsRead).toHaveBeenCalled();
    });

    it('should refresh notifications', async () => {
      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh notifications/i });
      await user.click(refreshButton);
      
      expect(mockUseNotifications.refresh).toHaveBeenCalled();
    });

    it('should retry loading on error', async () => {
      Object.assign(mockUseNotifications, {
        error: 'Network error',
        notifications: [],
      });

      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      // Click "Try Again" button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);
      
      expect(mockUseNotifications.refresh).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      Object.assign(mockUseNotifications, {
        notifications: mockNotifications,
        unreadCount: 2,
      });
    });

    it('should have proper ARIA attributes', async () => {
      render(<NotificationCenter />, { wrapper });
      
      const bellButton = screen.getByRole('button', { name: /notifications \(2 unread\)/i });
      expect(bellButton).toHaveAttribute('aria-expanded', 'false');
      expect(bellButton).toHaveAttribute('aria-haspopup', 'true');
      
      // Open dropdown
      await user.click(bellButton);
      
      expect(bellButton).toHaveAttribute('aria-expanded', 'true');
      
      const dialog = screen.getByRole('dialog', { name: /notifications/i });
      expect(dialog).toHaveAttribute('aria-modal', 'false');
      
      const notificationList = screen.getByRole('list', { name: /notification list/i });
      expect(notificationList).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<NotificationCenter />, { wrapper });
      
      const bellButton = screen.getByRole('button', { name: /notifications/i });
      
      // Focus and activate with keyboard
      bellButton.focus();
      await user.keyboard('{Enter}');
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Should close with Escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      // Focus should return to button
      expect(bellButton).toHaveFocus();
    });

    it('should have proper labels for notifications', async () => {
      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      const notifications = screen.getAllByRole('listitem');
      
      // Check first notification has proper label
      expect(notifications[0]).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Notification: Model Training Complete')
      );
      expect(notifications[0]).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Unread')
      );
      expect(notifications[0]).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Priority: high')
      );
      
      // Check read notification
      expect(notifications[1]).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Read')
      );
    });

    it('should handle notification interactions with keyboard', async () => {
      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      const firstNotification = screen.getAllByRole('listitem')[0];
      
      // Focus and activate with Enter
      firstNotification.focus();
      await user.keyboard('{Enter}');
      
      expect(mockUseNotifications.markAsRead).toHaveBeenCalledWith('notif_1');
      
      // Test with Space key
      await user.keyboard('{Space}');
      expect(mockUseNotifications.markAsRead).toHaveBeenCalledTimes(2);
    });

    it('should provide proper time information', async () => {
      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      // Check that time elements have proper datetime attributes
      const timeElements = screen.getAllByRole('time');
      expect(timeElements[0]).toHaveAttribute('datetime', '2024-01-01T10:00:00.000Z');
    });
  });

  describe('Visual States', () => {
    it('should apply correct priority styling', async () => {
      Object.assign(mockUseNotifications, {
        notifications: mockNotifications,
      });

      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      const notifications = screen.getAllByRole('listitem');
      
      // High priority notification should have red border
      expect(notifications[0]).toHaveClass('border-red-400');
      
      // Medium priority notification should have yellow border
      expect(notifications[1]).toHaveClass('border-yellow-400');
    });

    it('should show different opacity for read notifications', async () => {
      Object.assign(mockUseNotifications, {
        notifications: mockNotifications,
      });

      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      const notifications = screen.getAllByRole('listitem');
      
      // Unread notification should have full opacity
      expect(notifications[0]).toHaveClass('opacity-100');
      
      // Read notification should have reduced opacity
      expect(notifications[1]).toHaveClass('opacity-60');
    });

    it('should show appropriate icons for notification types', async () => {
      Object.assign(mockUseNotifications, {
        notifications: mockNotifications,
      });

      render(<NotificationCenter />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      // Icons should be present (we're testing they exist, specific icon testing would require more setup)
      const icons = screen.getAllByRole('img', { hidden: true });
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      render(<NotificationCenter className="custom-class" />, { wrapper });
      
      const container = screen.getByRole('button', { name: /notifications/i }).parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('should respect maxHeight prop', async () => {
      Object.assign(mockUseNotifications, {
        notifications: mockNotifications,
      });

      render(<NotificationCenter maxHeight="300px" />, { wrapper });
      
      // Open dropdown
      await user.click(screen.getByRole('button', { name: /notifications/i }));
      
      const scrollableContent = screen.getByRole('list').parentElement;
      expect(scrollableContent).toHaveStyle({ maxHeight: '300px' });
    });
  });
});