# Notification System Documentation

## Overview

The notification system provides a comprehensive, type-safe solution for managing user notifications in the SSELFIE Brand Studio application. It includes real-time updates, email integration, user preferences, and accessibility features.

## Architecture

### Core Components

1. **Type Definitions** (`shared/types/notification-types.ts`)
2. **React Hook** (`client/src/hooks/useNotifications.ts`)
3. **UI Component** (`client/src/components/NotificationCenter.tsx`)
4. **Server Service** (`server/services/notification-service.ts`)
5. **Email Integration** (`server/services/email-service.ts`)
6. **Email Templates** (`shared/email-templates/`)

### Feature Flag Integration

The notification system integrates with the existing feature flag system:

- `NOTIFICATIONS_ENABLED` - Enable/disable the entire notification system
- `EMAIL_NOTIFICATIONS` - Enable/disable email notifications
- `REAL_TIME_NOTIFICATIONS` - Enable/disable WebSocket updates
- `NOTIFICATION_PERSISTENCE` - Enable/disable database persistence

## Usage

### Basic Hook Usage

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    dismiss,
    refresh
  } = useNotifications({
    userId: 'user_123',
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  });

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      
      {notifications.map(notification => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>
            Mark as Read
          </button>
          <button onClick={() => dismiss(notification.id)}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Notification Center Component

```typescript
import { NotificationCenter } from '@/components/NotificationCenter';

function AppHeader() {
  return (
    <header>
      <h1>SSELFIE Studio</h1>
      <NotificationCenter
        userId="user_123"
        showBadge={true}
        maxHeight="400px"
        autoRefresh={true}
      />
    </header>
  );
}
```

### Server-Side Notification Creation

```typescript
import { NotificationService } from '@server/services/notification-service';

// Create a model training completion notification
await NotificationService.createNotification({
  userId: 'user_123',
  type: 'model_training_complete',
  title: 'Model Training Complete',
  message: 'Your AI model "Brand Voice" has finished training successfully',
  priority: 'high',
  data: {
    modelId: 'model_456',
    modelName: 'Brand Voice',
    trainingDuration: 30,
    accuracy: 92.5
  }
});

// Create a payment confirmation notification
await NotificationService.createNotification({
  userId: 'user_123',
  type: 'payment_confirmation',
  title: 'Payment Confirmed',
  message: 'Your premium subscription has been activated',
  priority: 'medium',
  data: {
    transactionId: 'txn_789',
    amount: 29.99,
    currency: 'USD',
    planType: 'Premium Monthly'
  }
});
```

## Notification Types

### Available Types

- `model_training_complete` - AI model training finished
- `payment_confirmation` - Payment processed successfully
- `onboarding_status` - Onboarding step completed or updated
- `generation_limit_warning` - User approaching generation limits
- `system_update` - System maintenance or updates
- `agent_insight` - AI agent generated insights
- `task_completed` - Background task finished
- `error_alert` - System errors requiring attention

### Type-Specific Data

Each notification type includes specific data relevant to that event:

```typescript
// Model Training Notification
{
  type: 'model_training_complete',
  data: {
    modelId: string;
    modelName: string;
    trainingDuration: number; // minutes
    accuracy?: number; // percentage
  }
}

// Payment Notification
{
  type: 'payment_confirmation',
  data: {
    transactionId: string;
    amount: number;
    currency: string;
    planType: string;
    nextBillingDate?: string;
  }
}
```

## Email Integration

### Email Templates

Email templates are stored in `shared/email-templates/` and use Handlebars syntax:

```html
<!-- model-training-complete.html -->
<h1>🎉 Training Complete!</h1>
<p>Hi {{userName}}, your AI model "{{modelName}}" has finished training.</p>
<p>Training completed in {{trainingDuration}} minutes.</p>
{{#if accuracy}}
<p>Model Accuracy: {{accuracy}}%</p>
{{/if}}
```

### Email Queue Processing

The system includes an email queue with retry logic:

```typescript
// Process email queue (typically called by a background job)
await NotificationService.processEmailQueue();
```

### User Email Preferences

Users can control email notifications through preferences:

```typescript
const preferences = await NotificationService.getUserPreferences('user_123');

// Update preferences
await NotificationService.updateUserPreferences('user_123', {
  emailEnabled: true,
  frequency: 'immediate',
  types: {
    model_training_complete: true,
    payment_confirmation: true,
    // ... other types
  },
  priorities: {
    high: true,
    medium: true,
    low: false
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  }
});
```

## API Endpoints

The notification system expects the following API endpoints to be implemented:

- `GET /api/notifications` - Fetch user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read
- `POST /api/notifications/:id/dismiss` - Dismiss notification
- `GET /api/user/notification-preferences` - Get user preferences
- `POST /api/user/notification-preferences` - Update user preferences

## Accessibility Features

The NotificationCenter component includes comprehensive accessibility support:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Escape, and Space keys
- **Focus Management**: Proper focus handling when opening/closing dropdowns
- **Screen Reader Support**: Descriptive text for notification status, priority, and actions
- **High Contrast**: Visual indicators for different notification states

### Accessibility Implementation

```typescript
// Notification items are properly labeled
<div
  role="listitem"
  tabIndex={0}
  aria-label={`Notification: ${title}. ${isRead ? 'Read' : 'Unread'}. Priority: ${priority}.`}
  onKeyDown={handleKeyDown}
>
  {/* Notification content */}
</div>

// Time information includes machine-readable datetime
<time dateTime={notification.createdAt.toISOString()}>
  {formatRelativeTime(notification.createdAt)}
</time>
```

## Testing

### Running Tests

```bash
# Run all notification tests
npm test -- --testPathPattern="notification"

# Run specific test suites
npm test -- __tests__/hooks/useNotifications.test.ts
npm test -- __tests__/components/NotificationCenter.test.tsx
npm test -- __tests__/services/notification-service.test.ts
```

### Test Coverage

The test suite covers:

- **Hook Tests**: Feature flag integration, state management, API interactions
- **Component Tests**: Rendering states, user interactions, accessibility
- **Service Tests**: CRUD operations, email queue processing, user preferences

## Performance Considerations

### Optimization Strategies

1. **Pagination**: Use `limit` and `offset` parameters for large notification lists
2. **Caching**: React Query provides built-in caching for notification data
3. **Real-time Updates**: WebSocket integration for immediate notification delivery
4. **Email Queue**: Background processing prevents blocking user interactions

### Memory Management

```typescript
// The hook includes cleanup for WebSocket connections
useEffect(() => {
  if (!isEnabled || !config.realTimeUpdates) return;

  // WebSocket connection setup
  const ws = new WebSocket('/ws/notifications');
  
  return () => {
    ws.close(); // Cleanup on unmount
  };
}, [isEnabled, config.realTimeUpdates]);
```

## Monitoring and Debugging

### Debug Information

Enable verbose logging with the `VERBOSE_LOGGING` feature flag:

```typescript
if (FeatureFlags.shouldLogVerbose()) {
  console.log('Notification created:', {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
  });
}
```

### Error Handling

The system includes comprehensive error handling:

- API request failures are caught and displayed to users
- Email sending failures are logged and retried
- Invalid notification data is validated and rejected

## Customization

### Custom Notification Types

To add new notification types:

1. Update `NotificationType` in `notification-types.ts`
2. Create corresponding interface extending `BaseNotification`
3. Add to the `Notification` union type
4. Create email template in `shared/email-templates/`
5. Update user preferences default values

### Email Template Customization

Templates support Handlebars syntax with helper functions:

```html
<!-- Custom conditional rendering -->
{{#if completed}}
  <div class="success">Step completed!</div>
{{else}}
  <div class="pending">Step pending...</div>
{{/if}}

<!-- Loop through arrays -->
{{#each features}}
  <li>{{this}}</li>
{{/each}}
```

## Security Considerations

- **User Isolation**: Notifications are filtered by user ID
- **Input Validation**: All notification data is validated before processing
- **Rate Limiting**: Email sending includes rate limiting and retry logic
- **Feature Flags**: System can be disabled entirely via feature flags

## Migration Guide

For existing applications integrating this notification system:

1. Install dependencies: `@testing-library/react`, `@testing-library/jest-dom`
2. Update Jest configuration to support the test structure
3. Add notification feature flags to environment variables
4. Implement required API endpoints
5. Add email service configuration (Resend API key)
6. Update user database schema to include notification preferences

## Troubleshooting

### Common Issues

1. **Tests not running**: Ensure Jest is configured for ESM modules
2. **Email not sending**: Check Resend API key and user preferences
3. **Real-time updates not working**: Verify WebSocket connection and feature flags
4. **TypeScript errors**: Ensure all type imports use correct paths with `.js` extensions

### Debug Commands

```bash
# Check feature flags
console.log(FeatureFlags.getAllFlags());

# Test email queue processing
await NotificationService.processEmailQueue();

# Verify user preferences
const prefs = await NotificationService.getUserPreferences('user_id');
```