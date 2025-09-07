import { useUser } from "@stackframe/react";
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  role?: string;
}

// Neon Auth integration using @stackframe/react SDK
export function useAuth() {
  const stackUser = useUser();
  
  // Fetch our database user data if Stack Auth user exists
  const { data: dbUser, isLoading: isDbUserLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!stackUser?.id, // Only fetch if Stack Auth user exists
  });

  const isLoading = isDbUserLoading; // Only loading when fetching DB user, not when no Stack user
  const isAuthenticated = !!stackUser?.id;
  
  console.log('🔍 Auth: Stack user:', !!stackUser, stackUser?.id);
  console.log('🔍 Auth: Database user:', !!dbUser);
  console.log('🔍 Auth: Loading:', isLoading);
  console.log('🔍 Auth: Authenticated:', isAuthenticated);

  // Use database user data if available, fallback to Stack Auth user
  const user: User | undefined = dbUser || (stackUser ? {
    id: stackUser.id,
    email: stackUser.primaryEmail || '',
    firstName: stackUser.displayName?.split(' ')[0],
    lastName: stackUser.displayName?.split(' ').slice(1).join(' '),
    plan: 'sselfie-studio', // Default, will be overridden by database
    role: 'user' // Default, will be overridden by database
  } : undefined);
  
  return {
    user,
    isLoading,
    isAuthenticated,
    error: null,
    stackUser, // Provide access to raw Stack Auth user
  };
}