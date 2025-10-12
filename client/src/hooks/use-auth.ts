import { useUser } from "@stackframe/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

// Simplified Stack Auth integration
export function useAuth() {
  const stackUser = useUser();
  const queryClient = useQueryClient();

  // Determine authentication state
  const isAuthenticated = !!stackUser?.id;
  const isStackAuthLoading = stackUser === undefined;

  // Only fetch database user if Stack Auth user exists
  const {
    data: dbUser,
    error: dbError,
    isLoading: isDbLoading,
    isError: isDbError
  } = useQuery({
    queryKey: ["/api/me", stackUser?.id],
    enabled: isAuthenticated && !isStackAuthLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    queryFn: async () => {
      try {
        const data = await apiFetch('/me');
        return data?.user ?? null;
      } catch (error: any) {
        console.error('Failed to fetch user data:', error);

        // If server returns 401, the session is invalid
        if (error?.status === 401 && stackUser) {
          try {
            await stackUser.signOut();
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

  // Invalidate queries on authentication state changes
  useEffect(() => {
    if (isAuthenticated && stackUser?.id) {
      // Force refetch user data when authenticated
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.refetchQueries({ queryKey: ["/api/me", stackUser.id], exact: true });
    }
  }, [isAuthenticated, stackUser?.id, queryClient]);

  // Determine overall loading state
  const isLoading = isStackAuthLoading || (isAuthenticated && isDbLoading && !dbUser);

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