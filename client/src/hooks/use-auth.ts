import { useUser, useStackApp } from "@stackframe/stack";
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
  const stackUser = useUser();
  const stackApp = useStackApp();
  
  // Sync Stack Auth user with our backend
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!stackUser, // Only fetch when Stack Auth user exists
    retry: false,
  });

  console.log('🔍 Stack Auth: User from Stack Auth:', stackUser);
  console.log('🔍 Backend: User data from our API:', user);
  console.log('🔍 Auth: Loading:', isLoading);
  console.log('🔍 Auth: Error:', error);

  return {
    user: user as User | undefined,
    stackUser,
    isLoading: isLoading || !stackUser, // Loading if either Stack Auth or backend is loading
    isAuthenticated: !!stackUser && !!user,
    error,
    signOut: () => stackApp.signOut(),
    signIn: () => stackApp.redirectToSignIn()
  };
}