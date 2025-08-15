# Project Search Paths Configuration

This document outlines the recommended search paths for navigating and searching through the project codebase.

## Primary Search Directories

When searching for code, focus on these key directories:

- `/api` - Backend API endpoints and logic
- `/app` - Main application code
- `/components` - Reusable UI components
- `/pages` - Page components and routing
- `/utils` - Utility functions and helpers
- `/public` - Static assets and files
- `/styles` - CSS and styling files
- `/lib` - Library code and shared functionality
- `/services` - Service layer implementations
- `/config` - Configuration files

## Important Configuration Files

Always check these files for system-wide settings:

- `vite.config.ts/js` - Vite configuration
- `vercel.json` - Vercel deployment settings
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration

## Search Tips

1. When looking for UI components, start in `/components` and `/pages`
2. For backend logic, focus on `/api` and `/services`
3. For shared utilities, check `/utils` and `/lib`
4. Configuration changes should be in `/config` or root config files

## Excluded Paths

These paths are typically excluded from searches:

- `node_modules` - External dependencies
- `.next` - Next.js build output
- `.git` - Git repository data
- `dist` - Build output
- `build` - Build artifacts
- `coverage` - Test coverage reports

Use these paths to efficiently navigate and maintain the codebase.