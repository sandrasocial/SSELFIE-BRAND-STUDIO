import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity, // Never refetch automatically
    gcTime: 10 * 60 * 1000, // 10 minutes
    throwOnError: false,
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          // For 401 errors, return null (not authenticated)
          if (response.status === 401) {
            return null;
          }
          throw new Error(`Authentication check failed: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        // For any error, treat as not authenticated
        return null;
      }
    }
  });

  // User is authenticated if data exists and is not null
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error
  };
}