import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Development bypass for authentication issues
  if (import.meta.env.DEV) {
    console.log("Authentication bypassed for development - allowing access");
    console.log('🔍 useAuth state:', {
      user: false,
      isLoading: false,
      isAuthenticated: false
    });
    return {
      user: false,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    };
  }

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Debug authentication state
  console.log('🔍 useAuth state:', {
    user: !!user,
    isLoading,
    error: error?.message,
    isAuthenticated: !!user
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}