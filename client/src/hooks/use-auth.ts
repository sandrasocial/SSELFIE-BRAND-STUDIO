import { useUser } from "@stackframe/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { apiFetch } from "../lib/api.js";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImageUrl?: string;
  plan?: string;
  role?: string;
  // User preferences and profile data
  gender?: string;
  profession?: string;
  brandStyle?: string;
  photoGoals?: string;
  preferredOnboardingMode?: string;
  // Training and access flags
  trainingCoachingCompleted?: boolean;
  mayaAiAccess?: boolean;
  victoriaAiAccess?: boolean;
  hasRetrainingAccess?: boolean;
  // Usage tracking
  monthlyGenerationLimit?: number;
  generationsUsedThisMonth?: number;
}

// ✅ IMPROVED: Stack Auth integration with race condition fixes
export function useAuth() {
  const stackUser = useUser();
  const queryClient = useQueryClient();
  
  // Track previous authentication state to detect login events
  const prevAuthStateRef = useRef<{ wasAuthenticated: boolean; userId?: string }>({ 
    wasAuthenticated: false 
  });
  
  // Determine authentication state first
  const isAuthenticated = !!stackUser?.id;
  const isStackAuthLoading = stackUser === undefined; // undefined = loading, null = not auth'd
  
  // 🔍 ENHANCED DEBUG: Log Stack Auth state with timing
  console.log('🔍 useAuth() execution at:', new Date().toISOString());
  console.log('🔍 Stack Auth State:', {
    stackUser: stackUser ? {
      id: stackUser.id,
      email: stackUser.primaryEmail,
      hasId: !!stackUser.id,
      displayName: stackUser.displayName
    } : stackUser,
    isAuthenticated,
    isStackAuthLoading,
    currentPath: window.location.pathname,
    cookies: document.cookie.substring(0, 200) + (document.cookie.length > 200 ? '...' : ''),
    hasStackAccessToken: document.cookie.includes('stack-access'),
    hasOAuthCookies: document.cookie.includes('stack-oauth-outer') || document.cookie.includes('stack-oauth-inner'),
    hasStackCookies: document.cookie.includes('stack-') || document.cookie.includes('auth'),
    localStorageKeys: Object.keys(localStorage).filter(k => k.includes('stack') || k.includes('auth')),
    sessionStorageKeys: Object.keys(sessionStorage).filter(k => k.includes('stack') || k.includes('auth'))
  });
  
  // Only fetch database user if Stack Auth user exists and is loaded
  const { 
    data: dbUser, 
    error: dbError,
    isLoading: isDbLoading,
    isError: isDbError 
  } = useQuery({
    queryKey: ["/api/me", stackUser?.id],
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (user not authenticated)
      if (error?.status === 401) return false;
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    enabled: isAuthenticated && !isStackAuthLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    queryFn: async () => {
      try {
        console.log('🔍 Fetching user data from /api/me...');
        const data = await apiFetch('/me');
        console.log('✅ User data fetched successfully');
        return data?.user ?? null;
      } catch (error: any) {
        console.error('❌ Failed to fetch user data:', error);
        
        // CRITICAL: If server returns 401, the Stack Auth session is invalid
        // Clear the session and force reauthentication
        if (error?.status === 401 && stackUser) {
          console.log('🔄 Server returned 401, clearing Stack Auth session for reauthentication...');
          try {
            // Get Stack Auth instance and sign out
            const { getStackApp } = await import('../stack/stack-context.js');
            const stackApp = getStackApp?.();
            if (stackApp && stackUser) {
              await stackUser.signOut();
              console.log('✅ Stack Auth session cleared, user will be redirected to sign in');
            }
          } catch (signOutError) {
            console.error('❌ Failed to clear Stack Auth session:', signOutError);
            // Fallback: clear cookies manually and reload page
            document.cookie.split(";").forEach(c => {
              const eqPos = c.indexOf("=");
              const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
              if (name.includes('stack')) {
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              }
            });
            window.location.reload();
          }
        }
        
        // For 401 errors, return null (user not authenticated)
        if (error?.status === 401) {
          return null;
        }
        throw error;
      }
    }
  });

  // 🔥 CRITICAL FIX: Force cache invalidation on authentication state changes
  useEffect(() => {
    const currentAuthState = {
      wasAuthenticated: isAuthenticated,
      userId: stackUser?.id
    };

    // Detect when user transitions from unauthenticated to authenticated (login event)
    const justLoggedIn = !prevAuthStateRef.current.wasAuthenticated && isAuthenticated;
    // Detect when user changes (different user logged in)
    const userChanged = prevAuthStateRef.current.userId && 
                       stackUser?.id && 
                       prevAuthStateRef.current.userId !== stackUser.id;

    if (justLoggedIn || userChanged) {
      console.log('✅ Stack Auth session established. Invalidating user data cache.', {
        justLoggedIn,
        userChanged,
        newUserId: stackUser?.id,
        prevUserId: prevAuthStateRef.current.userId
      });
      
      // 💡 CRITICAL FIX: Force refetch on login to ensure immediate backend sync
      // This prevents stale cache from showing empty/incorrect user data
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-model'] }); // Also invalidate user-model queries
      
      // Ensure SmartHome gets fresh data, not stale/empty cache
      queryClient.refetchQueries({ queryKey: ["/api/me", stackUser?.id] });
    }

    // Update previous state for next comparison
    prevAuthStateRef.current = currentAuthState;
  }, [isAuthenticated, stackUser?.id, queryClient]);

  // Determine overall loading state
  const isLoading = isStackAuthLoading || (isAuthenticated && isDbLoading && !dbUser);

  // Create user object with proper fallback logic
  let user: User | undefined = undefined;
  
  if (dbUser) {
    // Use database user data (complete profile)
    user = dbUser;
  } else if (stackUser && isAuthenticated && !isDbLoading) {
    // Use Stack Auth user as fallback if DB fetch failed but we have Stack Auth data
    user = {
      id: stackUser.id,
      email: stackUser.primaryEmail || '',
      firstName: stackUser.displayName?.split(' ')[0],
      lastName: stackUser.displayName?.split(' ').slice(1).join(' '),
      displayName: stackUser.displayName,
      profileImageUrl: stackUser.profileImageUrl,
      plan: 'sselfie-studio', // Default plan
      role: 'user' // Default role
    };
  }
  
  // Check subscription status
  const hasActiveSubscription = user ? (
    user.monthlyGenerationLimit === -1 || // Unlimited (admin/premium)
    (user.plan === 'sselfie-studio' && (user.monthlyGenerationLimit || 0) > 0)
  ) : false;

  // Determine error state
  const error = isDbError ? (dbError?.message || 'Failed to load user data') : null;

  console.log('🔍 Auth state:', {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    hasDbUser: !!dbUser,
    hasStackUser: !!stackUser,
    error: !!error
  });

  return {
    user,
    isLoading,
    isAuthenticated,
    hasActiveSubscription,
    requiresPayment: isAuthenticated && !hasActiveSubscription && !isLoading,
    error,
    stackUser, // Provide access to raw Stack Auth user for debugging
    
    // Additional state for debugging
    isStackAuthLoading,
    isDbLoading,
    isDbError,
  };
}