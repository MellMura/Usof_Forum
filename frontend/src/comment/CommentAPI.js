import { req } from '../common/APIUtils';

export async function createComment(postId, content, parent = null) {
  const body = parent ? { content, parent_id: parent } : { content };
  
  return req(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body,
  });
}

export async function getComment(commentId) {
  return req(`/api/comments/${commentId}`);
}

export async function updateComment(commentId, { content, locked } = {}) {
  const body = {};

  if (typeof content !== 'undefined') body.content = content;
  if (typeof locked !== 'undefined') body.locked = locked;

  return req(`/api/comments/${commentId}`, {
    method: 'PATCH',
    body,
  });
}

export async function updateCommentAdmin(commentId, { locked, status } = {}) {
  const body = {};
  if (typeof locked !== 'undefined') body.locked = locked;
  if (typeof status !== 'undefined') body.status = status;

  return req(`/api/comments/${commentId}/admin`, {
    method: 'PATCH',
    body,
  });
}

export async function toggleCommentLock(commentId, locked) {
  return updateComment(commentId, { locked });
}

export async function toggleCommentLockAdmin(commentId, locked) {
  return updateCommentAdmin(commentId, { locked });
}

export async function toggleCommentStatusAdmin(commentId, status) {
  return updateCommentAdmin(commentId, { status });
}

export async function listAllComments(params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  }
  return req(`/api/comments?${q.toString()}`);
}

export async function deleteComment(commentId) {
  return req(`/api/comments/${commentId}`, { method: 'DELETE' });
}
