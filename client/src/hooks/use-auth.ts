import { useUser } from "@stackframe/react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

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

// ✅ FIXED: Stack Auth integration with strict database requirements
export function useAuth() {
  const stackUser = useUser();
  
  // Fetch our database user data if Stack Auth user exists
  const { data: dbUserResponse, error, isLoading: dbLoading } = useQuery({
    queryKey: ["/api/me"],
    retry: 1,
    retryDelay: 750,
    enabled: !!stackUser?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const data = await apiFetch('/me');
      return data; // Return full response including error details
    }
  });

  // Extract user data from response
  const dbUser = dbUserResponse?.user;
  
  // Loading state: waiting for Stack Auth or database
  const isLoading = !stackUser || (!!stackUser?.id && dbLoading);
  
  // Consider user authenticated only if Stack Auth AND database data is available
  const isAuthenticated = !!stackUser?.id && !!dbUser;
  
  // For OAuth callbacks, we can proceed with just Stack Auth user
  const hasStackAuthUser = !!stackUser?.id;
  
  // Check for service unavailable errors (database/model issues)
  const hasServiceError = error && (
    error.code === 'SERVICE_UNAVAILABLE' ||
    error.code === 'MODEL_DATA_UNAVAILABLE' ||
    error.code === 'MODEL_NOT_READY' ||
    error.code === 'TIMEOUT' ||
    error.code === 'COULD_NOT_LOAD_CREATIVE_STUDIO'
  );

  // Use database user data only - no fallback to Stack Auth data
  const user: User | undefined = dbUser;
  
  // Check if user has active subscription (single-tier €47/month model)
  const hasActiveSubscription = dbUser ? (
    dbUser.monthlyGenerationLimit === -1 || // Admin users (unlimited)
    (dbUser.plan === 'sselfie-studio' && dbUser.monthlyGenerationLimit > 0) // Paid subscribers
  ) : false;

  return {
    user,
    isLoading,
    isAuthenticated,
    hasStackAuthUser, // For OAuth callbacks
    hasActiveSubscription,
    requiresPayment: isAuthenticated && !hasActiveSubscription,
    error: error?.message || null,
    hasServiceError, // Indicates database/model unavailable
    stackUser, // Provide access to raw Stack Auth user
  };
}