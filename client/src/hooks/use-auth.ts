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
  
  try {
    const stackApp = useStackApp();
    
    // Check if Stack Auth is properly initialized
    if (!stackApp || typeof stackApp.redirectToSignIn !== 'function') {
      console.warn('⚠️ Stack Auth not properly initialized, using fallback');
      return createFallbackAuthState();
    }
    
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
  } catch (error) {
    console.error('❌ Auth hook error:', error);
    return createFallbackAuthState();
  }
}

// Fallback auth state for when Stack Auth isn't available
function createFallbackAuthState() {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    error: undefined,
    signIn: () => {
      console.log('🔐 Auth not available - redirecting to manual login');
      window.location.href = '/login';
    },
    signOut: () => {
      console.log('🔐 Auth not available');
      window.location.href = '/';
    }
  };
}