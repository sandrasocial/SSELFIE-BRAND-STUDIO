import { expect, test as base } from '@playwright/test';
import type { Page, ConsoleMessage as PlaywrightConsoleMessage, TestType } from '@playwright/test';

// Error tracking interfaces
interface ConsoleMessage {
  type: string;
  text: string;
  location?: string;
  timestamp: number;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  timestamp: number;
}

interface ErrorTracker {
  errors: ErrorEvent[];
  consoleMessages: ConsoleMessage[];
}

// Extend the Page type for our error tracking
interface PageWithErrorTracking extends Page {
  errorTracker: ErrorTracker;
}

// Helper to track errors
async function setupErrorTracking(page: Page): Promise<{ errors: ErrorEvent[], consoleMessages: ConsoleMessage[] }> {
  const errors: ErrorEvent[] = [];
  const consoleMessages: ConsoleMessage[] = [];

  // Track console messages
  page.on('console', (msg: PlaywrightConsoleMessage) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()?.url,
      timestamp: Date.now()
    });
  });

  // Track page errors
  page.on('pageerror', (error: Error) => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  });

  // Add detailed browser-side error monitoring
  await page.addInitScript(() => {
    window.addEventListener('error', (event) => {
      if (event instanceof ErrorEvent) {
        console.error('🔥 Uncaught Error:', {
          message: event.message,
          stack: event.error?.stack,
          source: event.filename,
          line: event.lineno,
          col: event.colno
        });
      } else {
        console.error('🔥 Uncaught Generic Error:', event);
      }
    });
    
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      console.error('🔥 Unhandled Promise Rejection:', {
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack
      });
    });

    // Enhanced React error monitoring
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Log to browser console
      originalError.apply(console, args);
      // Special handling for React/Stack Auth errors
      const message = String(args[0]);
      if (
        message.includes('React') || 
        message.includes('useStackApp') ||
        message.includes('StackProvider') ||
        message.includes('Invalid hook call')
      ) {
        console.error('🔥 REACT_ERROR:', {
          message,
          args: args.slice(1)
        });
      }
    };
  });

  return { errors, consoleMessages };
}

// Create a test fixture with error tracking
const test = base.extend<{ trackedPage: PageWithErrorTracking }>({
  trackedPage: async ({ page }, use: (r: PageWithErrorTracking) => Promise<void>) => {
    const { errors, consoleMessages } = await setupErrorTracking(page);
    const trackedPage = page as PageWithErrorTracking;
    trackedPage.errorTracker = { errors, consoleMessages };
    await use(trackedPage);
  },
});

test.describe('Stack Auth Provider', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    const { errors, consoleMessages } = await setupErrorTracking(page);
    const trackedPage = page as PageWithErrorTracking;
    trackedPage.errorTracker = { errors, consoleMessages };
  });

  test('should not show Stack Auth provider error on initial load', async ({ page }: { page: Page }) => {
    const trackedPage = page as PageWithErrorTracking;

    // Enable error logging
    page.on('pageerror', (error: Error) => {
      console.error('🔥 Page Error:', error);
    });

    page.on('console', (msg: PlaywrightConsoleMessage) => {
      if (msg.type() === 'error') {
        console.error('🔥 Console Error:', msg.text());
      }
    });

    // Load the app (respect baseURL)
    await page.goto('/');

    // Wait for initial load
    await page.waitForLoadState('networkidle');

    // Check for Stack Auth provider error in console
    const stackAuthErrors = trackedPage.errorTracker.consoleMessages.filter(
      msg => msg.type === 'error' && msg.text.includes('useStackApp must be used within a StackProvider')
    );

    // Navigate to a protected route that uses auth
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Verify no Stack Auth provider errors
    expect(stackAuthErrors).toHaveLength(0);
  });

  test('should maintain Stack Auth provider through navigation', async ({ page }: { page: Page }) => {
    const trackedPage = page as PageWithErrorTracking;

    // Start at home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate through various routes that use auth
    const routes = [
      '/sign-in',
      '/app',
      '/maya',
      '/sselfie-gallery'
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      // Give time for any potential errors to surface
      await page.waitForTimeout(1000);
    }

    // Verify no Stack Auth provider errors occurred
    const stackAuthErrors = trackedPage.errorTracker.errors.filter(
      error => error.message.includes('useStackApp must be used within a StackProvider')
    );
    expect(stackAuthErrors).toHaveLength(0);
  });

  test('should preserve Stack Auth provider after page reload', async ({ page }: { page: Page }) => {
    const trackedPage = page as PageWithErrorTracking;

    // Load protected route
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Give time for any potential errors to surface
    await page.waitForTimeout(1000);

    // Verify no Stack Auth provider errors
    const stackAuthErrors = trackedPage.errorTracker.errors.filter(
      error => error.message.includes('useStackApp must be used within a StackProvider')
    );
    expect(stackAuthErrors).toHaveLength(0);
  });
});