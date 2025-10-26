import { req } from '../common/APIUtils';

export const listCategories = () => req('/api/categories');

export async function createCategory(body) {
  return req(`/api/categories`, { method: 'POST', body });
}

export const updateCategory = (id, body) =>
  req(`/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });

export const deleteCategory = (id) =>
  req(`/api/categories/${id}`, { method: 'DELETE' });