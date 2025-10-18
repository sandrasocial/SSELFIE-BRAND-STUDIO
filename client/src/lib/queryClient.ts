import type { QueryFunction } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/query-core";

// Minimal diagnostic after imports are initialized
if (typeof window !== 'undefined') {
  try {
    const ctorType = typeof QueryClient;
    const ctorName = (QueryClient as any)?.name || '(no name)';
    console.log('[RQ-core] typeof QueryClient:', ctorType, 'name:', ctorName);
  } catch (e) {
    console.warn('[RQ-core] QueryClient inspect failed:', e);
  }
}



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
  console.log('[API v3] Request to:', url); // Version marker for cache bust
  const finalUrl = getApiUrl(url);
  let authHeader: Record<string, string> = {};

  // Extract Stack Auth token from cookie (browser only)
  if (typeof document !== 'undefined' && document.cookie) {
    try {
      const cookies: Record<string, string> = {};
      document.cookie.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        if (key) cookies[key] = value;
      });

      const stackAccessCookie = cookies['stack-access'];
      if (stackAccessCookie) {
        const decoded = decodeURIComponent(stackAccessCookie);
        const parsed = JSON.parse(decoded);

        // Stack Auth cookie format: ["refreshToken", "accessToken"]
        if (Array.isArray(parsed) && parsed[1]) {
          authHeader = { Authorization: `Bearer ${parsed[1]}` };
          console.log('[API v3] ✅ Auth token added');
        }
      } else {
        console.warn('[API v3] ⚠️ No stack-access cookie found');
      }
    } catch (err) {
      console.error('[API v3] ❌ Token extraction failed:', err);
    }
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
// Log resolved constructor shape before instantiation
if (typeof window !== 'undefined') {
  const ctorType = typeof QueryClient;
  const ctorName = (QueryClient as any)?.name || '(no name)';
  console.log('[RQ] Instantiation check - typeof QueryClient:', ctorType, 'name:', ctorName);
  if (ctorType !== 'function') {
    console.error('[RQ] QueryClient is not a function:', QueryClient);
  }
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => any =
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

// Initialize QueryClient immediately
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

// Export getter function for backward compatibility
export function getQueryClient() {
  return queryClient;
}
