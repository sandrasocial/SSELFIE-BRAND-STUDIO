import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export function useAuth() {
  console.log('🔍 Auth: Using simplified authentication system');
  
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null as User | null
  });

  // Check authentication status from backend
  const { data: userData, isLoading: userLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      console.log('🔍 Checking authentication status...');
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔍 User not authenticated');
          return null;
        }
        throw new Error(`Auth check failed: ${response.status}`);
      }
      
      const user = await response.json();
      console.log('✅ User authenticated:', user.email);
      return user;
    }
  });

  // Update auth state when user data changes
  useEffect(() => {
    setAuthState({
      isAuthenticated: !!userData,
      isLoading: userLoading,
      user: userData
    });
  }, [userData, userLoading]);

  // Admin check - Sandra's email only
  const isAdmin = userData?.email === 'sandra@sselfie.ai';
  
  console.log('🔍 Auth State:', {
    authenticated: authState.isAuthenticated,
    loading: authState.isLoading,
    email: userData?.email,
    isAdmin
  });

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    isAdmin,
    error: error?.message,
    signIn: () => {
      console.log('🔐 Redirecting to Stack Auth sign-in');
      window.location.href = '/api/auth/signin';
    },
    signOut: () => {
      console.log('🔐 Signing out...');
      window.location.href = '/api/auth/signout';
    }
  };
}