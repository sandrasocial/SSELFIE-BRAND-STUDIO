import { useUser } from "@stackframe/stack";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Use Stack Auth's React hook with error handling
  let stackUser, stackLoading;
  try {
    const stackAuth = useUser();
    stackUser = stackAuth.user;
    stackLoading = stackAuth.isLoading;
  } catch (error) {
    console.log('⚠️ Stack Auth hook not available, falling back to traditional auth');
    stackUser = null;
    stackLoading = false;
  }
  
  // Fetch complete user data from our backend when Stack Auth user is available
  const { data: dbUser, isLoading: dbLoading, error, isStale } = useQuery({
    queryKey: ["/api/auth/user", stackUser?.id],
    enabled: !!stackUser?.id, // Only fetch when we have a Stack Auth user
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    throwOnError: false,
    queryFn: async () => {
      console.log('🔍 Auth check: Fetching DB user for Stack user:', stackUser?.primaryEmail);
      
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('🔍 Auth check: Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('🔍 Auth check: User not authenticated (401)');
            return null;
          }
          throw new Error(`Auth failed: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('✅ Auth check: User authenticated:', userData.email);
        return userData;
      } catch (error) {
        console.log('❌ Auth check: Error:', (error as Error).message);
        return null;
      }
    }
  });

  // Use Stack Auth user or database user
  const user = dbUser || (stackUser ? {
    id: stackUser.id,
    email: stackUser.primaryEmail,
    firstName: stackUser.displayName?.split(' ')[0] || '',
    lastName: stackUser.displayName?.split(' ').slice(1).join(' ') || '',
    displayName: stackUser.displayName,
    profileImageUrl: stackUser.profileImageUrl
  } : null);

  // SINGLE ADMIN CHECK: Sandra's email only
  const isAdmin = user?.email === 'sandra@sselfie.ai';
  
  // CRITICAL: Determine authentication state
  const isAuthenticated = !!stackUser && !!user;
  
  // Combine loading states
  const actuallyLoading = stackLoading || (stackUser && dbLoading);

  console.log('🔍 Stack Auth useAuth state:', { 
    hasStackUser: !!stackUser, 
    hasDbUser: !!dbUser, 
    isAuthenticated, 
    actuallyLoading 
  });

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated,
    isAdmin,
    error,
    isStale,
    // Stack Auth methods
    stackUser,
    signIn: () => window.location.href = '/api/login',
    signOut: () => window.location.href = '/api/logout'
  };
}