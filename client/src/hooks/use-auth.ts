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
          try {
            console.log('🔐 Stack Auth sign-in requested - component will handle');
            // Don't redirect - let Stack Auth components handle this
            return;
          } catch (signInError) {
            console.warn('⚠️ Stack Auth sign-in failed, using fallback:', signInError);
            window.location.href = '/login';
          }
        },
        signOut: () => {
          try {
            console.log('🔐 Signing out with Stack Auth');
            stackApp.signOut();
          } catch (signOutError) {
            console.warn('⚠️ Stack Auth sign-out failed, using fallback:', signOutError);
            window.location.href = '/';
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
        console.log('🔐 Stack Auth sign-in requested - component will handle');
        // Don't redirect - let Stack Auth components handle this
        return;
      },
      signOut: () => {
        console.log('🔐 Signing out with Stack Auth');
        stackApp.signOut();
      }
    };
  } catch (error) {
    // Better error logging to identify the actual issue
    console.error('❌ Auth hook error:', {
      message: error?.message || 'Unknown error',
      name: error?.name || 'Unknown error type',
      stack: error?.stack || 'No stack trace',
      fullError: error
    });
    
    // Check if it's a Stack Auth specific error
    if (error?.message?.includes('StackAssertionError') || 
        error?.message?.includes('accessToken') ||
        error?.name === 'StackAssertionError') {
      console.warn('⚠️ Stack Auth internal error detected, switching to fallback auth');
    }
    
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