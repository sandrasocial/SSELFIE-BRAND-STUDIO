import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, isStale } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false, // CRITICAL: Disable retry to prevent infinite loading
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 60 * 1000, // Consider fresh for 60 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    throwOnError: false,
    queryFn: async () => {
      console.log('🔍 Auth check: Making request to /api/auth/user');
      
      try {
        const headers: Record<string, string> = {
          'Cache-Control': 'no-cache'
        };
        
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          cache: 'no-cache',
          headers
        });
        
        console.log('🔍 Auth check: Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('🔍 Auth check: User not authenticated (401)');
            
            // Check if this is a token refresh failure that requires re-login
            try {
              const errorData = await response.json();
              if (errorData.needsLogin) {
                console.log('🔄 Token refresh failed, redirecting to login');
                // Small delay to prevent immediate redirect loops
                setTimeout(() => {
                  window.location.href = '/api/login';
                }, 1000);
              }
            } catch (e) {
              // Ignore JSON parsing errors for error responses
            }
            
            return null; // Not authenticated
          }
          throw new Error(`Auth failed: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('✅ Auth check: User authenticated:', userData.email);
        return userData;
      } catch (error) {
        console.log('❌ Auth check: Error:', (error as Error).message);
        return null; // Treat errors as not authenticated
      }
    }
  });

  // UNIFIED ADMIN CHECK: Standardized role checking
  const isAdmin = user?.email === 'ssa@ssasocial.com' || user?.role === 'admin';
  
  // CRITICAL: Determine authentication state
  const isAuthenticated = !!(user && user.id);
  
  // CRITICAL: Don't consider it loading if we got a definitive answer (even if null)
  const actuallyLoading = isLoading && user === undefined;

  // MAYA FIX: Remove console.log that was causing constant re-renders in browser console
  // Only log significant state changes, not every render
  // console.log('🔍 useAuth final state:', { isAuthenticated, actuallyLoading });

  return {
    user,
    isLoading: actuallyLoading, // Fixed loading state
    isAuthenticated,
    isAdmin, // Unified admin check
    error,
    isStale
  };
}