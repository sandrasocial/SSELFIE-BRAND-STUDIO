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
      console.log('🔍 ZARA AUTH FIX: Making request to /api/auth/user');
      
      try {
        // ZARA FIX: Add dev bypass for testing during development
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('replit');
        const authUrl = isDevelopment ? '/api/auth/user?dev_auth=sandra' : '/api/auth/user';
        
        console.log('🔧 ZARA: Using auth URL:', authUrl);
        
        const response = await fetch(authUrl, {
          credentials: 'include',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔍 ZARA: Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('🔍 ZARA: User not authenticated (401)');
            return null; // Not authenticated
          }
          throw new Error(`Auth failed: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('✅ ZARA: User authenticated successfully:', userData.email);
        console.log('🎯 ZARA: Authentication mode:', userData.authMode);
        
        return userData;
      } catch (error) {
        console.error('❌ ZARA AUTH ERROR:', error);
        return null; // Treat errors as not authenticated
      }
    }
  });

  // SINGLE ADMIN CHECK: Sandra's email only
  const isAdmin = user?.email === 'ssa@ssasocial.com';
  
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