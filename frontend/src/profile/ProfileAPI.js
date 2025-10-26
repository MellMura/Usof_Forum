import { req, qs } from '../common/APIUtils';

export async function uploadAvatar(file) {
  if (!(file instanceof File)) throw new Error('No file selected');

  const fd = new FormData();
  fd.append('avatar', file);

  return req('/api/users/avatar', {
    method: 'PATCH',
    body: fd,
  });
}

export async function deleteUserAvatar(userId) {
  if (!Number.isFinite(Number(userId))) throw new Error('Invalid user id');
  return req(`/api/users/${userId}/avatar`, { method: 'DELETE' });
}

export async function updateUser(userId, payload) {
  if (!Number.isFinite(Number(userId))) throw new Error('User id is required');
  
  return req(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
}

export async function uploadUserAvatarAdmin(userId, file) {
  const fd = new FormData();
  fd.append('avatar', file);
  return req(`/api/users/${userId}/avatar`, {
    method: 'POST',
    body: fd,
  });
}

export async function createUser(body) {
  return req('/api/users', { method: 'POST', body });
}

export async function deleteUser(userId) {
  if (!Number.isFinite(Number(userId))) throw new Error('User id is required');
  return req(`/api/users/${userId}`, { method: 'DELETE' });
}

export async function getUser(id) {
  if (id == null) throw new Error('User id is required');
  return req(`/api/users/${id}`);
}

export async function getUserPosts(userId) {
  if (userId == null) throw new Error('User id is required');
  const params = qs({ page: 1, limit: 20, author_id: userId });
  const data = await req(`/api/posts${params}`);
  return Array.isArray(data) ? data : (data.items || []);
}

export async function getBlockStatus(targetId) {
  if (targetId == null) throw new Error('Target id is required');
 
  try {
    const res = await req(`/api/users/${targetId}/block`, { method: 'GET' });

    return { blocked: !!res.blocked };
  } catch {
    return { blocked: false };
  }
}


export async function blockUser(targetId) {
  if (targetId == null) throw new Error('Target id is required');

  return req(`/api/users/${targetId}/block`, { method: 'POST' });
}


export async function unblockUser(targetId) {
  if (targetId == null) throw new Error('Target id is required');
  
  await req(`/api/users/${targetId}/block`, { method: 'DELETE' });
  return true;
}
