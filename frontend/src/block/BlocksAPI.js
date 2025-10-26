import { req } from '../common/APIUtils';

export async function listBlockedUsers() {
  return req('/api/blocks');
}

export async function blockUser(targetId) {
  await req(`/api/users/${targetId}/block`, { method: 'POST' });
  return true;
}

export async function unblockUser(targetId) {
  await req(`/api/users/${targetId}/block`, { method: 'DELETE' });
  return true;
}
