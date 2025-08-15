# SSELFIE Studio Organization Plan

## Directory Structure

```
/
├── client/                 # Frontend React application
│   ├── components/        # Reusable UI components
│   │   ├── core/         # Core UI elements (buttons, inputs, etc.)
│   │   ├── layout/       # Layout components (header, footer, etc.)
│   │   └── features/     # Feature-specific components
│   ├── pages/            # Page components and routing
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions and helpers
│   └── styles/           # Global styles and Tailwind config
├── server/                # Backend Express application
│   ├── routes/           # API route handlers
│   ├── controllers/      # Business logic
│   ├── middleware/       # Express middleware
│   └── utils/            # Server utilities
└── shared/               # Shared code between client and server
    ├── types/            # TypeScript type definitions
    ├── constants/        # Shared constants
    └── validation/       # Shared validation logic

## Component Organization Standards

1. **Naming Conventions**
   - Components: PascalCase (e.g., BuildVisualStudio.tsx)
   - Utilities: camelCase (e.g., formatDate.ts)
   - Constants: UPPER_SNAKE_CASE
   - Types/Interfaces: PascalCase with 'Type' or 'Props' suffix

2. **Component Structure**
   ```tsx
   // Standard component template
   import { FC } from 'react'
   
   interface ComponentProps {
     // Props definition
   }
   
   export const Component: FC<ComponentProps> = () => {
     return (
       // JSX
     )
   }
   ```

3. **File Organization**
   - One component per file
   - Index files for directory exports
   - Colocated test files (*.test.tsx)
   - Styles in component files using Tailwind

4. **State Management**
   - TanStack Query for server state
   - React hooks for local state
   - Context for global UI state

5. **Code Quality Standards**
   - TypeScript strict mode enabled
   - ESLint configuration enforced
   - Prettier formatting
   - Unit tests required

## New Component Guidelines

1. **Feature Components**
   - Place in client/components/features/
   - Group related components in feature folders
   - Include README.md for complex features

2. **Shared Components**
   - Place reusable UI in client/components/core/
   - Document props and usage
   - Maintain backward compatibility

3. **Page Components**
   - Organize by feature in client/pages/
   - Keep pages thin, move logic to components
   - Use consistent layouts

## Documentation Requirements

1. **Component Documentation**
   - Purpose and usage examples
   - Props interface documentation
   - Key dependencies noted
   - Breaking changes tracked

2. **API Documentation**
   - OpenAPI/Swagger specs
   - Request/response examples
   - Error handling
   - Rate limits

## Development Workflow

1. **New Features**
   - Create feature branch
   - Follow component guidelines
   - Add tests and documentation
   - Submit PR with description

2. **Updates**
   - Maintain backward compatibility
   - Update documentation
   - Add migration guides if needed

## Quality Assurance

1. **Testing Requirements**
   - Unit tests for components
   - Integration tests for features
   - E2E tests for critical paths
   - Accessibility testing

2. **Performance Standards**
   - Lazy loading for routes
   - Image optimization
   - Bundle size monitoring
   - Performance budgets

## Deployment Strategy

1. **Build Process**
   - TypeScript compilation
   - Asset optimization
   - Environment configuration
   - Security checks

2. **Deployment Environments**
   - Development
   - Staging
   - Production

## Maintenance Guidelines

1. **Regular Tasks**
   - Dependency updates
   - Security patches
   - Performance monitoring
   - Documentation updates

2. **Code Health**
   - Regular refactoring
   - Technical debt tracking
   - Style guide enforcement
   - Code review process