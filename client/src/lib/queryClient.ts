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
  
  const res = await fetch(finalUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      'Cache-Control': 'no-cache',
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Handle JSON responses properly
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
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
      queryFn: getQueryFn({ on401: "returnNull" }), // Changed to prevent auth errors from breaking app
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1, // Allow one retry to handle temporary network issues
    },
    mutations: {
      retry: 1, // Allow one retry for mutations
    },
  },
});
