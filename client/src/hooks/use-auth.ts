// Stack Auth hook wrapper for app_v2
import { useUser } from '@stackframe/stack';

export const useAuth = () => {
  const user = useUser();
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading: false
  };
};
