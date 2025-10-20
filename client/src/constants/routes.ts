/**
 * Centralized Route Constants
 * 
 * Single source of truth for all application routes.
 * Use these constants instead of hardcoded strings throughout the app.
 */

// Main Application Routes
export const ROUTES = {
  // Core App Routes
  HOME: '/',
  APP: '/app',
  
  // Authentication & Onboarding
  SIGN_IN: '/handler/sign-in',
  SIGN_UP: '/handler/sign-up',
  
  // Training & Onboarding
  SIMPLE_TRAINING: '/simple-training',
  
  // Commerce
  SIMPLE_CHECKOUT: '/simple-checkout',
  EMBEDDED_CHECKOUT: '/embedded-checkout',
  PAYMENT_SUCCESS: '/payment-success',
  
  // Public Pages
  BUSINESS_LANDING: '/business',
  GALLERY: '/sselfie-gallery',
  AI_COMMAND_CENTER: '/ai-command-center',
  THANK_YOU: '/thank-you',
  
  // Legal
  TERMS: '/terms',
  PRIVACY: '/privacy',
  
  // Authentication Handlers
  MAGIC_LINK: '/magic-link',
  FORGOT_PASSWORD: '/forgot-password',
  PASSWORD_RESET: '/password-reset',
  
  // Error States
  NOT_FOUND: '/404'
} as const;

// Route Patterns (for dynamic routes)
export const ROUTE_PATTERNS = {
  APP_WITH_TAB: '/app/:tab*',
  HANDLER_WILDCARD: '/handler/:path*'
} as const;

// Route Groups for Vercel Configuration
export const PROTECTED_ROUTES = [
  ROUTES.APP,
  ROUTES.SIMPLE_TRAINING,
  ROUTES.AI_COMMAND_CENTER
] as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.BUSINESS_LANDING,
  ROUTES.SIMPLE_CHECKOUT,
  ROUTES.EMBEDDED_CHECKOUT,
  ROUTES.PAYMENT_SUCCESS,
  ROUTES.THANK_YOU,
  ROUTES.TERMS,
  ROUTES.PRIVACY
] as const;

export const AUTH_ROUTES = [
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.MAGIC_LINK,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.PASSWORD_RESET
] as const;

// Helper functions
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some(route => 
    path === route || path.startsWith(route + '/')
  );
};

export const isAuthRoute = (path: string): boolean => {
  return AUTH_ROUTES.some(route => 
    path === route || path.startsWith(route + '/')
  );
};

export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(route => 
    path === route || path.startsWith(route + '/')
  );
};

// Navigation utilities
export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];