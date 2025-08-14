# Authentication System Documentation

## Consolidated Authentication Structure

This directory contains all authentication-related code consolidated from scattered locations across the project.

### Directory Structure
```
lib/auth/
├── auth-utils.ts       # Authentication utility functions
├── use-auth.ts         # Main auth hook for React components
├── components/         # Auth UI components
│   ├── AuthForm.tsx   # Updated OAuth redirect form
│   ├── LoginForm.tsx  # Login form component
│   ├── ProtectedRoute.tsx # Route protection component
│   └── RegisterForm.tsx # Registration form component
├── pages/             # Auth-related pages (if found)
└── README.md          # This file
```

### Authentication Flow
- **User Auth**: Replit OAuth2 → PostgreSQL sessions (server/replitAuth.ts)
- **Agent Auth**: Internal session management (server/services/unified-session-manager.ts)

### Components Updated
- `AuthForm.tsx`: Now redirects to OAuth instead of form-based auth
- `ProtectedRoute.tsx`: Uses current auth hook with proper loading states

### Import Updates Required
Components using old auth imports need to be updated:
- Change `@/hooks/useAuth` to `@lib/auth/use-auth`
- Change `@/lib/auth-utils` to `@lib/auth/auth-utils`