export const BASE = 'http://localhost:4000';

export const qs = (params = {}) => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : '';
};

//token assistants 
export const getToken = () => localStorage.getItem('token') || '';

export function setToken(t) {
  localStorage.removeItem('noRefresh');
  localStorage.setItem('token', t);
  window.dispatchEvent(new CustomEvent('auth:token', { detail: t }));
}

export function clearToken() {
  localStorage.removeItem('token');
  window.dispatchEvent(new CustomEvent('auth:token', { detail: '' }));
}

export const req = async (path, options = {}) => {
  const {
    method = 'GET',
    headers: extraHeaders = {},
    body: rawBody,
    retry = true,
    attachAuth = true,
    withCredentials,
  } = options;

  const token = getToken();
  const hadToken = !!token;
  const noRefreshFlag = localStorage.getItem('noRefresh') === '1';
  const isFormData = typeof FormData !== 'undefined' && rawBody instanceof FormData;

  const baseHeaders = isFormData
    ? {}
    : { 'Content-Type': 'application/json', Accept: 'application/json' };
  const authHeader =
    attachAuth && token ? { Authorization: `Bearer ${token}` } : {};

  const headers = {
    ...baseHeaders,
    ...authHeader,
    ...extraHeaders,
  };

  const body =
    isFormData
      ? rawBody
      : (typeof rawBody === 'string' || rawBody == null
          ? rawBody
          : JSON.stringify(rawBody));

  const t = token;
console.log('[req]', method, path, {
  hasToken: !!t,
  authHeader: attachAuth && t ? `Bearer ${t.slice(0,12)}…` : 'none',
});
  const sendCreds = typeof withCredentials !== 'undefined'
    ? withCredentials
    : hadToken && !noRefreshFlag;

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body,
      credentials: 'include',
     credentials: sendCreds ? 'include' : 'same-origin',
    });
  if (res.status === 401 && retry && attachAuth && hadToken && !noRefreshFlag) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      return req(path, { method, headers: extraHeaders, body: rawBody, retry: false, attachAuth });
    }
    clearToken();
  }


   const ct = res.headers.get('content-type') || '';
   const text = await res.text().catch(() => '');
   let json = null;
   if (ct.includes('application/json') && text) {
     try { json = JSON.parse(text); } catch (_) {}
   }
 
   if (!res.ok) {
     const message =
       (json && (json.message || json.error)) ||
       (text || `${res.status} ${res.statusText || 'Error'}`);
 
     const err = new Error(message);
     err.status = res.status;
     err.statusText = res.statusText;
     err.url = `${BASE}${path}`;
     err.method = method;
     err.body = json ?? text;
 
     console.error('API error:', {
       status: res.status,
       url: err.url,
       method,
       message,
       body: err.body,
     });
 
     if (res.status === 401 && retry && attachAuth && hadToken && !noRefreshFlag) {
       const refreshed = await tryRefreshAccessToken();
       if (refreshed) {
         return req(path, { method, headers: extraHeaders, body: rawBody, retry: false, attachAuth });
       }
       clearToken();
     }
 
     throw err;
   }
 
   if (res.status === 204 || text === '') return null;
   return json ?? { data: text };
 };

async function tryRefreshAccessToken() {
  if (localStorage.getItem('noRefresh') === '1') return false;
  try {
    const r = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!r.ok) return false;
    const data = await r.json().catch(() => null);
    if (data && data.accessToken) {
      setToken(data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default { req, qs, getToken, setToken, clearToken };
