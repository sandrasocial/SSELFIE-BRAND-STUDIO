import type { QueryFunction } from "@tanstack/react-query";
import * as ReactQuery from "@tanstack/react-query";

// Robustly resolve QueryClient across ESM/CJS interop
const QueryClientCtor: any =
  (ReactQuery as any).QueryClient ||
  (ReactQuery as any).default?.QueryClient ||
  (ReactQuery as any).default;
// Diagnostics for runtime module shape (will print once in browser)
if (typeof window !== 'undefined') {
  try {
    const rq: any = ReactQuery as any;
    // Limit surface to avoid flooding console
    const rqKeys = Object.keys(rq || {}).slice(0, 20);
    const rqDefaultKeys = rq?.default ? Object.keys(rq.default).slice(0, 20) : null;
    console.group('[RQ] @tanstack/react-query module shape');
    console.log('typeof ReactQuery:', typeof rq, 'toStringTag:', rq?.[Symbol.toStringTag]);
    console.log('ReactQuery keys:', rqKeys);
    console.log('typeof ReactQuery.QueryClient:', typeof rq?.QueryClient);
    console.log('typeof ReactQuery.default:', typeof rq?.default);
    console.log('default keys:', rqDefaultKeys);
    console.log('typeof ReactQuery.default?.QueryClient:', typeof rq?.default?.QueryClient);
    console.groupEnd();
  } catch (e) {
    console.warn('[RQ] Failed to inspect module shape', e);
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
  const ctorType = typeof QueryClientCtor;
  const ctorName = (QueryClientCtor && QueryClientCtor.name) || '(no name)';
  console.log('[RQ] Resolved QueryClientCtor type:', ctorType, 'name:', ctorName);
  if (ctorType !== 'function') {
    console.error('[RQ] QueryClientCtor is not a function:', QueryClientCtor);
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
export const queryClient = new QueryClientCtor({
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
