/**
 * NotificationCenter Component
 * Displays and manages user notifications with accessibility support
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications.js';
import type { Notification, NotificationPriority, NotificationType } from '@shared/types/notification-types.js';

interface NotificationCenterProps {
  userId?: string;
  className?: string;
  maxHeight?: string;
  showBadge?: boolean;
  autoRefresh?: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

/**
 * Gets the appropriate icon for a notification type
 */
const getNotificationIcon = (type: NotificationType, priority: NotificationPriority) => {
  const baseClass = "w-5 h-5 flex-shrink-0";
  
  switch (type) {
    case 'model_training_complete':
      return <CheckCircle className={`${baseClass} text-green-500`} aria-hidden="true" />;
    case 'payment_confirmation':
      return <CheckCircle className={`${baseClass} text-blue-500`} aria-hidden="true" />;
    case 'error_alert':
      return <AlertCircle className={`${baseClass} text-red-500`} aria-hidden="true" />;
    case 'agent_insight':
      return priority === 'high' ? 
        <AlertCircle className={`${baseClass} text-orange-500`} aria-hidden="true" /> :
        <Info className={`${baseClass} text-blue-500`} aria-hidden="true" />;
    default:
      return <Info className={`${baseClass} text-gray-500`} aria-hidden="true" />;
  }
};

/**
 * Gets priority-based styling classes
 */
const getPriorityClasses = (priority: NotificationPriority, isRead: boolean) => {
  const opacity = isRead ? 'opacity-60' : 'opacity-100';
  
  switch (priority) {
    case 'high':
      return `border-l-4 border-red-400 bg-red-50 ${opacity}`;
    case 'medium':
      return `border-l-4 border-yellow-400 bg-yellow-50 ${opacity}`;
    case 'low':
      return `border-l-4 border-blue-400 bg-blue-50 ${opacity}`;
    default:
      return `border-l-4 border-gray-400 bg-gray-50 ${opacity}`;
  }
};

/**
 * Formats relative time for notification display
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

/**
 * Individual notification item component
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDismiss,
}) => {
  const isRead = notification.status === 'read';
  const priorityClasses = getPriorityClasses(notification.priority, isRead);
  const icon = getNotificationIcon(notification.type, notification.priority);

  const handleMarkAsRead = () => {
    if (!isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDismiss = () => {
    onDismiss(notification.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMarkAsRead();
    }
  };

  return (
    <div
      className={`p-4 mb-2 rounded-lg transition-all duration-200 hover:shadow-md ${priorityClasses}`}
      role="listitem"
      tabIndex={0}
      onClick={handleMarkAsRead}
      onKeyDown={handleKeyDown}
      aria-label={`Notification: ${notification.title}. ${isRead ? 'Read' : 'Unread'}. Priority: ${notification.priority}.`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {icon}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
            <p className={`text-sm mt-1 ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>
              {notification.message}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <time dateTime={notification.createdAt.toISOString()}>
                {formatRelativeTime(notification.createdAt)}
              </time>
              {!isRead && (
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" aria-label="Unread" />
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-150"
          aria-label={`Dismiss notification: ${notification.title}`}
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

/**
 * Main NotificationCenter component
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  className = '',
  maxHeight = '400px',
  showBadge = true,
  autoRefresh = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    dismiss,
    refresh,
  } = useNotifications({
    userId,
    autoRefresh,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        
        {/* Unread Badge */}
        {showBadge && unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-medium"
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          role="dialog"
          aria-label="Notifications"
          aria-modal="false"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors duration-150"
                aria-label="Refresh notifications"
              >
                Refresh
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-150"
                  aria-label="Mark all notifications as read"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight }}
            role="list"
            aria-label="Notification list"
          >
            {loading && notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                Loading notifications...
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-red-600" role="alert">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                <p>Failed to load notifications</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm mt-1">You're all caught up!</p>
              </div>
            )}

            {notifications.length > 0 && (
              <div className="p-4">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDismiss={dismiss}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};