import React from 'react';
import { useNotifications } from '../hooks/use-notifications.js';
import { Notification } from '@shared/notification-types.js';
import './NotificationCenter.css';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDismiss,
}) => {
  const { id, type, message, read } = notification;

  return (
    <div className={`notification-item ${type} ${read ? 'read' : 'unread'}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <div className="notification-actions">
          {!read && (
            <button
              className="btn-mark-read"
              onClick={() => onMarkAsRead(id)}
              aria-label="Mark as read"
            >
              Mark as read
            </button>
          )}
          <button
            className="btn-dismiss"
            onClick={() => onDismiss(id)}
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead, dismiss, hasUnread } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h3>Notifications {hasUnread && <span className="unread-badge">●</span>}</h3>
      </div>
      <div className="notification-list">
        {notifications.map((notification: Notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </div>
  );
};