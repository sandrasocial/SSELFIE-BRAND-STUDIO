import { test as base, expect, Page } from '@playwright/test';

interface ConsoleMessage {
  type: string;
  text: string;
  location?: string;
}

interface PageError {
  message: string;
  stack?: string;
}

interface AuthPage extends Page {
  getStackAuthErrors: () => PageError[];
  getReactErrors: () => ConsoleMessage[];
}

// Create a test fixture that tracks auth-related errors
const test = base.extend<{ authPage: AuthPage }>({
  authPage: async ({ page }, use) => {
    const errors: PageError[] = [];
    const messages: ConsoleMessage[] = [];

    // Track console messages
    page.on('console', msg => {
      messages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()?.url
      });

      // Log errors to console for debugging
      if (msg.type() === 'error') {
        console.log('🔥 Console Error:', msg.text());
      }
    });

    // Track page errors
    page.on('pageerror', error => {
      errors.push({
        message: error.message,
        stack: error.stack
      });
      console.log('🔥 Page Error:', error.message);
    });

    // Add React error tracking
    await page.addInitScript(() => {
      const originalError = console.error;
      console.error = (...args) => {
        originalError.apply(console, args);
        if (typeof args[0] === 'string' && (
          args[0].includes('React') || 
          args[0].includes('useStackApp') ||
          args[0].includes('StackProvider')
        )) {
          console.error('🔥 REACT_ERROR:', ...args);
        }
      };
    });

    // Extend page with error checking helpers
    const extendedPage = Object.assign(page, {
      getStackAuthErrors: () => errors.filter(e => 
        e.message.includes('useStackApp must be used within a StackProvider')
      ),
      getReactErrors: () => messages.filter(m => 
        m.type === 'error' && (
          m.text.includes('React') || 
          m.text.includes('useStackApp') ||
          m.text.includes('StackProvider')
        )
      )
    });

    await use(extendedPage);
  }
});

test.describe('Stack Auth Provider', () => {
  test('should not show Stack Auth provider error on initial load', async ({ authPage }) => {
    console.log('🔍 Testing: Initial load Stack Auth provider check');
    
    // Listen for all console messages and errors
    authPage.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log('🔥 Browser Error:', text);
      } else if (text.includes('Stack') || text.includes('Auth')) {
        console.log(`🔐 [${type}] Auth Log:`, text);
      } else {
        console.log(`📝 [${type}]`, text);
      }
    });

    // Track page errors
    authPage.on('pageerror', error => {
      console.log('💥 Page Error:', error.message);
    });

    // Listen for network requests
    authPage.on('request', request => {
      const url = request.url();
      if (url.includes('stack') || url.includes('auth')) {
        console.log('🌐 Auth Request:', request.method(), url);
      }
    });

    // Listen for network responses
    authPage.on('response', response => {
      const url = response.url();
      if (url.includes('stack') || url.includes('auth')) {
        console.log('📡 Auth Response:', response.status(), url);
      }
    });

    // Load the landing page first
    console.log('📍 Loading landing page...');
    await authPage.goto('http://localhost:5173/business');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(2000);

    // Check initial Stack Auth state
    const initialAuthState = await authPage.evaluate(() => {
      const stackElements = document.querySelectorAll('[data-stack-auth]');
      return {
        stackElements: Array.from(stackElements).map(el => ({
          tagName: el.tagName,
          id: el.id,
          className: el.className
        })),
        stackClientApp: (window as any).stackClientApp,
        hasStackProvider: (window as any).__STACK_AUTH_PROVIDER__ !== undefined
      };
    });
    console.log('🔍 Initial Stack Auth State:', initialAuthState);

    // Attempt to sign in (this should redirect to Stack Auth)
    console.log('� Attempting sign in...');
    await authPage.goto('http://localhost:5173/handler/sign-in');
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(2000);
    
    // Check for errors
    const stackAuthErrors = authPage.getStackAuthErrors();
    const reactErrors = authPage.getReactErrors();

    console.log('📊 Final Error Check:', {
      stackAuthErrorCount: stackAuthErrors.length,
      reactErrorCount: reactErrors.length,
      stackAuthErrorDetails: stackAuthErrors,
      reactErrorDetails: reactErrors
    });

    expect(stackAuthErrors, 'Stack Auth provider errors found').toHaveLength(0);
    expect(reactErrors, 'React errors found').toHaveLength(0);
  });

  test('should maintain Stack Auth provider through navigation', async ({ authPage }) => {
    console.log('🔍 Testing: Navigation Stack Auth provider check');
    
    // Initial load
    await authPage.goto('http://localhost:5173');
    await authPage.waitForLoadState('networkidle');

    // Test navigation paths
    const routes = ['/sign-in', '/app', '/maya', '/sselfie-gallery'];
    
    for (const route of routes) {
      console.log(`📍 Testing route: ${route}`);
      await authPage.goto(`http://localhost:5173${route}`);
      await authPage.waitForLoadState('networkidle');
      await authPage.waitForTimeout(1000);

      const stackAuthErrors = authPage.getStackAuthErrors();
      const reactErrors = authPage.getReactErrors();

      console.log(`📊 Route ${route} Error Check:`, {
        stackAuthErrors: stackAuthErrors.length,
        reactErrors: reactErrors.length
      });

      expect(stackAuthErrors, `Stack Auth errors found on ${route}`).toHaveLength(0);
      expect(reactErrors, `React errors found on ${route}`).toHaveLength(0);
    }
  });

  test('should preserve Stack Auth provider after page reload', async ({ authPage }) => {
    console.log('🔍 Testing: Reload Stack Auth provider check');
    
    // Load protected route
    await authPage.goto('http://localhost:5173/app');
    await authPage.waitForLoadState('networkidle');

    console.log('🔄 Reloading page...');
    // Reload and wait
    await authPage.reload();
    await authPage.waitForLoadState('networkidle');
    await authPage.waitForTimeout(1000);

    // Check for errors
    const stackAuthErrors = authPage.getStackAuthErrors();
    const reactErrors = authPage.getReactErrors();

    console.log('📊 Post-reload Error Check:', {
      stackAuthErrors: stackAuthErrors.length,
      reactErrors: reactErrors.length
    });

    expect(stackAuthErrors, 'Stack Auth errors found after reload').toHaveLength(0);
    expect(reactErrors, 'React errors found after reload').toHaveLength(0);
  });
});