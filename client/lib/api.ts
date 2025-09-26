export type ApiInit = RequestInit & { json?: any };

const bases = ["/api", "/.netlify/functions/api"] as const;

async function tryFetch(url: string, init?: RequestInit) {
  return fetch(url, init);
}

export async function apiFetch(path: string, init: ApiInit = {}) {
  const { json, headers, ...rest } = init;
  const body = json !== undefined ? JSON.stringify(json) : (init.body as BodyInit | null | undefined);
  const hdrs = new Headers(headers || {});
  if (json !== undefined) hdrs.set("Content-Type", "application/json");

  let lastError: any = null;
  for (const base of bases) {
    try {
      const res = await tryFetch(`${base}${path}`, { ...rest, headers: hdrs, body });
      // If we get a 404 for first base, try next base; for other statuses return as-is
      if (res.status === 404) continue;
      return res;
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  throw lastError || new Error("API unreachable");
}

export async function apiJson<T>(path: string, init: ApiInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      // @ts-ignore
      if (data && data.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}
