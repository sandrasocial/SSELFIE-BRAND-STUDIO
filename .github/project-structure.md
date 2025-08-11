# SSELFIE Studio Project Structure

## Directory Organization

```
sselfie-studio/
├── client/
│   ├── components/
│   │   ├── auth/
│   │   ├── chat/
│   │   └── common/
│   ├── pages/
│   │   ├── dashboard/
│   │   └── profile/
│   └── hooks/
├── server/
│   ├── api/
│   ├── services/
│   └── utils/
├── shared/
│   ├── types/
│   └── schema.ts
└── styles/
    └── globals.css
```

## Component Guidelines

1. Group related components in feature directories
2. Use index.ts files for exports
3. Keep components focused and single-responsibility
4. Implement consistent prop typing
5. Follow naming conventions:
   - Components: PascalCase
   - Files: PascalCase.tsx
   - Utilities: camelCase.ts

## State Management

- Use TanStack Query for server state
- Implement custom hooks for reusable logic
- Centralize query configurations
- Handle loading and error states consistently

## Styling

- Use Tailwind classes
- Follow luxury Times New Roman typography
- Maintain consistent spacing
- Use design tokens for colors

## Best Practices

1. Write meaningful component descriptions
2. Keep files small and focused
3. Use TypeScript strictly
4. Document complex logic
5. Follow React functional patterns