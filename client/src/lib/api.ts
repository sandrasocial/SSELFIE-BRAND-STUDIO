const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/+$/, "") || "/api";

type FetchOpts = RequestInit & { json?: any; skipAuth?: boolean };

export async function apiFetch(path: string, opts: FetchOpts = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const { getStackApp } = await import('../stack/stack-context');
  const stack = getStackApp?.();
  const token = opts.skipAuth ? null : (await (stack as any)?.getAccessToken?.());

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers as any),
  };

  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.json ? JSON.stringify(opts.json) : opts.body,
    credentials: 'same-origin',
  });

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const sample = (await res.text()).slice(0, 180);
    throw new Error(`Unexpected content-type: ${ct} body starts: ${sample}`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error((data && (data.message || data.error)) || res.statusText);
  return data;
}

export async function apiFetchDebug(path: string, opts?: any) {
  const data = await apiFetch(path, opts);
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.debug('[api]', path, data);
  }
  return data;
}


