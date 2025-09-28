import { useUser } from "@stackframe/react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api.js";
import type { 
  User, 
  UseAuthReturn, 
  AuthenticationState, 
  LoadingState,
  AuthSession,
  AuthErrorType,
  UserPlan,
  UserRole
} from "../types/auth.js";
import { 
  convertErrorToAuthError, 
  logAuthError,
  createSessionAuthError 
} from "../lib/auth-errors.js";
import { 
  sessionStorage, 
  createAuthSession, 
  invalidateSession,
  shouldRefreshSession,
  handleSessionError
} from "../lib/session-storage.js";
import { isUserPlan, isUserRole } from "../types/auth.js";

// Enhanced Stack Auth integration with comprehensive type safety
export function useAuth(): UseAuthReturn {
  const stackUser = useUser();
  
  // Get current session
  const currentSession = sessionStorage.getSession();
  
  // Fetch our database user data if Stack Auth user exists
  const { data: dbUser, error: queryError, isLoading: isQueryLoading } = useQuery({
    queryKey: ["/api/me"],
    retry: 1,
    retryDelay: 750,
    enabled: !!stackUser?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        // Check if session needs refresh
        if (shouldRefreshSession(currentSession)) {
          sessionStorage.clearSession();
        }
        
        const data = await apiFetch('/me');
        
        // Update session on successful API call
        if (stackUser?.id) {
          const newSession = createAuthSession();
          sessionStorage.setSession(newSession);
        }
        
        return data?.user ?? null;
      } catch (error) {
        const sessionError = handleSessionError(error);
        logAuthError(sessionError, 'Database user fetch');
        throw sessionError;
      }
    }
  });

  // Determine authentication state
  const getAuthState = (): AuthenticationState => {
    if (queryError) {
      const authError = convertErrorToAuthError(queryError);
      if (authError.code === 'SESSION_EXPIRED' || authError.code === 'SESSION_INVALID') {
        return 'session_expired';
      }
      return 'error';
    }
    
    if (!stackUser?.id) {
      return 'unauthenticated';
    }
    
    if (isQueryLoading) {
      return 'authenticating';
    }
    
    return 'authenticated';
  };

  // Determine loading state
  const getLoadingState = (): LoadingState => {
    if (isQueryLoading) return 'loading';
    if (queryError) return 'error';
    if (stackUser?.id) return 'success';
    return 'idle';
  };

  // Convert error to proper auth error type
  const authError: AuthErrorType | null = queryError 
    ? convertErrorToAuthError(queryError)
    : null;

  // Log authentication errors
  if (authError) {
    logAuthError(authError, 'useAuth hook');
  }
  
  // Consider user authenticated as soon as Stack Auth says so (avoids loops)
  const isAuthenticated = !!stackUser?.id;
  
  // For OAuth callbacks, we can proceed with just Stack Auth user
  const hasStackAuthUser = !!stackUser?.id;
  
  // Create type-safe user object
  const createUserFromData = (userData: any): User | undefined => {
    if (!userData && !stackUser) return undefined;
    
    const baseUser = userData || {};
    const fallbackUser = {
      id: stackUser?.id || '',
      email: stackUser?.primaryEmail || '',
      firstName: stackUser?.displayName?.split(' ')[0],
      lastName: stackUser?.displayName?.split(' ').slice(1).join(' '),
      plan: 'sselfie-studio' as UserPlan,
      role: 'user' as UserRole,
      monthlyGenerationLimit: 0,
      generationsUsedThisMonth: 0,
    };
    
    // Validate and type-check the user data
    const user: User = {
      id: baseUser.id || fallbackUser.id,
      email: baseUser.email || fallbackUser.email,
      firstName: baseUser.firstName || fallbackUser.firstName,
      lastName: baseUser.lastName || fallbackUser.lastName,
      displayName: baseUser.displayName || stackUser?.displayName,
      profileImageUrl: baseUser.profileImageUrl,
      plan: isUserPlan(baseUser.plan) ? baseUser.plan : fallbackUser.plan,
      role: isUserRole(baseUser.role) ? baseUser.role : fallbackUser.role,
      
      // User preferences and profile data
      gender: baseUser.gender,
      profession: baseUser.profession,
      brandStyle: baseUser.brandStyle,
      photoGoals: baseUser.photoGoals,
      preferredOnboardingMode: baseUser.preferredOnboardingMode,
      
      // Training and access flags
      trainingCoachingCompleted: Boolean(baseUser.trainingCoachingCompleted),
      mayaAiAccess: Boolean(baseUser.mayaAiAccess),
      victoriaAiAccess: Boolean(baseUser.victoriaAiAccess),
      hasRetrainingAccess: Boolean(baseUser.hasRetrainingAccess),
      
      // Usage tracking with safe defaults
      monthlyGenerationLimit: typeof baseUser.monthlyGenerationLimit === 'number' 
        ? baseUser.monthlyGenerationLimit 
        : fallbackUser.monthlyGenerationLimit,
      generationsUsedThisMonth: typeof baseUser.generationsUsedThisMonth === 'number' 
        ? baseUser.generationsUsedThisMonth 
        : fallbackUser.generationsUsedThisMonth,
    };
    
    return user;
  };

  const user = createUserFromData(dbUser);
  
  // Check if user has active subscription (single-tier €47/month model)
  const hasActiveSubscription = user ? (
    user.monthlyGenerationLimit === -1 || // Admin users (unlimited)
    (user.plan === 'sselfie-studio' && user.monthlyGenerationLimit > 0) // Paid subscribers
  ) : false;

  // Get current session state
  const session: AuthSession | null = currentSession || (isAuthenticated ? createAuthSession() : null);
  
  // Update session if user state changes
  if (isAuthenticated && (!currentSession || !currentSession.isValid)) {
    const newSession = createAuthSession();
    sessionStorage.setSession(newSession);
  } else if (!isAuthenticated && currentSession?.isValid) {
    sessionStorage.setSession(invalidateSession());
  }

  return {
    user,
    isLoading: isQueryLoading,
    isAuthenticated,
    hasStackAuthUser,
    hasActiveSubscription,
    requiresPayment: isAuthenticated && !hasActiveSubscription,
    error: authError,
    stackUser,
    session,
    authState: getAuthState(),
    loadingState: getLoadingState(),
  };
}