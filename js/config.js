// Configuration & URL params parsing
export function getParams() {
  const qs = new URLSearchParams(location.search);
  const base = qs.get('base') || 'https://guizzi.server.silvus.me';
  const username = (qs.get('username') || qs.get('user') || 'freekadelle_').trim();
  return { base, username };
}

export function toWsUrl(httpBase) {
  try {
    const u = new URL(httpBase);
    u.protocol = (u.protocol === 'https:') ? 'wss:' : 'ws:';
    u.pathname = '/';
    u.search = '';
    u.hash = '';
    return u.toString().replace(/\/$/, '');
  } catch {
    return (httpBase || '').replace(/^https?:/i, (m) => m.toLowerCase() === 'https:' ? 'wss:' : 'ws:').replace(/\/$/, '');
  }
}

export function getWsUrl(base) {
  return toWsUrl(base) + '/?id=tv';
}

// Default intervals (ms)
export const DEFAULT_PING_INTERVAL = 30000;    // 30s
export const DEFAULT_SCRAPE_INTERVAL = 120000; // 120s
