import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  console.log('🔍 Auth: Using server-side Stack Auth (like Replit Auth)');
  
  // Server-side authentication check (similar to Replit Auth pattern)
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

  // SINGLE ADMIN CHECK: Sandra's email only
  const isAdmin = dbUser?.email === 'sandra@sselfie.ai';
  
  // Determine authentication state (server-side only, like Replit Auth)
  const isAuthenticated = !!dbUser;
  const isLoading = dbLoading;
  
  console.log('🔍 Auth State (Server-side Stack Auth):', {
    hasDbUser: !!dbUser,
    isAuthenticated,
    isLoading,
    isStale
  });

  return {
    user: dbUser || null,
    isLoading,
    isAuthenticated,
    isAdmin,
    error: error?.message,
    isStale,
    // Simple redirects like Replit Auth
    signIn: () => window.location.href = '/api/auth/login',
    signOut: () => window.location.href = '/api/auth/logout'
  };
}