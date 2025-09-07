import { useUser } from "@stackframe/react";
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  role?: string;
}

// ✅ FIXED: Stack Auth integration with proper error handling
export function useAuth() {
  const stackUser = useUser();
  
  // Fetch our database user data if Stack Auth user exists
  const { data: dbUser, isLoading: isDbUserLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: 3,
    enabled: !!stackUser?.id, // Only fetch if Stack Auth user exists
    staleTime: 30 * 1000, // 30 seconds cache (reduced from 5 minutes for better OAuth flow)
    refetchOnWindowFocus: true, // Refetch when user returns after OAuth
    refetchOnMount: true, // Always refetch on mount to catch fresh auth state
  });

  const isLoading = isDbUserLoading;
  const isAuthenticated = !!stackUser?.id;
  
  console.log('🔍 Auth: Stack user:', !!stackUser, stackUser?.id);
  console.log('🔍 Auth: Database user:', !!dbUser);
  console.log('🔍 Auth: Loading:', isLoading);
  console.log('🔍 Auth: Authenticated:', isAuthenticated);

  // Use database user data if available, fallback to Stack Auth user
  const user: User | undefined = dbUser || (stackUser ? {
    id: stackUser.id,
    email: stackUser.primaryEmail || '',
    firstName: stackUser.displayName?.split(' ')[0],
    lastName: stackUser.displayName?.split(' ').slice(1).join(' '),
    plan: 'sselfie-studio', // Default, will be overridden by database
    role: 'user' // Default, will be overridden by database
  } : undefined);
  
  // Check if user has active subscription (single-tier €47/month model)
  const hasActiveSubscription = dbUser ? (
    dbUser.monthlyGenerationLimit === -1 || // Admin users (unlimited)
    (dbUser.plan === 'sselfie-studio' && dbUser.monthlyGenerationLimit > 0) // Paid subscribers
  ) : false;

  return {
    user,
    isLoading,
    isAuthenticated,
    hasActiveSubscription,
    requiresPayment: isAuthenticated && !hasActiveSubscription,
    error: error,
    stackUser, // Provide access to raw Stack Auth user
    refetchUser: refetch, // Allow manual refetch for OAuth flows
  };
}