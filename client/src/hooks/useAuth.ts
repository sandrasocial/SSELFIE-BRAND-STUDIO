import { useQuery } from "@tanstack/react-query";

export function useAuth() {
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