import { useUser, useStackApp } from '@stackframe/stack';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export function useAuth() {
  console.log('🔍 Auth: Starting useAuth hook');
  
  // First try to get the Stack app
  let stackApp;
  try {
    stackApp = useStackApp();
    console.log('🔧 Stack app retrieved:', !!stackApp);
  } catch (stackAppError) {
    console.error('❌ useStackApp failed:', stackAppError);
    return createFallbackAuthState();
  }
  
  // Validate Stack app
  if (!stackApp) {
    console.warn('⚠️ Stack Auth app not available, using fallback');
    return createFallbackAuthState();
  }
  
  // Try to get the user
  let user;
  try {
    console.log('🔍 Calling useUser hook...');
    user = useUser({ or: 'return-null' });
    console.log('✅ useUser returned:', typeof user, user?.id ? 'authenticated' : 'not authenticated');
  } catch (userError) {
    console.error('❌ useUser hook failed:', {
      name: userError?.name,
      message: userError?.message,
      constructor: userError?.constructor?.name,
      stack: userError?.stack?.substring(0, 200) + '...'
    });
    return createFallbackAuthState();
  }
  
  // Handle Stack Auth loading states
  if (user === undefined) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      error: undefined,
      signIn: () => {
        console.log('🔐 Stack Auth sign-in requested - component will handle');
        return;
      },
      signOut: () => {
        console.log('🔐 Signing out with Stack Auth');
        if (stackApp?.signOut) {
          stackApp.signOut();
        }
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
  
  console.log('🔍 Final Auth State:', {
    authenticated: !!user,
    loading: false,
    email: transformedUser?.email,
    isAdmin
  });

  return {
    user: transformedUser,
    isLoading: false,
    isAuthenticated: !!user,
    isAdmin,
    error: undefined,
    signIn: () => {
      console.log('🔐 Stack Auth sign-in requested - component will handle');
      return;
    },
    signOut: () => {
      console.log('🔐 Signing out with Stack Auth');
      if (stackApp?.signOut) {
        stackApp.signOut();
      }
    }
  };
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