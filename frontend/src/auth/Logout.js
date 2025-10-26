import { req, clearToken } from '../common/APIUtils';

export async function logoutUser() {
  try {
    await fetch('http://localhost:4000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {
    console.warn('Logout request failed (continuing)', e);
  } finally {
    clearToken();
    localStorage.setItem('noRefresh', '1');
  }
}