import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Use current domain's API endpoints for production
function getApiUrl(url: string): string {
  return url;
}

export async function apiRequest(
  url: string,
  method: string = 'GET',
  data?: unknown | undefined,
): Promise<any> {
  const finalUrl = getApiUrl(url);
  // Attach Stack Auth bearer if available (unifies with apiFetch behavior)
  let authHeader: Record<string, string> = {};
  try {
    const { getStackApp } = await import('../stack/stack-context.js');
    const stack = getStackApp?.();
    
    // Stack Auth with cookie storage - get token from tokenStore
    const tokenStore = (stack as any)?.tokenStore;
    let token: string | null = null;
    
    if (tokenStore?.getItem) {
      // Try to get access token from cookie store
      const projectId = stack?.projectId || '253d7343-a0d4-43a1-be5c-822f590d40be';
      token = tokenStore.getItem(`stack-access-${projectId}`) || tokenStore.getItem('stack-access');
      
      // Parse if it's an array format like in the cookie
      if (token && token.startsWith('[')) {
        try {
          const parsed = JSON.parse(decodeURIComponent(token));
          token = Array.isArray(parsed) && parsed[1] ? parsed[1] : null;
        } catch (e) {
          console.warn('[API] Failed to parse token from cookie:', e);
        }
      }
    }
    
    // Fallback: try getAccessToken if available
    if (!token && typeof (stack as any)?.getAccessToken === 'function') {
      token = await (stack as any)?.getAccessToken?.();
    }
    
    if (token) {
      console.log('[API] Adding Authorization header with token');
      authHeader = { Authorization: `Bearer ${token}` };
    } else {
      console.warn('[API] No auth token found for request to:', url);
    }
  } catch (err) {
    console.error('[API] Error getting auth token:', err);
  }
  
  const res = await fetch(finalUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      'Cache-Control': 'no-cache',
      ...authHeader,
    },
    body: data ? JSON.stringify(data) : null,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Handle JSON responses properly
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  // If the server returned HTML, surface a clear error
  if (contentType && contentType.includes('text/html')) {
    const text = await res.text();
    throw new Error(`Expected JSON but received HTML from ${finalUrl}. First bytes: ${text.slice(0, 120)}`);
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const finalUrl = getApiUrl(url);
    
    const res = await fetch(finalUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for user data
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408/429
        if (error?.message?.includes('4') && !error.message.includes('408') && !error.message.includes('429')) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
