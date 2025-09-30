import { useUser } from "@stackframe/react";
import { useQuery } from "@tanstack/react-query";
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
  
  // Determine authentication state first
  const isAuthenticated = !!stackUser?.id;
  const isStackAuthLoading = stackUser === undefined; // undefined = loading, null = not auth'd
  
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
        // For 401 errors, don't treat as error - user is just not authenticated
        if (error?.status === 401) {
          return null;
        }
        throw error;
      }
    }
  });

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
    hasStackAuthUser: !!stackUser, // For OAuth callback handling
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