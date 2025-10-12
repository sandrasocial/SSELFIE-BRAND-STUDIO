// API client with Stack Auth integration
import { useUser } from '@stackframe/stack';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  // Note: For client-side calls, Stack Auth automatically includes cookies
  // Server-side auth is handled via middleware

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: include cookies for Stack Auth
    headers
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Export useUser for components that need it
export { useUser };
