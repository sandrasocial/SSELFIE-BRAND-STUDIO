import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Cookies from "js-cookie";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  console.log('🔍 Auth: useAuth hook called');
  console.log('🔍 Auth: User data:', user);
  console.log('🔍 Auth: Loading:', isLoading);
  console.log('🔍 Auth: Error:', error);

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user,
    error
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('✅ Login successful:', data);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      console.error('❌ Login failed:', error);
    }
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest("POST", "/api/auth/register", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('✅ Registration successful:', data);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      console.error('❌ Registration failed:', error);
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      console.log('✅ Logout successful');
      // Clear user data from cache
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Clear any stored tokens
      Cookies.remove('token');
    },
    onError: (error) => {
      console.error('❌ Logout failed:', error);
    }
  });
}