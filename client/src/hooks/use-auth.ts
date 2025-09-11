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
  const { data: dbUser, isLoading: isDbUserLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!stackUser?.id, // Only fetch if Stack Auth user exists
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const isLoading = isDbUserLoading;
  const isAuthenticated = !!stackUser?.id;
  
  // REMOVED: Excessive auth logging causing infinite loop
  // These logs were causing re-render loops. Auth state tracking removed for production.

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
    error: null,
    stackUser, // Provide access to raw Stack Auth user
  };
}