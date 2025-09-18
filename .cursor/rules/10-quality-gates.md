# SSELFIE Studio - Quality Gates

## 🧪 TESTING REQUIREMENTS

### Unit Tests
- **Required**: All new utilities and services must have unit tests
- **Location**: Place tests alongside code with `.test.ts` or `.spec.ts` suffix
- **Coverage**: Test happy path, error cases, and edge conditions
- **Example**: 
  ```typescript
  // server/services/image-processor.test.ts
  describe('ImageProcessor', () => {
    it('should resize image correctly', () => {
      // test implementation
    });
  });
  ```

### E2E/Integration Tests  
- **Required**: All new routes and pages must have E2E or integration tests
- **Location**: `/tests/` directory using Playwright
- **Focus**: Test complete user workflows, not individual components
- **Example**: 
  ```typescript
  // tests/new-feature.spec.ts
  test('user can complete new workflow', async ({ page }) => {
    // test implementation
  });
  ```

## 📝 DOCUMENTATION REQUIREMENTS

### Changelog Updates
- **Required**: Update `/docs/CHANGELOG.md` for all changes
- **Categories**:
  - `Added` - New features
  - `Changed` - Changes to existing functionality  
  - `Fixes` - Bug fixes
  - `Security` - Security improvements
- **Format**:
  ```markdown
  ## [Unreleased]
  ### Added
  - New Maya chat feature for onboarding guidance
  ```

### Component Documentation
- **Required**: Reusable UI components must have Storybook stories
- **Location**: `.stories.tsx` files alongside components
- **Include**: All component variants and states
- **Example**:
  ```typescript
  // client/src/components/Button.stories.tsx
  export const Primary: Story = {
    args: {
      variant: 'primary',
      children: 'Click me',
    },
  };
  ```

## 🔍 CODE QUALITY GATES

### TypeScript Compliance
- All new code must pass `pnpm typecheck`
- Use strict typing, avoid `any` types
- Define proper interfaces for all data structures

### Linting Standards
- All code must pass `pnpm lint`
- Follow existing ESLint configuration
- Fix all warnings, not just errors

### Build Validation
- All code must pass `pnpm build`
- No build errors or warnings allowed
- Ensure proper tree-shaking and optimization

### Test Validation
- All tests must pass `pnpm test`
- New tests must be added for new functionality
- Maintain or improve test coverage

## 🎨 UI QUALITY STANDARDS

### Design System Compliance
- Use existing design tokens from `/client/src/styles/`
- Follow Scandinavian Editorial Luxury aesthetic
- Maintain mobile-first responsive design

### Accessibility
- All interactive elements must be keyboard accessible
- Maintain proper color contrast ratios
- Include proper ARIA labels where needed

### Performance
- Components should render efficiently
- Avoid unnecessary re-renders
- Optimize images and assets

## 🚦 QUALITY GATE CHECKLIST

Before submitting any PR, ensure:

- [ ] **Tests Added**: Unit tests for utilities/services, E2E for routes/pages
- [ ] **Documentation Updated**: CHANGELOG.md updated with changes
- [ ] **TypeScript Clean**: `pnpm typecheck` passes
- [ ] **Linting Clean**: `pnpm lint` passes  
- [ ] **Tests Pass**: `pnpm test` passes
- [ ] **Build Success**: `pnpm build` succeeds
- [ ] **Mobile Tested**: UI works on mobile devices
- [ ] **Brand Consistent**: Matches Sandra's authentic voice and luxury aesthetic
- [ ] **User Journey Intact**: Critical user flows remain functional

## ⚡ QUICK QUALITY CHECK

Run this command to validate all gates:
```bash
scripts/agent-check.sh
```

---

**FAILURE POLICY**: If any quality gate fails, fix issues before proceeding. Maximum one autofix cycle before escalating through PR review.