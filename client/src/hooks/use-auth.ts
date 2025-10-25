/* eslint-disable no-console */
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@stackframe/react";
import { useMemo } from "react";
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

// Simplified Stack Auth integration using native useUser hook
export function useAuth(options?: { force?: boolean; silent?: boolean }) {
  // Use Stack Auth's native useUser hook - no timeout issues
  const stackUser = useUser();
  
  // 🔧 FIX: Only debug on first load or when explicitly requested (not silent)
  // This prevents infinite console logging that was causing the loop
  const shouldDebug = !options?.silent && options?.force;
  if (shouldDebug) {
    console.log('🔐 useAuth Hook State:', {
      stackUser,
      stackUserId: stackUser?.id,
      stackUserState: stackUser === undefined ? 'loading' : stackUser === null ? 'no-user' : 'has-user'
    });
  }

  // Determine authentication state
  const isAuthenticated = !!stackUser?.id;

  // Only fetch database user if Stack Auth user exists
  const {
    data: dbUser,
    error: dbError,
    isLoading: isDbLoading,
    isError: isDbError
  } = useQuery({
    queryKey: ["/api/me", stackUser?.id],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes (cached on backend anyway)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on every mount - use cache
    retry: 1, // Only retry once on failure
    queryFn: async () => {
      try {
        const data = await apiFetch('/me');
        // Handle both response formats: { user } and { data: { user } }
        const user = data?.data?.user ?? data?.user ?? null;
        console.log('✅ User data fetched:', user?.id ? user.id.substring(0, 8) + '...' : 'null');
        return user;
      } catch (error: any) {
        console.error('❌ Failed to fetch user data:', error);

        // If server returns 401, the session is invalid
        if (error?.status === 401 && stackUser) {
          try {
            if (stackUser.signOut) {
              await stackUser.signOut();
            }
          } catch (signOutError) {
            console.error('Failed to clear Stack Auth session:', signOutError);
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

  // Determine overall loading state - Stack Auth manages its own loading
  const isLoading = stackUser === undefined || (isAuthenticated && isDbLoading);

  // ✅ FIXED: Memoize user object to prevent recreating on every render
  // 🔧 CRITICAL FIX: Always use database user data when available to maintain consistency
  const user = useMemo(() => {
    console.log('🔐 useAuth: Computing user object', {
      hasDbUser: !!dbUser,
      hasStackUser: !!stackUser,
      isAuthenticated,
      dbUserId: dbUser?.id?.substring(0, 8) + '...',
      stackUserId: stackUser?.id?.substring(0, 8) + '...'
    });
    
    if (dbUser) {
      // Always prefer database user data - this ensures consistent user.id throughout app
      const userObj = {
        ...dbUser,
        // Ensure we maintain the Stack Auth ID for API calls while using database user ID for app logic
        stackAuthId: stackUser?.id,
      };
      console.log('🔐 useAuth: Returning dbUser', { id: userObj.id?.substring(0, 8) + '...', email: userObj.email });
      return userObj;
    } else if (stackUser && isAuthenticated) {
      // Only use Stack Auth as fallback when database isn't available
      const userObj = {
        id: stackUser.id,
        stackAuthId: stackUser.id, // Keep Stack Auth ID for API consistency
        email: stackUser.primaryEmail || '',
        firstName: stackUser.displayName?.split(' ')[0],
        lastName: stackUser.displayName?.split(' ').slice(1).join(' '),
        displayName: stackUser.displayName || undefined,
        profileImageUrl: stackUser.profileImageUrl || undefined,
        plan: 'sselfie-studio',
        role: 'user'
      };
      console.log('🔐 useAuth: Returning stackUser fallback', { id: userObj.id?.substring(0, 8) + '...', email: userObj.email });
      return userObj;
    }
    console.log('🔐 useAuth: Returning undefined (no user)');
    return undefined;
  }, [dbUser, stackUser, isAuthenticated]);

  // Check subscription status
  const hasActiveSubscription = user ? (
    user.monthlyGenerationLimit === -1 ||
    (user.plan === 'sselfie-studio' && (user.monthlyGenerationLimit || 0) > 0)
  ) : false;

  // Determine error state
  const error = isDbError ? (dbError?.message || 'Failed to load user data') : null;

  return {
    user,
    isLoading,
    isAuthenticated,
    hasActiveSubscription,
    requiresPayment: isAuthenticated && !hasActiveSubscription && !isLoading,
    error,
    stackUser,
  };
}