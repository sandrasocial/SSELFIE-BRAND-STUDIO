import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  role?: string;
}

export function useAuth() {
  // Check for Stack Auth session cookie (set by Stack Auth OAuth flow)
  const hasStackAuthSession = document.cookie.includes('stack-') || 
                              window.location.search.includes('code='); // OAuth callback
  
  // Sync with our backend using JWKS verification
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!hasStackAuthSession, // Only fetch when we have Stack Auth session
    retry: (failureCount, error) => {
      // Only retry if it's a network error, not authentication errors
      if (error?.message?.includes('401')) {
        console.log('🚫 Auth: 401 error, not retrying to prevent loop');
        return false;
      }
      return failureCount < 2; // Only retry twice for other errors
    },
    refetchOnWindowFocus: false, // Don't refetch on focus to prevent loops
    staleTime: 1000 * 60 * 5, // Consider user data fresh for 5 minutes
  });

  console.log('🔍 Auth: Has Stack Auth session:', hasStackAuthSession);
  console.log('🔍 Auth: User data:', user);
  console.log('🔍 Auth: Loading:', isLoading);
  console.log('🔍 Auth: Error:', error);

  // If we have a 401 error but Stack Auth session exists, 
  // the OAuth callback probably didn't complete properly
  const isAuthError = error?.message?.includes('401');
  
  return {
    user: user as User | undefined,
    isLoading: isLoading && hasStackAuthSession,
    isAuthenticated: !!user && !!hasStackAuthSession,
    error,
    authFlowIncomplete: hasStackAuthSession && isAuthError, // New flag for debugging
  };
}