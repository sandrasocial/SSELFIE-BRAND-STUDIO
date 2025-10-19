import type { QueryFunction } from "@tanstack/react-query";





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

// Runtime-safe lazy initialization via dynamic import
let _queryClient: any = null;
let _initPromise: Promise<any> | null = null;

export async function initQueryClient(): Promise<any> {
  if (_queryClient) return _queryClient;
  if (_initPromise) {
    await _initPromise; return _queryClient;
  }
  _initPromise = (async () => {
    let QueryClientCtor: any | undefined;
    let source = 'unknown';
    try {
      const rq: any = await import('@tanstack/react-query');
      try {
        console.log('[RQ dyn] react-query keys:', Object.keys(rq || {}));
        if (rq?.default) console.log('[RQ dyn] react-query default keys:', Object.keys(rq.default || {}));
      } catch {}
      QueryClientCtor = rq?.QueryClient || rq?.default?.QueryClient || rq?.default;
      source = '@tanstack/react-query';
    } catch (e) {
      console.warn('[RQ dyn] failed import @tanstack/react-query', e);
    }
    if (typeof QueryClientCtor !== 'function') {
      try {
        const core: any = await import('@tanstack/query-core');
        try {
          console.log('[RQ dyn] query-core keys:', Object.keys(core || {}));
          if (core?.default) console.log('[RQ dyn] query-core default keys:', Object.keys(core.default || {}));
        } catch {}
        QueryClientCtor = core?.QueryClient || core?.default?.QueryClient || core?.default;
        source = '@tanstack/query-core';
      } catch (e) {
        console.error('[RQ dyn] failed import @tanstack/query-core', e);
      }
    }
    if (typeof QueryClientCtor !== 'function') {
      console.error('[RQ dyn] QueryClientCtor invalid:', QueryClientCtor, 'source:', source);
      throw new Error('QueryClient constructor not found at runtime');
    }
    _queryClient = new QueryClientCtor({
      defaultOptions: {
        queries: {
          queryFn: getQueryFn({ on401: "throw" }),
          refetchInterval: false,
          refetchOnWindowFocus: false,
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
          retry: (failureCount: number, error: any) => {
            if (error?.message?.includes('4') && !error.message.includes('408') && !error.message.includes('429')) {
              return false;
            }
            return failureCount < 2;
          },
        },
        mutations: { retry: false },
      },
    });
    console.log('[RQ dyn] QueryClient initialized from', source);
  })();
  await _initPromise;
  return _queryClient;
}

export function getQueryClient() {
  if (!_queryClient) {
    throw new Error('QueryClient not initialized. Call initQueryClient() before rendering.');
  }
  return _queryClient;
}
