import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useAuth() {
  const { data: user, isLoading, error, isStale } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: 1, // Allow one retry
    retryDelay: 500, // Wait 500ms before retry
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 30 * 1000, // Consider fresh for 30 seconds to prevent rapid re-checks
    gcTime: 10 * 60 * 1000, // 10 minutes
    throwOnError: false,
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          cache: 'no-cache' // Always check with server
        });
        
        if (!response.ok) {
          // For 401 errors, return null (not authenticated)
          if (response.status === 401) {
            return null;
          }
          throw new Error(`Authentication check failed: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('Auth check successful:', userData.email);
        return userData;
      } catch (error) {
        console.log('Auth check failed:', error.message);
        // For any error, treat as not authenticated
        return null;
      }
    }
  });

  // User is authenticated only if data exists, is not null, and has valid user properties
  const isAuthenticated = !!(user && user.id);

  // Enhanced logging for debugging - only log changes to reduce console noise
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useAuth state change:', { 
        isAuthenticated, 
        isLoading, 
        hasUser: !!user, 
        userId: user?.id,
        email: user?.email 
      });
    }
  }, [isAuthenticated, isLoading, user?.id]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    isStale
  };
}