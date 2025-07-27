# Feature-based Organization Structure

This directory contains feature-specific components and logic organized by domain.

## Directory Structure

```
/features
  /chat         - Chat interface components
  /builder      - Studio builder components
  /settings     - User settings and preferences
```

## Guidelines

1. Each feature directory should contain:
   - Components
   - Feature-specific hooks
   - Feature-specific utilities
   - Tests
   - Documentation

2. Shared code should be moved to:
   - /shared/ui for common UI components
   - /shared/hooks for common hooks
   - /shared/utils for common utilities

3. Feature Integration:
   - Use lazy loading for feature modules
   - Maintain clear boundaries between features
   - Document dependencies between features