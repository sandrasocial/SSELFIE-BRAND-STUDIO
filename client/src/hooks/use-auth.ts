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
    retry: false,
  });

  console.log('🔍 Auth: Has Stack Auth session:', hasStackAuthSession);
  console.log('🔍 Auth: User data:', user);
  console.log('🔍 Auth: Loading:', isLoading);
  console.log('🔍 Auth: Error:', error);

  return {
    user: user as User | undefined,
    isLoading: isLoading && hasStackAuthSession,
    isAuthenticated: !!user && !!hasStackAuthSession,
    error,
  };
}