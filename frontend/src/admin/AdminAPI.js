import { req } from '../common/APIUtils';

export async function createUserAdmin(body) {
  return req(`/api/users`, { method: 'POST', body });
}

export async function listUsers({ page = 1, limit = 50, sort = 'id', order = 'desc' } = {}) {
  const q = new URLSearchParams();
  if (page != null)  q.set('page', String(page));
  if (limit != null) q.set('limit', String(limit));
  if (sort) q.set('sort', sort);
  if (order) q.set('order', order);
  
  return req(`/api/users?${q.toString()}`);
}

export async function listCategories() {
  return req(`/api/categories`);
}