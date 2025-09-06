import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  role?: string;
}

export function useAuth() {
  // Check for Stack Auth token in cookies or local storage
  const hasToken = document.cookie.includes('stack-auth') || 
                   localStorage.getItem('stack-auth-token') ||
                   sessionStorage.getItem('stack-auth-token');
  
  // Sync with our backend using JWKS verification
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!hasToken, // Only fetch when we have a token
    retry: false,
    queryFn: async () => {
      // Include token in headers if we have it in localStorage
      const token = localStorage.getItem('stack-auth-token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['x-stack-auth-token'] = token;
      }
      
      const response = await fetch('/api/auth/user', { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    }
  });

  console.log('🔍 Auth: Has token:', !!hasToken);
  console.log('🔍 Auth: User data:', user);
  console.log('🔍 Auth: Loading:', isLoading);
  console.log('🔍 Auth: Error:', error);

  return {
    user: user as User | undefined,
    isLoading: isLoading && hasToken, // Only loading if we have a token and are fetching
    isAuthenticated: !!user && !!hasToken,
    error,
  };
}