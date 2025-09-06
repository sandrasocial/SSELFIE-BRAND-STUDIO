import { useUser, useStackApp } from '@stackframe/stack';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export function useAuth() {
  console.log('🔍 Auth: Using Stack Auth system');
  
  const stackApp = useStackApp();
  const user = useUser({ or: 'return-null' });
  
  // Handle Stack Auth loading states
  if (user === undefined) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      error: undefined,
      signIn: () => {
        console.log('🔐 Redirecting to Stack Auth sign-in');
        stackApp.redirectToSignIn();
      },
      signOut: () => {
        console.log('🔐 Signing out with Stack Auth');
        stackApp.signOut();
      }
    };
  }
  
  // Transform Stack Auth user to our interface
  const transformedUser: User | null = user ? {
    id: user.id,
    email: user.primaryEmail || '',
    firstName: user.displayName?.split(' ')[0] || user.primaryEmail?.split('@')[0] || '',
    lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
    displayName: user.displayName || user.primaryEmail || '',
  } : null;

  // Admin check - Sandra's email only
  const isAdmin = transformedUser?.email === 'sandra@sselfie.ai';
  
  console.log('🔍 Auth State:', {
    authenticated: !!user,
    loading: false, // Stack Auth handles loading internally
    email: transformedUser?.email,
    isAdmin
  });

  return {
    user: transformedUser,
    isLoading: false, // Stack Auth handles loading states internally
    isAuthenticated: !!user,
    isAdmin,
    error: undefined,
    signIn: () => {
      console.log('🔐 Redirecting to Stack Auth sign-in');
      stackApp.redirectToSignIn();
    },
    signOut: () => {
      console.log('🔐 Signing out with Stack Auth');
      stackApp.signOut();
    }
  };
}