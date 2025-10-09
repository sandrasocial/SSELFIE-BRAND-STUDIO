/**
 * Navigation Utilities
 * 
 * Standardized navigation functions to ensure consistent routing behavior
 * across the entire application.
 */

import { useLocation } from 'wouter';
import { ROUTES, type RouteValue } from '../constants/routes.js';

/**
 * Custom hook for standardized navigation
 * Replaces direct window.location usage with consistent wouter navigation
 */
export function useNavigation() {
  const [, setLocation] = useLocation();

  const navigate = (route: RouteValue | string, replace = false) => {
    if (replace) {
      // For replace behavior, we still need window.location.replace
      // since wouter doesn't have built-in replace functionality
      window.location.replace(route);
    } else {
      setLocation(route);
    }
  };

  const goHome = () => navigate(ROUTES.HOME);
  const goToApp = () => navigate(ROUTES.APP);
  const goToTraining = () => navigate(ROUTES.SIMPLE_TRAINING);
  const goToSignIn = () => navigate(ROUTES.SIGN_IN);
  const goToSignUp = () => navigate(ROUTES.SIGN_UP);
  const goToBusiness = () => navigate(ROUTES.BUSINESS_LANDING);
  const goToCheckout = () => navigate(ROUTES.SIMPLE_CHECKOUT);

  return {
    navigate,
    goHome,
    goToApp,
    goToTraining,
    goToSignIn,
    goToSignUp,
    goToBusiness,
    goToCheckout,
    // Convenience methods
    replace: (route: RouteValue | string) => navigate(route, true),
    reload: () => window.location.reload()
  };
}

/**
 * Utility function for external navigation (outside React components)
 * Use sparingly - prefer useNavigation hook in components
 */
export const externalNavigate = {
  to: (route: RouteValue | string) => {
    window.location.href = route;
  },
  replace: (route: RouteValue | string) => {
    window.location.replace(route);
  },
  reload: () => {
    window.location.reload();
  }
};

/**
 * Route validation utilities
 */
export const validateRoute = (route: string): boolean => {
  const allRoutes = Object.values(ROUTES);
  return allRoutes.includes(route as RouteValue);
};

/**
 * Get current route information
 */
export const getCurrentRoute = (): string => {
  if (typeof window === 'undefined') return ROUTES.HOME;
  return window.location.pathname;
};

/**
 * Check if current route matches a specific route
 */
export const isCurrentRoute = (route: RouteValue): boolean => {
  return getCurrentRoute() === route;
};

/**
 * Check if current path starts with a route (for dynamic routes like /app/tab)
 */
export const isCurrentRoutePrefix = (routePrefix: RouteValue): boolean => {
  return getCurrentRoute().startsWith(routePrefix);
};