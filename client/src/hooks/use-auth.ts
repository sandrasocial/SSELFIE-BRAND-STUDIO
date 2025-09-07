import { useUser } from "@stackframe/stack";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  role?: string;
}

// Stack Auth integration following Neon template pattern
export function useAuth() {
  const stackUser = useUser();
  
  console.log('🔍 Auth: Has Stack Auth session:', !!stackUser);
  console.log('🔍 Auth: User data:', stackUser);
  console.log('🔍 Auth: Loading:', false); // Stack Auth handles loading internally
  console.log('🔍 Auth: Error:', null);

  // Transform Stack Auth user to our User interface
  const user: User | undefined = stackUser ? {
    id: stackUser.id,
    email: stackUser.primaryEmail || '',
    firstName: stackUser.displayName?.split(' ')[0],
    lastName: stackUser.displayName?.split(' ').slice(1).join(' '),
    plan: 'sselfie-studio', // Will be fetched from database
    role: 'user' // Will be fetched from database
  } : undefined;
  
  return {
    user,
    isLoading: false, // Stack Auth handles loading states internally
    isAuthenticated: !!stackUser,
    error: null,
    stackUser, // Provide access to raw Stack Auth user
  };
}