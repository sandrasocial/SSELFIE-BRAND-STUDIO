import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@shared/notification-types.js';
import { notificationService } from '../services/notification-service.js';
import { useFeatureFlag } from './use-feature-flag.js';
import { infrastructureFlags } from '@shared/feature-flags.js';

interface UseNotificationsResult {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  dismiss: (id: string) => void;
  hasUnread: boolean;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [useNewSystem] = useFeatureFlag(infrastructureFlags.NEW_NOTIFICATION_SYSTEM);

  useEffect(() => {
    if (!useNewSystem) {
      return;
    }

    // Initial load
    setNotifications(notificationService.getActiveNotifications());

    // Subscribe to updates
    const unsubscribe = notificationService.subscribe((notification: Notification) => {
      setNotifications(notificationService.getActiveNotifications());
    });

    return () => unsubscribe();
  }, [useNewSystem]);

  const markAsRead = useCallback((id: string) => {
    if (useNewSystem) {
      notificationService.markAsRead(id);
    }
  }, [useNewSystem]);

  const dismiss = useCallback((id: string) => {
    if (useNewSystem) {
      notificationService.dismiss(id);
    }
  }, [useNewSystem]);

  const hasUnread = notifications.some(n => !n.read);

  return {
    notifications,
    markAsRead,
    dismiss,
    hasUnread
  };
}