import { useQuery } from "@tanstack/react-query";
import { useUser, useStackApp } from "@stackframe/stack";

export function useAuth() {
  console.log('🔍 Auth: Using Stack Auth client components');
  
  // Stack Auth client-side user
  const stackUser = useUser();
  const stackApp = useStackApp();
  
  // Check if Stack Auth user is available
  const hasStackUser = !!stackUser && !stackUser.isLoggedOut;
  
  // Server-side authentication check (fallback)
  const { data: dbUser, isLoading: dbLoading, error, isStale } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    throwOnError: false,
    queryFn: async () => {
      console.log('🔍 Auth check: Checking server-side Stack Auth session');
      
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

  // Determine authentication state - prefer Stack Auth client
  const isAuthenticated = hasStackUser || !!dbUser;
  const isLoading = dbLoading || stackUser === undefined;
  const user = stackUser || dbUser;
  
  // SINGLE ADMIN CHECK: Sandra's email only  
  const isAdmin = user?.primaryEmail === 'sandra@sselfie.ai' || dbUser?.email === 'sandra@sselfie.ai';
  
  console.log('🔍 Auth State (Stack Auth Client + Server):', {
    hasStackUser,
    hasDbUser: !!dbUser,
    isAuthenticated,
    isLoading,
    userEmail: user?.primaryEmail || dbUser?.email
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated,
    isAdmin,
    error: error?.message,
    isStale,
    // Stack Auth client methods
    signIn: () => stackApp.redirectToSignIn(),
    signOut: () => stackApp.signOut()
  };
}