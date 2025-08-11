# SSELFIE Studio Architecture Organization

## Directory Structure

```
/
├── client/                    # Frontend React application
│   ├── components/            # Reusable UI components
│   │   ├── shared/           # Common components used across features
│   │   │   ├── layout/       # Layout components (Header, Footer, etc.)
│   │   │   ├── ui/           # Basic UI elements (Button, Input, etc.)
│   │   │   └── forms/        # Form-related components
│   │   ├── launch/           # Launch wizard components
│   │   │   ├── steps/        # Individual wizard step components
│   │   │   └── navigation/   # Wizard navigation components
│   │   ├── brand/            # Branding related components
│   │   │   ├── builder/      # Brand building components
│   │   │   └── preview/      # Brand preview components
│   │   └── gallery/          # Gallery and media components
│   │       ├── grid/         # Gallery grid components
│   │       └── viewer/       # Media viewer components
│   ├── pages/                # Route-level page components
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # User dashboard pages
│   │   └── public/          # Public facing pages
│   ├── hooks/               # Custom React hooks
│   │   ├── auth/           # Authentication hooks
│   │   ├── data/           # Data fetching hooks
│   │   └── ui/             # UI utility hooks
│   └── utils/              # Frontend utilities
│       ├── api/            # API interaction utilities
│       ├── formatting/     # Data formatting utilities
│       └── validation/     # Form validation utilities
│
├── server/                   # Backend Express application
│   ├── routes/               # API route handlers
│   │   ├── auth/            # Authentication routes
│   │   ├── brand/           # Brand management routes
│   │   └── media/           # Media handling routes
│   ├── services/             # Business logic services
│   │   ├── auth/            # Authentication services
│   │   ├── brand/           # Brand generation services
│   │   └── storage/         # File storage services
│   ├── middleware/           # Express middleware
│   │   ├── auth/            # Authentication middleware
│   │   ├── validation/      # Request validation
│   │   └── error/           # Error handling
│   └── utils/               # Backend utilities
│
└── shared/                   # Shared code between client and server
    ├── types/                # TypeScript type definitions
    │   ├── auth/            # Authentication types
    │   ├── brand/           # Brand related types
    │   └── api/             # API request/response types
    ├── constants/            # Shared constants
    │   ├── brand/           # Brand related constants
    │   └── validation/      # Validation constants
    └── utils/                # Common utilities
        ├── formatting/       # Shared formatting utilities
        └── validation/       # Shared validation logic
```

## Component Organization Guidelines

1. **Atomic Design Structure**
   - Atoms: Basic UI components (buttons, inputs)
   - Molecules: Combined components (form groups, cards)
   - Organisms: Complex components (navigation, galleries)
   - Templates: Page layouts
   - Pages: Route components

2. **Component Naming**
   - Use PascalCase for component names
   - Suffix with component type (Button, Page, Layout)
   - Group related components in feature folders

3. **State Management**
   - Use TanStack Query for server state
   - React Context for global UI state
   - Component local state for UI interactions

4. **Code Organization**
   - One component per file
   - Co-locate tests with components
   - Shared types in separate files
   - Utils grouped by functionality

5. **File Structure**
   - index.ts for public exports
   - types.ts for component types
   - styles.ts for component styles
   - utils.ts for component utilities

## Development Guidelines

1. **Component Development**
   - Start with shared components
   - Build feature-specific components
   - Create page layouts
   - Implement full pages

2. **Testing Structure**
   - Unit tests for utilities
   - Component tests with React Testing Library
   - Integration tests for features
   - E2E tests for critical flows

3. **Documentation**
   - Component documentation
   - API documentation
   - Development guidelines
   - Setup instructions utility functions

```

## Component Organization Standards

### Component File Structure
- One component per file
- Use `.tsx` extension for React components
- Include component props interface in same file
- Co-locate component-specific hooks and utilities

### Naming Conventions
- Components: PascalCase (e.g., `LaunchWizard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Test files: Same name as source with `.test.tsx` suffix

### Component Architecture
- Functional components with TypeScript
- Props interface with proper typing
- Error boundaries for feature isolation
- Loading states and error handling
- Responsive design with Tailwind

### State Management
- TanStack Query for server state
- React hooks for local state
- Context for global state
- Proper loading/error indicators

## File Location Guidelines

### New Components
1. Determine component scope:
   - Shared/reusable → /components/shared
   - Feature-specific → /components/[feature]
   - Page component → /pages

2. Supporting files:
   - Component styles → Same directory as component
   - Tests → Same directory as component
   - Types → /shared/types if shared, else with component

### Development Workflow
1. Create component in appropriate directory
2. Add TypeScript interfaces
3. Implement component logic
4. Add error handling
5. Add tests
6. Document usage

## Code Organization Best Practices

### Component Structure
```typescript
// Import order
import React from 'react'
import type { FC } from 'react'
import { useQuery } from '@tanstack/react-query'

// Local imports
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/shared/Button'

// Props interface
interface ComponentProps {
  // ...props
}

// Component implementation
export const Component: FC<ComponentProps> = () => {
  // Implementation
}
```

### File Headers
```typescript
/**
 * @component ComponentName
 * @description Brief component description
 * 
 * @example
 * <ComponentName prop="value" />
 */
```

## Integration Standards

### API Integration
- Use TanStack Query for data fetching
- Handle loading and error states
- Type API responses
- Implement proper error boundaries

### State Management
- Prefer local state when possible
- Use context for shared state
- Document state dependencies

### Performance
- Implement proper memoization
- Lazy load route components
- Optimize re-renders
- Monitor bundle size

## Maintenance Guidelines

### Code Review Checklist
- [ ] Follows file organization
- [ ] Proper TypeScript usage
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Test coverage
- [ ] Documentation

### Documentation Requirements
- Component purpose
- Props documentation
- Usage examples
- Integration notes
- Performance considerations

### Regular Maintenance
- Review and update documentation
- Clean up unused components
- Optimize bundle size
- Update dependencies
- Review error logs