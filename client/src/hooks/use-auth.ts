import { useUser, useStackApp } from "@stackframe/stack";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  console.log('🔍 Auth: Using Stack Auth client-side authentication');
  
  const stackApp = useStackApp();
  const stackUser = useUser();
  
  // Only sync with database when we have a Stack Auth user
  const { data: dbUser, isLoading: dbLoading } = useQuery({
    queryKey: ["/api/auth/user", stackUser?.id],
    enabled: !!stackUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      console.log('🔍 Syncing Stack Auth user with database:', stackUser?.primaryEmail);
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${await stackUser?.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log('⚠️ Database sync failed, using Stack Auth data only');
        return null;
      }
      
      const userData = await response.json();
      console.log('✅ Database user synced:', userData.email);
      return userData;
    }
  });

  // Admin check - Sandra's email only
  const isAdmin = stackUser?.primaryEmail === 'sandra@sselfie.ai';
  
  // Authentication state based on Stack Auth
  const isAuthenticated = !!stackUser;
  const isLoading = stackApp.useInitialLoad() || dbLoading;
  
  console.log('🔍 Auth State:', {
    authenticated: isAuthenticated,
    loading: isLoading,
    email: stackUser?.primaryEmail,
    hasDbSync: !!dbUser
  });

  return {
    user: stackUser || null,
    dbUser, // Separate database user data
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn: () => stackApp.redirectToSignIn(),
    signOut: () => stackApp.signOut()
  };
}