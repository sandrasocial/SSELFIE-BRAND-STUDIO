import { useQuery } from "@tanstack/react-query";
import { useUser } from "@stackframe/react";
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
  
  // Debug Stack Auth state (silenceable)
  if (!options?.silent) {
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
        return data?.user ?? null;
      } catch (error: any) {
        console.error('Failed to fetch user data:', error);

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

  // Create user object
  let user: User | undefined = undefined;

  if (dbUser) {
    user = dbUser;
  } else if (stackUser && isAuthenticated) {
    // Fallback to Stack Auth data if DB fetch failed but we have Stack Auth data
    user = {
      id: stackUser.id,
      email: stackUser.primaryEmail || '',
      firstName: stackUser.displayName?.split(' ')[0],
      lastName: stackUser.displayName?.split(' ').slice(1).join(' '),
      displayName: stackUser.displayName || undefined,
      profileImageUrl: stackUser.profileImageUrl || undefined,
      plan: 'sselfie-studio',
      role: 'user'
    };
  }

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