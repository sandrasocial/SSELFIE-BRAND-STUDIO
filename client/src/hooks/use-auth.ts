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

  // 🚨 DEFENSIVE CHECK: If refresh token is 'undefined', force sign-out and reload
  try {
    // Check cookies and localStorage for bad refresh token
    const cookies = document.cookie.split(';');
    const hasBadRefreshToken = cookies.some(c => c.includes('refresh') && c.includes('undefined')) ||
      Object.keys(localStorage).some(k => k.toLowerCase().includes('refresh') && localStorage.getItem(k) === 'undefined') ||
      Object.keys(sessionStorage).some(k => k.toLowerCase().includes('refresh') && sessionStorage.getItem(k) === 'undefined');
    if (hasBadRefreshToken) {
      console.error('🚨 Detected bad refresh token ("undefined"). Forcing sign-out and reload.');
      // Attempt sign-out via Stack Auth
      import('../stack/stack-context.js').then(({ getStackApp }) => {
        const stackApp = getStackApp?.();
        if (stackApp && stackUser) {
          stackUser.signOut().finally(() => {
            // Clear cookies and reload
            cookies.forEach(c => {
              const eqPos = c.indexOf("=");
              const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
              if (name.includes('stack') || name.includes('refresh')) {
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              }
            });
            window.location.reload();
          });
        } else {
          // Fallback: clear cookies and reload
          cookies.forEach(c => {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
            if (name.includes('stack') || name.includes('refresh')) {
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }
          });
          window.location.reload();
        }
      });
    }
  } catch (e) {
    console.error('🚨 Error during refresh token defensive check:', e);
  }
  
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

  // 🔥 CRITICAL FIX: Aggressively invalidate all relevant queries on authentication state changes
  useEffect(() => {
    const currentAuthState = {
      wasAuthenticated: isAuthenticated,
      userId: stackUser?.id
    };

    // Detect when authentication state *changes*
    const authStateChanged = prevAuthStateRef.current.wasAuthenticated !== isAuthenticated ||
                             prevAuthStateRef.current.userId !== stackUser?.id;

    if (authStateChanged) {
      console.log('🔄 Auth state transition detected. Invalidating all core queries to prevent stale data/loading issues.');
      // CRITICAL FIX: Aggressively invalidate core queries
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-model"] }); 
      queryClient.invalidateQueries({ queryKey: ["/api/maya-chats"] }); 
      queryClient.invalidateQueries({ queryKey: ["/api/maya-images"] }); 
      // Add other top-level queries that could hold stale data upon login/logout here.

      // Force refetch the user data immediately if authenticated to get the new profile
      if (isAuthenticated && stackUser?.id) {
          queryClient.refetchQueries({ queryKey: ["/api/me", stackUser.id], exact: true });
      }
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