import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api.js";
import { stackClientApp } from "../../../stack/client.js";

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
  const queryClient = useQueryClient();
  const [stackUser, setStackUser] = useState<any>(undefined);
  const [isStackAuthLoading, setIsStackAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function checkAuth() {
      try {
        if (!stackClientApp) {
          console.error('Stack Auth client not initialized');
          if (mounted) {
            setStackUser(null);
            setIsStackAuthLoading(false);
          }
          return;
        }

        const user = await stackClientApp.getUser();
        if (mounted) {
          setStackUser(user || null);
          setIsStackAuthLoading(false);
        }
      } catch (error) {
        console.error('Stack Auth check failed:', error);
        if (mounted) {
          setStackUser(null);
          setIsStackAuthLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Debug Stack Auth state
  console.log('🔐 useAuth Hook State:', {
    stackUser,
    stackUserId: stackUser?.id,
    stackUserState: stackUser === undefined ? 'loading' : stackUser === null ? 'no-user' : 'has-user'
  });

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
    enabled: isAuthenticated && !isStackAuthLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes (cached on backend anyway)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // FIXED: Don't refetch on every mount - use cache
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

  // ✅ REMOVED: Don't invalidate/refetch on every render - causes infinite loop
  // The query will automatically refetch when stackUser.id changes (in queryKey)

  // Determine overall loading state
  const isLoading = isStackAuthLoading || (isAuthenticated && isDbLoading);

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