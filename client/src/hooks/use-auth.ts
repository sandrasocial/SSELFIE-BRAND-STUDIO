import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, isStale } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    throwOnError: false,
    queryFn: async () => {
      try {
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('replit');
        const authUrl = isDevelopment ? '/api/auth/user?dev_auth=sandra' : '/api/auth/user';
        
        const response = await fetch(authUrl, {
          credentials: 'include',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error(`Auth failed: ${response.status}`);
        }
        
        const userData = await response.json();
        return userData;
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    }
  });

  const isAdmin = user?.email === 'ssa@ssasocial.com';
  const isAuthenticated = !!user && !error;

  return {
    user,
    isLoading,
    error,
    isStale,
    isAdmin,
    isAuthenticated
  };
}