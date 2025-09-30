const API_BASE = import.meta.env?.['VITE_API_BASE_URL']?.replace(/\/+$/, "") || "/api";

type FetchOpts =
  | (Omit<RequestInit, 'body'> & { json: unknown; body?: never; skipAuth?: boolean })
  | (Omit<RequestInit, 'body'> & { body: BodyInit | null; json?: never; skipAuth?: boolean })
  | (Omit<RequestInit, 'body'> & { skipAuth?: boolean }); // allow neither
export async function apiFetch(path: string, opts: FetchOpts = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  // Stack Auth handles authentication via cookies automatically
  // We don't need to manually extract and add tokens to headers
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...('json' in opts && opts.json ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers as Record<string, string>),
  };

  const body = 'json' in opts && opts.json ? JSON.stringify(opts.json) : 
               'body' in opts ? opts.body : null;

  const res = await fetch(url, {
    ...opts,
    headers,
    body: body || null,
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


