import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Force development server URL in development mode
function getApiUrl(url: string): string {
  console.log('🔍 getApiUrl called with:', url);
  console.log('🔍 Current hostname:', window.location.hostname);
  console.log('🔍 DEV mode:', import.meta.env.DEV);
  
  // Always redirect to dev server when accessing from sselfie.ai
  if (window.location.hostname === 'sselfie.ai') {
    const devUrl = `https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev${url}`;
    console.log('🔍 Redirecting to dev server:', devUrl);
    return devUrl;
  }
  
  console.log('🔍 Using original URL:', url);
  return url;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const finalUrl = getApiUrl(url);
  console.log(`🔍 API Request: ${method} ${url} -> ${finalUrl}`);
  
  const res = await fetch(finalUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
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
    console.log(`🔍 Query: ${url} -> ${finalUrl}`);
    
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
