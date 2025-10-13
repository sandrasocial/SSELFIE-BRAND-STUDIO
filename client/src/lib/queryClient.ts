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
  // Attach Stack Auth bearer if available
  let authHeader: Record<string, string> = {};
  try {
    // Read Stack Auth token directly from browser cookies
    let token: string | null = null;
    
    if (typeof document !== 'undefined' && document.cookie) {
      // Parse cookies to find stack-access
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      // Stack Auth stores token in stack-access cookie as ["refreshToken", "accessToken"]
      const stackAccessCookie = cookies['stack-access'];
      
      if (stackAccessCookie) {
        try {
          // Decode and parse the cookie value
          const decoded = decodeURIComponent(stackAccessCookie);
          const parsed = JSON.parse(decoded);
          
          // Extract access token (second element in array)
          if (Array.isArray(parsed) && parsed[1]) {
            token = parsed[1];
            console.log('[API] Token extracted from stack-access cookie');
          }
        } catch (e) {
          console.warn('[API] Failed to parse stack-access cookie:', e);
        }
      }
    }
    
    if (token) {
      authHeader = { Authorization: `Bearer ${token}` };
      console.log('[API] Adding Authorization header for:', url);
    } else {
      console.warn('[API] No auth token found in cookies for:', url);
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
