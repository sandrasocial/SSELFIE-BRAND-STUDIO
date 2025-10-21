const API_BASE = import.meta.env?.['VITE_API_BASE_URL']?.replace(/\/+$/, "") || "/api";

type FetchOpts =
  | (Omit<RequestInit, 'body'> & { json: unknown; body?: never; skipAuth?: boolean })
  | (Omit<RequestInit, 'body'> & { body: BodyInit | null; json?: never; skipAuth?: boolean })
  | (Omit<RequestInit, 'body'> & { skipAuth?: boolean }); // allow neither

// Global token cache to avoid repeated extraction
let _cachedToken: string | null = null;
let _tokenCacheTime = 0;
const TOKEN_CACHE_DURATION = 30000; // 30 seconds

// 🔥 CRITICAL FIX: Get Stack Auth token from client app instance
async function getStackAuthToken(): Promise<string | null> {
  try {
    // Use cached token if still valid
    const now = Date.now();
    if (_cachedToken && (now - _tokenCacheTime) < TOKEN_CACHE_DURATION) {
      return _cachedToken;
    }

    // Import Stack client and get current instance
    const { stackClientApp } = await import('../../../stack/client.js');

    // Try to get token from Stack client app's internal methods
    try {
      // Access the internal token store if available
      const tokenStore = (stackClientApp as any).tokenStore || (stackClientApp as any)._tokenStore;
      if (tokenStore) {
        // Try getAccessToken method
        if (typeof tokenStore.getAccessToken === 'function') {
          const token = await tokenStore.getAccessToken();
          if (token && token !== 'undefined' && token !== 'null') {
            _cachedToken = token;
            _tokenCacheTime = now;
            console.log('✅ Got token from tokenStore.getAccessToken()');
            return token;
          }
        }

        // Try getItem method (common in token stores)
        if (typeof tokenStore.getItem === 'function') {
          const token = await tokenStore.getItem('accessToken');
          if (token && token !== 'undefined' && token !== 'null') {
            _cachedToken = token;
            _tokenCacheTime = now;
            console.log('✅ Got token from tokenStore.getItem()');
            return token;
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ Token store access failed, trying cookies:', e);
    }

    // Fallback: Extract from cookies (Stack Auth's cookie storage)
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');

      // Look for Stack Auth cookies - check all possible cookie names
      if (name && (
        name.includes('stack') ||
        name.includes('auth') ||
        name.includes('token') ||
        name === 'stack-access-token' ||
        name === 'stack_session'
      )) {
        try {
          const decodedValue = decodeURIComponent(value);

          // Skip invalid values
          if (!decodedValue || decodedValue === 'undefined' || decodedValue === 'null') {
            continue;
          }

          // Try parsing as JSON array (Stack Auth cookie format)
          if (decodedValue.startsWith('[')) {
            const stackAccessArray = JSON.parse(decodedValue);
            if (Array.isArray(stackAccessArray) && stackAccessArray.length >= 2 && stackAccessArray[1]) {
              _cachedToken = stackAccessArray[1];
              _tokenCacheTime = now;
              console.log('✅ Got token from cookie array:', name);
              return stackAccessArray[1];
            }
          }

          // Try parsing as JSON object
          if (decodedValue.startsWith('{')) {
            const stackAccessObj = JSON.parse(decodedValue);
            if (stackAccessObj.accessToken) {
              _cachedToken = stackAccessObj.accessToken;
              _tokenCacheTime = now;
              console.log('✅ Got token from cookie object:', name);
              return stackAccessObj.accessToken;
            }
          }

          // Try direct token if it looks like a JWT (3 parts separated by dots)
          if (decodedValue.length > 20 && decodedValue.includes('.')) {
            const parts = decodedValue.split('.');
            if (parts.length === 3) {
              _cachedToken = decodedValue;
              _tokenCacheTime = now;
              console.log('✅ Got token from cookie JWT:', name);
              return decodedValue;
            }
          }

        } catch (parseError) {
          // Continue to next cookie
          continue;
        }
      }
    }

    console.warn('⚠️ No Stack Auth token found in cookies or token store');
    return null;

  } catch (error) {
    console.error('❌ Failed to get Stack Auth token:', error);
    return null;
  }
}

export async function apiFetch(path: string, opts: FetchOpts = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  // 💡 CRITICAL FIX: Inject Stack Auth token into every authenticated request
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...('json' in opts && opts.json ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers as Record<string, string>),
  };

  // Add Stack Auth token if not explicitly skipping auth
  if (!opts.skipAuth) {
    const token = await getStackAuthToken();
    if (token) {
      headers['x-stack-access-token'] = token; // 💡 CRITICAL STACK AUTH HEADER
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Token injected for request:', path.substring(0, 30));
    } else {
      console.warn('⚠️ No Stack Auth token available for request:', path);
    }
  }

  const body = 'json' in opts && opts.json ? JSON.stringify(opts.json) :
               'body' in opts ? opts.body : null;

  try {
    const res = await fetch(url, {
      ...opts,
      headers,
      body: body || null,
      credentials: 'include', // Changed from 'same-origin' to 'include' for better token handling
    });

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const sample = (await res.text()).slice(0, 180);
      throw new Error(`Unexpected content-type: ${ct} body starts: ${sample}`);
    }

    const data = await res.json();
    if (!res.ok) {
      console.error('❌ API Error:', {
        path,
        status: res.status,
        error: data?.error || data?.message || res.statusText
      });
      throw new Error((data && (data.message || data.error)) || res.statusText);
    }
    return data;
  } catch (error) {
    console.error('❌ API Fetch Failed:', {
      path,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
}

export async function apiFetchDebug(path: string, opts?: any) {
  const data = await apiFetch(path, opts);
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.debug('[api]', path, data);
  }
  return data;
}


