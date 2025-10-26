import { getToken, BASE } from '../common/APIUtils';
import React, { useEffect, useState } from 'react';

function decodeJWT(token) {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}


export function useAuthUser() {
  const [user, setUser] = React.useState(null);

  const load = React.useCallback(async () => {
    const t = getToken();
    if (!t) { setUser(null); return; }
    const p = decodeJWT(t);
    if (!p || (p.exp && p.exp * 1000 < Date.now())) { setUser(null); return; }

    setUser({ id: p.id, login: p.login, status: p.status });

    const full = await fetchMe();
    console.log('[useAuthUser] /me response:', full);
    if (full) setUser(full);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    const onToken = () => load();
    const onStorage = (e) => { if (e.key === 'token') load(); };
    window.addEventListener('auth:token', onToken);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth:token', onToken);
      window.removeEventListener('storage', onStorage);
    };
  }, [load]);

  return user;
}
async function fetchMe() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}
