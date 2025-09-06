import { useQuery } from "@tanstack/react-query";
import { useUser } from "@stackframe/stack";

export function useAuth() {
  console.log('🔍 Auth: Using client-side Stack Auth');
  
  // Get Stack Auth user (client-side)
  const stackUser = useUser({ or: 'redirect' });
  
  // Sync with database user data when Stack Auth user exists
  const { data: dbUser, isLoading: dbLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!stackUser, // Only fetch when Stack Auth user exists
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    throwOnError: false,
    queryFn: async () => {
      console.log('🔍 Auth check: Syncing Stack Auth user with database');
      
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
            console.log('🔍 Auth check: Database user not found (401)');
            return null;
          }
          throw new Error(`Auth failed: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('✅ Auth check: Database user synced:', userData.email);
        return userData;
      } catch (error) {
        console.log('❌ Auth check: Error:', (error as Error).message);
        return null;
      }
    }
  });

  // SINGLE ADMIN CHECK: Sandra's email only
  const isAdmin = (stackUser?.primaryEmail || dbUser?.email) === 'sandra@sselfie.ai';
  
  // Determine authentication state (Stack Auth primary, database secondary)
  const isAuthenticated = !!stackUser;
  const isLoading = !stackUser && dbLoading;
  
  console.log('🔍 Auth State (Client-side Stack Auth):', {
    hasStackUser: !!stackUser,
    hasDbUser: !!dbUser,
    isAuthenticated,
    isLoading,
    email: stackUser?.primaryEmail || dbUser?.email
  });

  return {
    user: stackUser || dbUser || null,
    isLoading,
    isAuthenticated,
    isAdmin,
    error: error?.message,
    // Client-side Stack Auth redirects
    signIn: () => window.location.href = '/#/auth/sign-in',
    signOut: () => stackUser?.signOut()
  };
}