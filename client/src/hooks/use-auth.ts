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

  // Never block UI on DB fetch; Stack user presence is enough to render app
  const isLoading = false;
  
  // Consider user authenticated as soon as Stack Auth says so (avoids loops)
  const isAuthenticated = !!stackUser?.id;
  
  // For OAuth callbacks, we can proceed with just Stack Auth user
  const hasStackAuthUser = !!stackUser?.id;
  
  // Debug logging for authentication state
  console.log('🔍 useAuth: Stack user exists:', !!stackUser?.id);
  console.log('🔍 useAuth: Stack user data:', stackUser);
  console.log('🔍 useAuth: API user exists:', !!dbUser);
  console.log('🔍 useAuth: API user data:', dbUser);
  console.log('🔍 useAuth: Is authenticated:', isAuthenticated);
  console.log('🔍 useAuth: API error:', error);
  console.log('🔍 useAuth: Cookies:', document.cookie);

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
    hasStackAuthUser, // For OAuth callbacks
    hasActiveSubscription,
    requiresPayment: isAuthenticated && !hasActiveSubscription,
    error: error?.message || null,
    stackUser, // Provide access to raw Stack Auth user
  };
}