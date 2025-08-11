# SSELFIE Studio Component Guidelines

## Component Structure

### Directory Organization
```
components/
├── feature/
│   ├── FeatureComponent.tsx
│   ├── FeatureComponent.test.tsx
│   ├── types.ts
│   └── index.ts
```

### Component Template
```tsx
import { FC } from 'react'
import { ComponentProps } from './types'

export const FeatureComponent: FC<ComponentProps> = ({ prop1, prop2 }) => {
  return (
    <div className="font-serif">
      {/* Component content */}
    </div>
  )
}
```

## Component Checklist

### Required Elements
- [ ] TypeScript Props Interface
- [ ] Proper Export Pattern
- [ ] Error Handling
- [ ] Loading States
- [ ] Accessibility Support

### Code Quality
- [ ] Single Responsibility
- [ ] Clear Props API
- [ ] Consistent Naming
- [ ] Documented Complex Logic
- [ ] Test Coverage

### Performance
- [ ] Memoization (if needed)
- [ ] Optimized Re-renders
- [ ] Lazy Loading
- [ ] Bundle Size Consideration

## State Management Guidelines

### TanStack Query Implementation
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['feature'],
  queryFn: fetchFeatureData
})
```

### Loading States
```tsx
{isLoading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorDisplay message={error.message} />
) : (
  <FeatureContent data={data} />
)}
```

## Styling Standards

### Tailwind Classes
- Use utility classes consistently
- Group related styles
- Follow mobile-first approach
- Maintain Times New Roman typography

### Example
```tsx
<div className="
  font-serif 
  text-lg 
  leading-relaxed
  p-4
  md:p-6
  bg-white
  shadow-md
  rounded-lg
">
  {/* Content */}
</div>
```

## Testing Requirements

- Unit tests for logic
- Integration tests for features
- Accessibility tests
- Performance monitoring
- Error boundary testing