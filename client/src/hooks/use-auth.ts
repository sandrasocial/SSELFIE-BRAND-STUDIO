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
    
    // Wrap useUser in try-catch to handle internal Stack Auth errors
    let user;
    try {
      user = useUser({ or: 'return-null' });
    } catch (userError) {
      console.warn('⚠️ Stack Auth useUser failed, using fallback:', userError);
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